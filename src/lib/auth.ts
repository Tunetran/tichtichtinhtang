import 'server-only';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const ADMIN_COOKIE_NAME = 'invite_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 ngày

interface AdminSessionPayload {
  role: 'admin';
  exp: number;
}

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || 'fallback-dev-secret-key-min-32-chars-long';
}

/**
 * Tạo token HMAC-SHA256 có hạn sử dụng 7 ngày
 */
export function createAdminToken(): string {
  const payload: AdminSessionPayload = {
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Xác minh tính hợp lệ và thời hạn của token admin
 */
export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadB64, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', getSecret())
    .update(payloadB64)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expBuffer.length) {
    return false;
  }

  if (!crypto.timingSafeEqual(sigBuffer, expBuffer)) {
    return false;
  }

  try {
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson) as AdminSessionPayload;
    if (payload.role !== 'admin') return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false;
  }
}

/**
 * So sánh an toàn mật khẩu quản trị (chống timing attack)
 */
export function verifyAdminPassword(password: string): boolean {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword || !password) return false;

  const passHash = crypto.createHash('sha256').update(password).digest();
  const expectedHash = crypto.createHash('sha256').update(expectedPassword).digest();

  return crypto.timingSafeEqual(passHash, expectedHash);
}

/**
 * Kiểm tra xem session hiện tại có phải admin hợp lệ không
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

/**
 * Middleware bảo vệ Route Handler cho các route /api/admin/*
 */
export async function requireAdmin(): Promise<
  { authorized: true; response: null } | { authorized: false; response: NextResponse }
> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Yêu cầu đăng nhập quản trị viên' },
        { status: 401 }
      ),
    };
  }
  return { authorized: true, response: null };
}

/**
 * Gán cookie HttpOnly đăng nhập admin vào response
 */
export function setAdminSessionCookie(response: NextResponse): void {
  const token = createAdminToken();
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Xóa cookie đăng nhập admin khỏi response
 */
export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
