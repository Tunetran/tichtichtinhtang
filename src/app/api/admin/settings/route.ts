import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getEventConfig, updateEventConfig, resetEventConfig } from '@/lib/event-settings';
import { eventSettingsSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const config = await getEventConfig();
  return NextResponse.json({ config });
}

export async function POST(req: Request) {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await req.json().catch(() => null);
    const parsed = eventSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Dữ liệu cấu hình không hợp lệ' },
        { status: 400 }
      );
    }

    const updated = await updateEventConfig(parsed.data);
    return NextResponse.json({ config: updated, message: 'Đã lưu cấu hình thành công!' });
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi cập nhật cấu hình', details: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const reset = await resetEventConfig();
  return NextResponse.json({ config: reset, message: 'Đã đặt lại cấu hình mặc định' });
}
