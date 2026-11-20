import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { rsvpSchema } from '@/lib/validators';
import type { PublicGuest } from '@/types/guest';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(req: Request, context: RouteContext) {
  try {
    // 1. Rate limiter: tối đa 20 requests / 10 phút theo IP
    const clientIp = getClientIp(req);
    const limitResult = checkRateLimit(`rsvp:${clientIp}`, 20, 10 * 60 * 1000);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau ít phút.' },
        { status: 429 }
      );
    }

    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json({ error: 'Đường dẫn thiệp mời không hợp lệ' }, { status: 400 });
    }

    // 2. Validate payload bằng Zod
    const body = await req.json().catch(() => null);
    const validation = rsvpSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Dữ liệu xác nhận không hợp lệ';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = validation.data;

    // 3. Tìm khách mời trong DB
    const { data: guest, error: findError } = await supabaseAdmin
      .from('guests')
      .select('id, opened_at')
      .eq('slug', slug)
      .single();

    if (findError || !guest) {
      return NextResponse.json({ error: 'Không tìm thấy thiệp mời' }, { status: 404 });
    }

    // 4. Áp dụng State Machine:
    // - ACCEPTED: attendees_count (1..4), song_request, wish_message, responded_at = NOW
    // - DECLINED: attendees_count = 0, song_request = null, wish_message, responded_at = NOW
    const now = new Date().toISOString();
    const isAccepted = data.status === 'ACCEPTED';

    const updatePayload = {
      status: data.status,
      attendees_count: isAccepted ? (data.attendees_count ?? 1) : 0,
      song_request: isAccepted ? (data.song_request?.trim() || null) : null,
      wish_message: data.wish_message?.trim() || null,
      responded_at: now,
      opened_at: guest.opened_at || now,
    };

    const { data: updatedGuest, error: updateError } = await supabaseAdmin
      .from('guests')
      .update(updatePayload)
      .eq('id', guest.id)
      .select('slug, full_name, custom_message, status, attendees_count, song_request, wish_message, responded_at')
      .single();

    if (updateError || !updatedGuest) {
      return NextResponse.json(
        { error: 'Không thể lưu phản hồi của bạn', details: updateError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      guest: updatedGuest as PublicGuest,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ', details: (err as Error).message },
      { status: 500 }
    );
  }
}
