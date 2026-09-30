import { neon } from '@neondatabase/serverless';
import { PGlite } from '@electric-sql/pglite';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

type DatabaseGlobal = typeof globalThis & { guestbookDbReady?: Promise<PGlite> };
const globalDb = globalThis as DatabaseGlobal;
async function localDatabase() {
  if (process.env.VERCEL) throw new Error('Vercel에 DATABASE_URL 환경변수가 필요합니다.');
  if (!globalDb.guestbookDbReady) {
    globalDb.guestbookDbReady = (async () => {
      const location = process.env.LOCAL_DATABASE_PATH || '.local-data/guestbook';
      if (location !== 'memory://')
        await mkdir(path.dirname(path.resolve(/* turbopackIgnore: true */ location)), { recursive: true });
      const db = new PGlite(location);
      await db.exec(await readFile(path.join(process.cwd(), 'db/schema.sql'), 'utf8'));
      return db;
    })().catch((error) => {
      delete globalDb.guestbookDbReady;
      throw error;
    });
  }
  return globalDb.guestbookDbReady;
}
export async function query<T extends Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (process.env.DATABASE_URL)
    return (await neon(process.env.DATABASE_URL).query(sql, params)) as T[];
  return (await (await localDatabase()).query<T>(sql, params)).rows;
}
export async function closeDatabase() {
  if (globalDb.guestbookDbReady) await (await globalDb.guestbookDbReady).close();
  delete globalDb.guestbookDbReady;
}
