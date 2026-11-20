import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { updateGuestSchema } from '@/lib/validators';
import type { GuestRecord } from '@/types/guest';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    // 1. Bảo vệ bằng session admin
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Mã khách mời không hợp lệ' }, { status: 400 });
    }

    // 2. Validate payload
    const body = await req.json().catch(() => null);
    const validation = updateGuestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Dữ liệu cập nhật không hợp lệ' },
        { status: 400 }
      );
    }

    const { full_name, custom_message, status, attendees_count, song_request, wish_message } = validation.data;
    const updatePayload: Record<string, any> = {};

    if (full_name !== undefined) {
      updatePayload.full_name = full_name;
    }
    if (custom_message !== undefined) {
      updatePayload.custom_message = custom_message || null;
    }
    if (status !== undefined) {
      updatePayload.status = status;
      if (status === 'ACCEPTED' || status === 'DECLINED') {
        updatePayload.responded_at = new Date().toISOString();
        if (status === 'DECLINED') {
          updatePayload.attendees_count = 0;
          updatePayload.song_request = null;
        }
      } else if (status === 'OPENED') {
        updatePayload.opened_at = new Date().toISOString();
      } else if (status === 'NOT_OPENED') {
        updatePayload.opened_at = null;
        updatePayload.responded_at = null;
        updatePayload.attendees_count = 0;
      }
    }
    if (attendees_count !== undefined) {
      updatePayload.attendees_count = attendees_count;
    }
    if (song_request !== undefined) {
      updatePayload.song_request = song_request || null;
    }
    if (wish_message !== undefined) {
      updatePayload.wish_message = wish_message || null;
    }

    // 3. Cập nhật thông tin vào Supabase (tuyệt đối giữ nguyên slug để không làm hỏng link đã gửi)
    const { data: updated, error } = await supabaseAdmin
      .from('guests')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { error: 'Không tìm thấy hoặc không thể cập nhật khách mời', details: error?.message },
        { status: 404 }
      );
    }

    return NextResponse.json({ guest: updated as GuestRecord });
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ', details: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    // 1. Bảo vệ bằng session admin
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Mã khách mời không hợp lệ' }, { status: 400 });
    }

    // 2. Xóa bản ghi trong Supabase
    const { error } = await supabaseAdmin.from('guests').delete().eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Lỗi khi xóa khách mời', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ', details: (err as Error).message },
      { status: 500 }
    );
  }
}
