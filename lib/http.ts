import { createHash } from 'node:crypto';
import { AppError } from './validation';
import { query } from './db';
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}
export function errorResponse(error: unknown) {
  if (error instanceof AppError) return json({ error: error.message }, error.status);
  console.error('Guestbook request failed:', error instanceof Error ? error.name : 'UnknownError');
  return json({ error: '연결이 잠시 원활하지 않습니다. 조금 후 다시 시도해 주세요.' }, 500);
}
export async function readBody(request: Request) {
  const origin = request.headers.get('origin');
  if (origin) {
    let originUrl: URL;
    try {
      originUrl = new URL(origin);
    } catch {
      throw new AppError(403, '허용되지 않은 요청입니다.');
    }
    // Next.js may normalize request.url to localhost behind its dev/proxy server.
    const publicHost = request.headers.get('host') || new URL(request.url).host;
    if (
      originUrl.host !== publicHost ||
      !['http:', 'https:'].includes(originUrl.protocol) ||
      (process.env.VERCEL && originUrl.protocol !== 'https:')
    ) {
      throw new AppError(403, '허용되지 않은 요청입니다.');
    }
  }
  if (!request.headers.get('content-type')?.includes('application/json'))
    throw new AppError(415, 'JSON 형식이 필요합니다.');
  // Read incrementally so the limit also applies to requests without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) throw new AppError(400, '입력 내용을 확인해 주세요.');
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 16000) {
      await reader.cancel();
      throw new AppError(413, '입력 내용이 너무 깁니다.');
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new AppError(400, '입력 내용을 확인해 주세요.');
  }
}
export async function limitRequests(request: Request, action: 'create' | 'manage') {
  const address = process.env.VERCEL
    ? request.headers.get('x-vercel-forwarded-for') || 'unknown'
    : 'local';
  const key = createHash('sha256').update(`${action}:${address}`).digest('hex');
  const [row] = await query<{ attempts: number }>(
    `INSERT INTO guestbook_rate_limits (key) VALUES ($1)
    ON CONFLICT (key) DO UPDATE SET
    attempts = CASE WHEN guestbook_rate_limits.window_start < now() - interval '1 minute' THEN 1 ELSE guestbook_rate_limits.attempts + 1 END,
    window_start = CASE WHEN guestbook_rate_limits.window_start < now() - interval '1 minute' THEN now() ELSE guestbook_rate_limits.window_start END
    RETURNING attempts`,
    [key],
  );
  if (row.attempts > (action === 'create' ? 15 : 30))
    throw new AppError(429, '요청이 많습니다. 1분 후 다시 시도해 주세요.');
}
