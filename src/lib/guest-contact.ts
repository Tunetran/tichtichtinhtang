import type { GuestRecord } from '@/types/guest';

export interface DecodedContact {
  phone: string;
  email: string;
  note: string;
}

/**
 * Giải mã an toàn chuỗi raw (từ wish_message hoặc song_request)
 * - Nếu là chuỗi JSON: trích xuất { phone, email, note }
 * - Nếu không phải JSON: coi toàn bộ raw là note (nếu có regex SĐT/Email thì tách bóc ra)
 */
export function parseGuestNote(raw?: string | null): DecodedContact {
  if (!raw || typeof raw !== 'string') {
    return { phone: '', email: '', note: '' };
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return { phone: '', email: '', note: '' };
  }

  // 1. Kiểm tra nếu là chuỗi JSON
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null) {
        const phone = typeof parsed.phone === 'string' ? parsed.phone.trim() : '';
        const email = typeof parsed.email === 'string' ? parsed.email.trim() : '';
        let note = '';
        if (typeof parsed.note === 'string') {
          note = parsed.note.trim();
        } else if (typeof parsed.wish === 'string') {
          note = parsed.wish.trim();
        } else if (typeof parsed.wish_message === 'string') {
          note = parsed.wish_message.trim();
        } else if (typeof parsed.message === 'string') {
          note = parsed.message.trim();
        }
        return { phone, email, note };
      }
    } catch {
      // Fallback xuống giải mã văn bản thường nếu JSON bị lỗi cú pháp
    }
  }

  // 2. Chuỗi chữ thường: kiểm tra có chứa format "SĐT: ... • Email: ... \n Lời nhắn"
  let phone = '';
  let email = '';
  const mPhone = trimmed.match(/(?:SĐT|SDT|Phone|Số điện thoại):\s*([0-9+\s.-]{8,20})/i);
  if (mPhone && mPhone[1]) {
    phone = mPhone[1].trim();
  }
  const mEmail = trimmed.match(/(?:Email|Gmail):\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  if (mEmail && mEmail[1]) {
    email = mEmail[1].trim();
  }

  // Loại bỏ các trường liên hệ nếu có để lấy lời nhắn thực tế
  const cleaned = trimmed
    .replace(/(?:SĐT|SDT|Phone|Số điện thoại):\s*[0-9+\s.-]{8,20}/gi, '')
    .replace(/(?:Email|Gmail):\s*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, '')
    .replace(/[•|]/g, ' ')
    .trim();

  return {
    phone,
    email,
    note: cleaned.length > 0 ? cleaned : (phone || email ? '' : trimmed),
  };
}

/**
 * Tiện ích tổng hợp cho đối tượng guest: kết hợp cột phone/email trên DB và trong raw note
 */
export function parseGuestContact(guest: {
  phone?: string | null;
  email?: string | null;
  wish_message?: string | null;
  song_request?: string | null;
}): DecodedContact {
  const fromWish = parseGuestNote(guest.wish_message);
  const fromSong = parseGuestNote(guest.song_request);

  const phone = (guest.phone || fromWish.phone || fromSong.phone || '').trim();
  const email = (guest.email || fromWish.email || fromSong.email || '').trim();
  const note = (fromWish.note || fromSong.note || '').trim();

  return { phone, email, note };
}
