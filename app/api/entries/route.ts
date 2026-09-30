import { createEntry, listEntries } from '@/lib/guestbook';
import { errorResponse, json, limitRequests, readBody } from '@/lib/http';
export const runtime = 'nodejs';
export async function GET() {
  try {
    return json({ entries: await listEntries() });
  } catch (error) {
    return errorResponse(error);
  }
}
export async function POST(request: Request) {
  try {
    const input = await readBody(request);
    await limitRequests(request, 'create');
    return json({ entry: await createEntry(input) }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
