import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { assertAllowedMedia, presignUpload } from '@/lib/r2';

const bodySchema = z.object({
  fileName: z.string().min(1).max(200),
  contentType: z.string().min(1).max(100),
  sizeBytes: z.number().int().positive(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from('admin_users')
    .select('restaurant_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: 'الحساب غير مرتبط بمطعم' }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 });
  }

  let kind: 'image' | 'video';
  try {
    kind = assertAllowedMedia(parsed.data.contentType, parsed.data.sizeBytes);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ملف غير مدعوم' },
      { status: 400 },
    );
  }

  // The key is derived from the session's restaurant_id, never from the
  // request body, so an admin can only ever write into their own prefix.
  const extension = parsed.data.fileName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = `${membership.restaurant_id}/${kind}s/${crypto.randomUUID()}${extension ? `.${extension}` : ''}`;

  try {
    const { uploadUrl, publicUrl } = await presignUpload({
      key,
      contentType: parsed.data.contentType,
    });
    return NextResponse.json({ uploadUrl, publicUrl });
  } catch {
    return NextResponse.json({ error: 'خدمة الرفع غير مهيأة' }, { status: 500 });
  }
}
