import assert from 'node:assert/strict';
import { createEntry, deleteEntry, listEntries, updateEntry } from '../lib/guestbook';
async function main() {
  if (!process.env.DATABASE_URL) throw new Error('A Neon test branch DATABASE_URL is required.');
  const password = crypto.randomUUID();
  const entry = await createEntry({
    name: '배포 전 자동 검증',
    message: 'Neon CRUD verification',
    password,
  });
  try {
    assert.equal(
      (await listEntries()).find((item) => item.id === entry.id)?.message,
      'Neon CRUD verification',
    );
    await assert.rejects(
      updateEntry(entry.id, { message: 'Unauthorized', password: 'incorrect' }),
      { status: 403 },
    );
    await assert.rejects(deleteEntry(entry.id, { password: 'incorrect' }), { status: 403 });
    const changed = await updateEntry(entry.id, { message: 'Neon update verified', password });
    assert.equal(changed.message, 'Neon update verified');
    assert.equal(changed.createdAt, entry.createdAt);
    assert.deepEqual(Object.keys(changed).sort(), [
      'createdAt',
      'id',
      'message',
      'name',
      'updatedAt',
    ]);
  } finally {
    await deleteEntry(entry.id, { password });
  }
  assert.equal(
    (await listEntries()).some((item) => item.id === entry.id),
    false,
  );
  console.log(
    'Neon verified: create, read, wrong-password update/delete rejection, update, delete. Test entry removed.',
  );
}
main().catch((error) => {
  console.error(
    error instanceof Error
      ? error.message.replace(/postgres(?:ql)?:\/\/\S+/g, '[REDACTED]')
      : 'Verification failed',
  );
  process.exitCode = 1;
});
