import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: guests, error } = await supabaseAdmin
      .from('guests')
      .select('id, full_name, song_request, responded_at, created_at')
      .order('responded_at', { ascending: false, nullsFirst: false })
      .limit(30);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // CHỈ lấy ô thứ nhất (cột song_request - "Lời nhắn gửi đến đêm nhạc" công khai).
    // Ô thứ hai (wish_message) là ghi chú riêng cho Ban Tổ Chức, tuyệt đối không xuất hiện trên Bức tường lời nhắn.
    const messages = (guests || [])
      .filter((g) => {
        const msg = (g.song_request || '').trim();
        return msg.length > 0;
      })
      .slice(0, 8)
      .map((g) => ({
        id: g.id,
        name: g.full_name,
        message: (g.song_request || '').trim(),
        time: g.responded_at || g.created_at,
      }));

    return NextResponse.json({ messages });
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi tải lời nhắn', details: (err as Error).message },
      { status: 500 }
    );
  }
}
