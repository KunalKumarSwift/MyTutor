// Writes .br and .gz siblings for compressible build output so the API can serve them
// directly (@fastify/static `preCompressed`), avoiding per-request compression work.
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const COMPRESSIBLE = /\.(js|mjs|css|html|svg|json|txt|map)$/;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

let count = 0;
let before = 0;
let after = 0;
for await (const file of walk(dist)) {
  if (!COMPRESSIBLE.test(file) || file.endsWith('.map')) continue;
  if ((await stat(file)).size < 1024) continue;
  const content = await readFile(file);
  const br = brotliCompressSync(content, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } });
  await writeFile(`${file}.br`, br);
  await writeFile(`${file}.gz`, gzipSync(content, { level: 9 }));
  count++;
  before += content.length;
  after += br.length;
}
console.log(
  `precompressed ${count} files: ${(before / 1024).toFixed(0)} KiB → ${(after / 1024).toFixed(0)} KiB (brotli)`,
);
