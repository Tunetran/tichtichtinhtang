interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Định kỳ dọn dẹp các key đã hết hạn mỗi 5 phút
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (record.resetAt <= now) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

/**
 * Rate limiter nhẹ lưu trữ trong bộ nhớ RAM
 * @param key Khóa định danh (ví dụ: `rsvp:192.168.1.1` hoặc `login:192.168.1.1`)
 * @param limit Số lượt tối đa được phép trong cửa sổ thời gian
 * @param windowMs Thời gian của cửa sổ tính bằng milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return {
      success: true,
      remaining: limit - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: Math.ceil(record.resetAt / 1000),
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    reset: Math.ceil(record.resetAt / 1000),
  };
}

/**
 * Lấy IP client từ Request headers
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
