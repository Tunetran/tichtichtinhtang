import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { rsvpSchema } from '@/lib/validators';
import { z } from 'zod';
import type { PublicGuest } from '@/types/guest';

export const dynamic = 'force-dynamic';

const globalRsvpSchema = rsvpSchema.and(
  z.object({
    slug: z.string().min(1, 'Đường dẫn thiệp mời không được để trống'),
  })
);

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const limitResult = checkRateLimit(`rsvp:${clientIp}`, 20, 10 * 60 * 1000);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau ít phút.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const validation = globalRsvpSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Dữ liệu xác nhận không hợp lệ';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = validation.data;
    const slug = data.slug;

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
            attendees_count: data.status === 'ACCEPTED' ? (data.guests_count ?? data.attendees_count ?? 1) : 0,
            song_request: data.song_request?.trim() || null,
            wish_message: data.wish_message?.trim() || null,
            responded_at: new Date().toISOString(),
          } as PublicGuest,
        });
      }
      return NextResponse.json({ error: 'Không tìm thấy thiệp mời' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const isAccepted = data.status === 'ACCEPTED';
    const phone = data.phone?.trim() || null;
    const email = data.email?.trim() || null;
    const count = isAccepted ? (data.guests_count ?? data.attendees_count ?? 1) : 0;

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
      attendees_count: count,
      guests_count: count,
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

    if (updateError && updateError.message?.toLowerCase().includes('guests_count')) {
      delete updatePayload.guests_count;
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
        { error: 'Lỗi khi lưu phản hồi RSVP', details: updateError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      guest: updatedGuest as PublicGuest,
      message: isAccepted
        ? 'Xác nhận tham dự thành công! Hẹn gặp lại bạn tại đêm nhạc!'
        : 'Cảm ơn phản hồi của bạn!',
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi xử lý yêu cầu xác nhận', details: (err as Error).message },
      { status: 500 }
    );
  }
}
