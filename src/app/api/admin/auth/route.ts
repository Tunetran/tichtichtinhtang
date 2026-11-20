import { NextResponse } from 'next/server';
import { adminLoginSchema } from '@/lib/validators';
import {
  clearAdminSessionCookie,
  setAdminSessionCookie,
  verifyAdminPassword,
} from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateLimitKey = `admin_login_fail:${ip}`;

    // 1. Kiểm tra giới hạn 5 lần đăng nhập sai / phút theo IP
    const rateCheck = checkRateLimit(rateLimitKey, 5, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Bạn đã thử đăng nhập sai quá nhiều lần. Vui lòng đợi 1 phút.' },
        { status: 429 }
      );
    }

    // 2. Validate payload
    const body = await req.json().catch(() => null);
    const validation = adminLoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Vui lòng nhập mật khẩu' },
        { status: 400 }
      );
    }

    const { password } = validation.data;

    // 3. So sánh mật khẩu an toàn
    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    // 4. Đúng mật khẩu: Set cookie HttpOnly
    const response = NextResponse.json({ ok: true });
    setAdminSessionCookie(response);
    return response;
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ', details: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ ok: true });
    clearAdminSessionCookie(response);
    return response;
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ', details: (err as Error).message },
      { status: 500 }
    );
  }
}
