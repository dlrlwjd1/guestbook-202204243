import { query } from './db';
import {
  AppError,
  createInput,
  deleteInput,
  editInput,
  parseInput,
  validateId,
} from './validation';
import { hashPassword, verifyPassword } from './password';
import type { Entry } from './types';
type EntryRow = {
  id: string;
  name: string;
  message: string;
  created_at: Date | string;
  updated_at: Date | string | null;
};
const publicColumns = 'id, name, message, created_at, updated_at';
function entry(row: EntryRow): Entry {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}
export async function listEntries(): Promise<Entry[]> {
  return (
    await query<EntryRow>(
      `SELECT ${publicColumns} FROM guestbook_entries ORDER BY created_at DESC, id DESC`,
    )
  ).map(entry);
}
export async function createEntry(input: unknown): Promise<Entry> {
  const { name, message, password } = parseInput(createInput, input);
  const hash = await hashPassword(password);
  const [row] = await query<EntryRow>(
    `INSERT INTO guestbook_entries (name, message, password_hash) VALUES ($1, $2, $3) RETURNING ${publicColumns}`,
    [name, message, hash],
  );
  if (!row) throw new AppError(500, '글을 저장하지 못했습니다. 다시 시도해 주세요.');
  return entry(row);
}

async function authorizeEntry(id: string, password: string) {
  validateId(id);
  const [row] = await query<{ password_hash: string }>(
    'SELECT password_hash FROM guestbook_entries WHERE id = $1',
    [id],
  );
  if (!row) throw new AppError(404, '글을 찾을 수 없습니다. 이미 삭제되었을 수 있어요.');
  if (!(await verifyPassword(password, row.password_hash)))
    throw new AppError(403, '비밀번호가 일치하지 않습니다. 다시 확인해 주세요.');
}
export async function updateEntry(id: string, input: unknown): Promise<Entry> {
  const { message, password } = parseInput(editInput, input);
  await authorizeEntry(id, password);
  const [row] = await query<EntryRow>(
    `UPDATE guestbook_entries SET message = $1, updated_at = clock_timestamp() WHERE id = $2 RETURNING ${publicColumns}`,
    [message, id],
  );
  if (!row) throw new AppError(404, '글을 찾을 수 없습니다. 이미 삭제되었을 수 있어요.');
  return entry(row);
}

export async function deleteEntry(id: string, input: unknown): Promise<void> {
  const { password } = parseInput(deleteInput, input);
  await authorizeEntry(id, password);
  const rows = await query('DELETE FROM guestbook_entries WHERE id = $1 RETURNING id', [id]);
  if (!rows.length) throw new AppError(404, '글을 찾을 수 없습니다. 이미 삭제되었을 수 있어요.');
}
