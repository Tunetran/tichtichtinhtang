const SAFE_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';

/**
 * Loại bỏ dấu thanh tiếng Việt và chuyển đ/Đ thành d
 */
export function removeVietnameseTones(str: string): string {
  return str
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Sinh chuỗi ngẫu nhiên 4 ký tự an toàn (không chứa 0, o, 1, l, i)
 */
export function generateRandomSuffix(length = 4): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * SAFE_CHARS.length);
    result += SAFE_CHARS[idx];
  }
  return result;
}

/**
 * Tạo slug chuẩn hóa tiếng Việt không dấu kèm hậu tố 4 ký tự ngẫu nhiên
 * Ví dụ: "Nguyễn Minh Ánh" -> "nguyen-minh-anh-8x2k"
 */
export function generateGuestSlug(fullName: string): string {
  const normalized = removeVietnameseTones(fullName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');

  const base = normalized || 'khach-moi';
  const suffix = generateRandomSuffix(4);
  return `${base}-${suffix}`;
}
