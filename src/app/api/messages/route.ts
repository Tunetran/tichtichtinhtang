import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { parseGuestContact } from '@/lib/guest-contact';
import type { GuestRecord } from '@/types/guest';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: guests, error } = await supabaseAdmin
      .from('guests')
      .select('id, full_name, phone, email, song_request, wish_message, responded_at, created_at')
      .order('responded_at', { ascending: false, nullsFirst: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Trích xuất lời chúc từ khách mời (đọc cả song_request và ghi chú trong wish_message)
    const messages = (guests || [])
      .map((g) => {
        const contact = parseGuestContact(g as GuestRecord);
        const text = (contact.note || g.song_request || '').trim();
        return {
          id: g.id,
          name: g.full_name,
          message: text,
          time: g.responded_at || g.created_at,
        };
      })
      .filter((m) => m.message.length > 0)
      .slice(0, 30);

    return NextResponse.json({ messages });
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi tải danh sách lời chúc', details: (err as Error).message },
      { status: 500 }
    );
  }
}
