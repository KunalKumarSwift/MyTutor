import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/** 256-bit random, URL-safe session token. Only ever sent to the client in a cookie. */
export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Hash persisted in the database so a leaked sessions table cannot be replayed. */
export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** CSRF token bound to the session: HMAC(secret, session token). No server storage needed. */
export function deriveCsrfToken(secret: string, sessionToken: string): string {
  return createHmac('sha256', secret).update(`csrf:${sessionToken}`).digest('base64url');
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
