import { loadEnvConfig } from '@next/env';
import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';
loadEnvConfig(process.cwd());
async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED;
  if (!url) throw new Error('마이그레이션용 DATABASE_URL_UNPOOLED가 필요합니다.');
  if (new URL(url).hostname.includes('-pooler'))
    throw new Error('마이그레이션에는 direct 연결을 사용해 주세요.');
  const sql = neon(url);
  const statements = (await readFile('db/schema.sql', 'utf8'))
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  await sql.transaction(statements.map((statement) => sql.query(statement)));
  console.log('Guestbook schema migration completed.');
}
main().catch((error) => {
  console.error(
    error instanceof Error
      ? error.message.replace(/postgres(?:ql)?:\/\/\S+/g, '[REDACTED]')
      : 'Migration failed',
  );
  process.exitCode = 1;
});
