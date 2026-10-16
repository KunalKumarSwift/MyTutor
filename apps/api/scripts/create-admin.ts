/**
 * Provisions (or resets) an administrator account. Safe for production use.
 *
 *   npm run admin:create -- --username alice --name "Alice Doe" --email alice@example.org
 *
 * The password is read from the MYTUTOR_ADMIN_PASSWORD environment variable or prompted for
 * interactively (input hidden), so it never appears in shell history or process listings.
 * Resetting an existing account's password revokes all of its sessions.
 */
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline';
import { createPrismaClient } from '../src/infrastructure/database/prisma.js';
import { Argon2PasswordHasher, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../src/shared/security/password-hasher.js';

async function promptHidden(question: string): Promise<string> {
  if (!process.stdin.isTTY) throw new Error('No TTY available: set MYTUTOR_ADMIN_PASSWORD instead.');
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  const output = rl as unknown as { _writeToOutput: (s: string) => void };
  let muted = false;
  output._writeToOutput = (s: string) => {
    if (!muted || s.includes(question)) process.stdout.write(s);
  };
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
    muted = true;
  });
}

async function main() {
  const { values } = parseArgs({
    options: {
      username: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string' },
    },
  });
  const username = values.username?.trim().toLowerCase();
  if (!username || !/^[a-z0-9._-]{3,50}$/.test(username)) {
    throw new Error('Provide --username (3–50 chars: letters, digits, ".", "_" or "-").');
  }
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) throw new Error('DATABASE_URL must be set.');

  const password = process.env['MYTUTOR_ADMIN_PASSWORD'] ?? (await promptHidden('New administrator password: '));
  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    throw new Error(`Password must be ${PASSWORD_MIN_LENGTH}–${PASSWORD_MAX_LENGTH} characters.`);
  }

  const db = createPrismaClient(databaseUrl);
  try {
    const passwordHash = await new Argon2PasswordHasher().hash(password);
    const existing = await db.user.findUnique({ where: { username } });
    if (existing) {
      await db.$transaction([
        db.user.update({ where: { id: existing.id }, data: { passwordHash, role: 'ADMIN', status: 'ACTIVE' } }),
        db.session.deleteMany({ where: { userId: existing.id } }),
      ]);
      console.log(`Updated "${username}": role ADMIN, active, password reset, sessions revoked.`);
    } else {
      await db.user.create({
        data: {
          username,
          passwordHash,
          role: 'ADMIN',
          name: values.name?.trim() || username,
          email: values.email?.trim().toLowerCase() || null,
        },
      });
      console.log(`Created administrator "${username}".`);
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
