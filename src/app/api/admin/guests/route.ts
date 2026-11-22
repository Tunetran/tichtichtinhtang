import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateGuestSlug } from '@/lib/slug';
import { createGuestSchema } from '@/lib/validators';
import type { GuestRecord } from '@/types/guest';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Bảo vệ bằng session admin
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    // 2. Lấy toàn bộ danh sách khách mời để tính stats chính xác
    const { data: allGuests, error } = await supabaseAdmin
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Lỗi truy vấn dữ liệu từ Supabase', details: error.message },
        { status: 500 }
      );
    }

    const guestsList = (allGuests || []) as GuestRecord[];

    // 3. Tính toán 5 chỉ số KPI
    const stats = {
      totalInvites: guestsList.length,
      notOpened: guestsList.filter((g) => g.status === 'NOT_OPENED').length,
      openedOnly: guestsList.filter((g) => g.status === 'OPENED').length,
      acceptedInvites: guestsList.filter((g) => g.status === 'ACCEPTED').length,
      totalAttendees: guestsList
        .filter((g) => g.status === 'ACCEPTED')
        .reduce((sum, g) => sum + (g.guests_count || g.attendees_count || 1), 0),
      declinedInvites: guestsList.filter((g) => g.status === 'DECLINED').length,
    };

    // 4. Lọc theo query params nếu có
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const qParam = searchParams.get('q');

    let filtered = guestsList;
    if (statusParam && statusParam !== 'ALL') {
      filtered = filtered.filter((g) => g.status === statusParam);
    }
    if (qParam && qParam.trim()) {
      const keyword = qParam.trim().toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.full_name.toLowerCase().includes(keyword) ||
          (g.custom_message && g.custom_message.toLowerCase().includes(keyword)) ||
          (g.song_request && g.song_request.toLowerCase().includes(keyword))
      );
    }

    return NextResponse.json({
      guests: filtered,
      stats,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ', details: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // 1. Bảo vệ bằng session admin
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    // 2. Validate payload
    const body = await req.json().catch(() => null);
    const validation = createGuestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Dữ liệu không hợp lệ' },
        { status: 400 }
      );
    }

    const { full_name, custom_message } = validation.data;

    // 3. Sinh slug duy nhất với cơ chế retry tối đa 3 lần nếu trùng mã 23505
    let createdGuest: GuestRecord | null = null;
    let attempts = 0;

    while (attempts < 3) {
      attempts++;
      const slug = generateGuestSlug(full_name);

      const { data, error } = await supabaseAdmin
        .from('guests')
        .insert({
          slug,
          full_name,
          custom_message: custom_message || null,
          status: 'NOT_OPENED',
          attendees_count: 0,
        })
        .select()
        .single();

      if (!error && data) {
        createdGuest = data as GuestRecord;
        break;
      }

      // Nếu không phải lỗi unique violation, ngắt và báo lỗi luôn
      if (error && error.code !== '23505') {
        return NextResponse.json(
          { error: 'Lỗi khi lưu vào cơ sở dữ liệu', details: error.message },
          { status: 500 }
        );
      }
    }

    if (!createdGuest) {
      return NextResponse.json(
        { error: 'Không thể tạo mã thiệp mời duy nhất sau 3 lần thử' },
        { status: 500 }
      );
    }

    return NextResponse.json({ guest: createdGuest }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ', details: (err as Error).message },
      { status: 500 }
    );
  }
}
