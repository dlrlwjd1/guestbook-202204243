import { listEntries } from '@/lib/guestbook';
import { Guestbook } from '@/components/guestbook';
import type { Entry } from '@/lib/types';
export const dynamic = 'force-dynamic';
export default async function Home() {
  let entries: Entry[] = [];
  let error = '';
  try {
    entries = await listEntries();
  } catch {
    error = '방명록을 불러오지 못했어요. 잠시 후 새로고침해 주세요.';
  }
  return <Guestbook initialEntries={entries} initialError={error} />;
}
