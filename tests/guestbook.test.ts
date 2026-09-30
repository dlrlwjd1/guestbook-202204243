import { afterAll, beforeAll, expect, test } from 'vitest';
import { createEntry, listEntries, updateEntry, deleteEntry } from '../lib/guestbook';
import { closeDatabase } from '../lib/db';
beforeAll(() => {
  delete process.env.DATABASE_URL;
  process.env.LOCAL_DATABASE_PATH = 'memory://';
});
afterAll(async () => {
  await closeDatabase();
});
test('이름·메시지·작성 시각을 저장하고 최신순 목록에 비밀 정보 없이 표시한다', async () => {
  const first = await createEntry({
    name: '첫 방문자',
    message: '반갑습니다!',
    password: 'test-password',
  });
  const second = await createEntry({
    name: '  이기정  ',
    message: '  안녕하세요.\n좋은 하루 되세요!  ',
    password: 'test-password',
  });
  const entries = await listEntries();
  expect(entries.slice(0, 2).map((entry) => entry.id)).toEqual([second.id, first.id]);
  expect(entries[0]).toMatchObject({ name: '이기정', message: '안녕하세요.\n좋은 하루 되세요!' });
  expect(Number.isNaN(Date.parse(entries[0].createdAt))).toBe(false);
  expect(Object.keys(entries[0]).sort()).toEqual([
    'createdAt',
    'id',
    'message',
    'name',
    'updatedAt',
  ]);
});

test('잘못된 비밀번호는 수정을 거부하고 올바른 비밀번호는 메시지만 수정한다', async () => {
  const original = await createEntry({
    name: '수정 작성자',
    message: '수정 전',
    password: 'correct-pass',
  });
  await expect(
    updateEntry(original.id, { message: '잘못된 수정', password: 'wrong-pass' }),
  ).rejects.toMatchObject({ status: 403 });
  expect((await listEntries()).find((e) => e.id === original.id)?.message).toBe('수정 전');
  const updated = await updateEntry(original.id, { message: '수정 후', password: 'correct-pass' });
  expect(updated).toMatchObject({
    name: original.name,
    createdAt: original.createdAt,
    message: '수정 후',
  });
  expect(updated.updatedAt).not.toBeNull();
});

test('틀린 비밀번호로 삭제할 수 없고 맞는 비밀번호로만 삭제한다', async () => {
  const original = await createEntry({
    name: '삭제 작성자',
    message: '삭제 테스트',
    password: 'delete-pass',
  });
  await expect(deleteEntry(original.id, { password: 'wrong-pass' })).rejects.toMatchObject({
    status: 403,
  });
  expect((await listEntries()).some((e) => e.id === original.id)).toBe(true);
  await deleteEntry(original.id, { password: 'delete-pass' });
  expect((await listEntries()).some((e) => e.id === original.id)).toBe(false);
});

test('입력 범위를 서버에서 검증하며 공백뿐인 이름과 메시지를 허용하지 않는다', async () => {
  const valid = { name: '작성자', message: '테스트', password: '1234' };
  await expect(createEntry({ ...valid, name: '  ' })).rejects.toMatchObject({ status: 400 });
  await expect(createEntry({ ...valid, message: '  ' })).rejects.toMatchObject({ status: 400 });
  await expect(createEntry({ ...valid, message: '가'.repeat(1001) })).rejects.toMatchObject({
    status: 400,
  });
  await expect(createEntry({ ...valid, password: '123' })).rejects.toMatchObject({ status: 400 });
  await expect(createEntry({ ...valid, password: 'a'.repeat(129) })).rejects.toMatchObject({
    status: 400,
  });
});
test('메시지를 수정해도 생성 순서가 바뀌지 않고 다른 글 비밀번호는 권한을 주지 않는다', async () => {
  const older = await createEntry({
    name: '이전',
    message: '먼저 남긴 글',
    password: 'older-pass',
  });
  const newer = await createEntry({
    name: '이후',
    message: '나중에 남긴 글',
    password: 'newer-pass',
  });
  await expect(
    updateEntry(newer.id, { message: '해킹', password: 'older-pass' }),
  ).rejects.toMatchObject({ status: 403 });
  await updateEntry(older.id, { message: '먼저 남긴 글 수정', password: 'older-pass' });
  const entries = await listEntries();
  expect(entries.findIndex((e) => e.id === newer.id)).toBeLessThan(
    entries.findIndex((e) => e.id === older.id),
  );
});
test('존재하지 않거나 삭제된 글은 404로 안내한다', async () => {
  await expect(
    updateEntry('not-an-id', { message: '내용', password: 'password' }),
  ).rejects.toMatchObject({ status: 404 });
  await expect(deleteEntry(crypto.randomUUID(), { password: 'password' })).rejects.toMatchObject({
    status: 404,
  });
});
test('비밀번호의 공백을 보존하고 SQL 문자열은 안전한 일반 텍스트로 저장한다', async () => {
  const entry = await createEntry({
    name: "O'Reilly",
    message: "'); DROP TABLE guestbook_entries; --",
    password: '  pass  ',
  });
  await expect(deleteEntry(entry.id, { password: 'pass' })).rejects.toMatchObject({ status: 403 });
  expect((await listEntries()).find((e) => e.id === entry.id)?.message).toBe(
    "'); DROP TABLE guestbook_entries; --",
  );
  await deleteEntry(entry.id, { password: '  pass  ' });
});
