import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const bodySchema = z.object({
  slug: z.string().min(1).max(200),
  secret: z.string().min(1),
});

/**
 * Purges a restaurant's cached public page on demand.
 *
 * In-app edits already revalidate via the server actions in
 * lib/actions/*. This endpoint exists for changes made outside the
 * dashboard — a bulk menu import run directly against Postgres, for
 * example — so the operator doesn't have to wait out the ISR window.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Revalidation is not configured.' }, { status: 500 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (parsed.data.secret !== secret) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  revalidatePath(`/${parsed.data.slug}`);
  return NextResponse.json({ revalidated: true, slug: parsed.data.slug });
}
