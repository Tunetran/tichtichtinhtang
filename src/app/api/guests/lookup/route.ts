import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { removeVietnameseTones } from '@/lib/slug';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const isAllowed = checkRateLimit(`lookup:${ip}`, 30, 60);
  if (!isAllowed) {
    return NextResponse.json({ error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';

  if (!q || q.length < 2) {
    return NextResponse.json({ guests: [] });
  }

  try {
    const { data: guests, error } = await supabaseAdmin
      .from('guests')
      .select('id, slug, full_name, status')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error || !guests) {
      return NextResponse.json({ guests: [] });
    }

    const keyword = removeVietnameseTones(q.toLowerCase());
    const matches = guests
      .filter((g) => removeVietnameseTones(g.full_name.toLowerCase()).includes(keyword))
      .slice(0, 10);

    return NextResponse.json({ guests: matches });
  } catch {
    return NextResponse.json({ guests: [] });
  }
}
