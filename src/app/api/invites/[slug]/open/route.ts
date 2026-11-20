import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ error: 'Đường dẫn thiệp mời không hợp lệ' }, { status: 400 });
    }

    // 1. Kiểm tra trạng thái hiện tại của khách mời
    const { data: guest, error: findError } = await supabaseAdmin
      .from('guests')
      .select('id, status')
      .eq('slug', slug)
      .single();

    if (findError || !guest) {
      return NextResponse.json({ error: 'Không tìm thấy thiệp mời' }, { status: 404 });
    }

    // 2. Tuân thủ State Machine: CHỈ cập nhật khi status = 'NOT_OPENED'
    if (guest.status === 'NOT_OPENED') {
      const now = new Date().toISOString();
      const { error: updateError } = await supabaseAdmin
        .from('guests')
        .update({
          status: 'OPENED',
          opened_at: now,
        })
        .eq('id', guest.id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Không thể ghi nhận mở thiệp', details: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true, status: 'OPENED' });
    }

    // Nếu đã là OPENED, ACCEPTED hoặc DECLINED: idempotent, không ghi đè
    return NextResponse.json({ ok: true, status: guest.status });
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ', details: (err as Error).message },
      { status: 500 }
    );
  }
}
