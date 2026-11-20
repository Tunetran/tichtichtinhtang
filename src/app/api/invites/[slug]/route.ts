import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { PublicGuest } from '@/types/guest';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ error: 'Đường dẫn thiệp mời không hợp lệ' }, { status: 400 });
    }

    const { data: guest, error } = await supabaseAdmin
      .from('guests')
      .select('slug, full_name, custom_message, status, attendees_count, song_request, wish_message, responded_at')
      .eq('slug', slug)
      .single();

    if (error || !guest) {
      return NextResponse.json({ error: 'Không tìm thấy thiệp mời' }, { status: 404 });
    }

    return NextResponse.json({ guest: guest as PublicGuest });
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ', details: (err as Error).message },
      { status: 500 }
    );
  }
}
