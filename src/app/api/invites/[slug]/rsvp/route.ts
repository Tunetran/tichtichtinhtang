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
      if (
        slug === 'demo' ||
        slug === 'thay-co' ||
        !process.env.SUPABASE_URL ||
        process.env.SUPABASE_URL.includes('placeholder')
      ) {
        return NextResponse.json({
          ok: true,
          guest: {
            slug,
            full_name: slug === 'thay-co' ? 'Quý Thầy/Cô' : 'Quý Khách Mời',
            custom_message: null,
            status: data.status,
            attendees_count: data.status === 'ACCEPTED' ? (data.attendees_count ?? 1) : 0,
            song_request: data.song_request?.trim() || null,
            wish_message: data.wish_message?.trim() || null,
            responded_at: new Date().toISOString(),
          } as PublicGuest,
        });
      }
      return NextResponse.json({ error: 'Không tìm thấy thiệp mời' }, { status: 404 });
    }

    // 4. Áp dụng State Machine:
    // - ACCEPTED: attendees_count (1..4), song_request, wish_message, responded_at = NOW
    // - DECLINED: attendees_count = 0, song_request = null, wish_message, responded_at = NOW
    const now = new Date().toISOString();
    const isAccepted = data.status === 'ACCEPTED';
    const phone = data.phone?.trim() || null;
    const email = data.email?.trim() || null;

    // Đóng gói JSON an toàn vào wish_message để tương thích với mọi bản backup / DB
    let wishToSave = data.wish_message?.trim() || null;
    if (phone || email) {
      const contactPayload = {
        phone: phone || '',
        email: email || '',
        note: wishToSave || '',
      };
      wishToSave = JSON.stringify(contactPayload);
    }

    const updatePayload: Record<string, unknown> = {
      status: data.status,
      attendees_count: isAccepted ? (data.attendees_count ?? 1) : 0,
      song_request: isAccepted ? (data.song_request?.trim() || null) : null,
      wish_message: wishToSave,
      responded_at: now,
      opened_at: guest.opened_at || now,
    };

    if (phone) updatePayload.phone = phone;
    if (email) updatePayload.email = email;

    let { data: updatedGuest, error: updateError } = await supabaseAdmin
      .from('guests')
      .update(updatePayload)
      .eq('id', guest.id)
      .select('slug, full_name, custom_message, status, attendees_count, song_request, wish_message, responded_at')
      .single();

    // Fallback nếu database Supabase cũ chưa có cột phone hoặc email
    if (updateError && (updateError.message.includes('phone') || updateError.message.includes('email'))) {
      delete updatePayload.phone;
      delete updatePayload.email;
      const retry = await supabaseAdmin
        .from('guests')
        .update(updatePayload)
        .eq('id', guest.id)
        .select('slug, full_name, custom_message, status, attendees_count, song_request, wish_message, responded_at')
        .single();
      updatedGuest = retry.data;
      updateError = retry.error;
    }

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
