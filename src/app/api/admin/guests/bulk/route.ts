import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateGuestSlug } from '@/lib/slug';
import { bulkCreateGuestsSchema } from '@/lib/validators';
import type { GuestRecord } from '@/types/guest';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Bảo vệ bằng session admin
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    // 2. Validate payload
    const body = await req.json().catch(() => null);
    const validation = bulkCreateGuestsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Dữ liệu tạo hàng loạt không hợp lệ' },
        { status: 400 }
      );
    }

    const { items } = validation.data;

    // 3. Chuẩn bị batch records với slug duy nhất không trùng lặp trong batch
    const existingSlugs = new Set<string>();
    const recordsToInsert = items.map((item) => {
      let slug = generateGuestSlug(item.full_name);
      while (existingSlugs.has(slug)) {
        slug = generateGuestSlug(item.full_name);
      }
      existingSlugs.add(slug);

      return {
        slug,
        full_name: item.full_name,
        custom_message: item.custom_message || null,
        status: 'NOT_OPENED' as const,
        attendees_count: 0,
      };
    });

    // 4. Batch insert vào Supabase
    const { data: inserted, error } = await supabaseAdmin
      .from('guests')
      .insert(recordsToInsert)
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Lỗi khi tạo danh sách khách mời hàng loạt', details: error.message },
        { status: 500 }
      );
    }

    const createdList = (inserted || []) as GuestRecord[];

    return NextResponse.json(
      {
        createdCount: createdList.length,
        guests: createdList,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ', details: (err as Error).message },
      { status: 500 }
    );
  }
}
