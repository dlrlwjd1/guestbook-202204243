import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt);
  return `scrypt:${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password: string, hash: string) {
  const [algorithm, salt, encoded] = hash.split(':');
  if (algorithm !== 'scrypt' || !salt || !encoded || !/^[a-f0-9]{128}$/.test(encoded)) return false;
  return timingSafeEqual(await derive(password, salt), Buffer.from(encoded, 'hex'));
}
