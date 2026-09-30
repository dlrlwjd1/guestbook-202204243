import { deleteEntry, updateEntry } from '@/lib/guestbook';
import { errorResponse, json, limitRequests, readBody } from '@/lib/http';
export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  try {
    const input = await readBody(request);
    await limitRequests(request, 'manage');
    return json({ entry: await updateEntry((await context.params).id, input) });
  } catch (error) {
    return errorResponse(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    const input = await readBody(request);
    await limitRequests(request, 'manage');
    await deleteEntry((await context.params).id, input);
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
