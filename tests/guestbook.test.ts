import { afterAll, beforeAll, expect, test } from 'vitest';
import { createEntry, listEntries } from '../lib/guestbook';
import { closeDatabase } from '../lib/db';
beforeAll(() => { process.env.LOCAL_DATABASE_PATH = 'memory://'; });
afterAll(async () => { await closeDatabase(); });
test('이름·메시지·작성 시각을 저장하고 최신순 목록에 비밀 정보 없이 표시한다', async () => {
  const first = await createEntry({ name: '첫 방문자', message: '반갑습니다!', password: 'test-password' });
  const second = await createEntry({ name: '  이기정  ', message: '  안녕하세요.\n좋은 하루 되세요!  ', password: 'test-password' });
  const entries = await listEntries();
  expect(entries.slice(0, 2).map(entry => entry.id)).toEqual([second.id, first.id]);
  expect(entries[0]).toMatchObject({ name: '이기정', message: '안녕하세요.\n좋은 하루 되세요!' });
  expect(Number.isNaN(Date.parse(entries[0].createdAt))).toBe(false);
  expect(Object.keys(entries[0]).sort()).toEqual(['createdAt', 'id', 'message', 'name', 'updatedAt']);
});
