import type { GuestRecord } from '@/types/guest';

export interface DecodedContact {
  phone: string;
  email: string;
  note: string;
}

/**
 * Giải mã thông tin liên hệ (Số điện thoại, Gmail, Lời nhắn) của khách mời
 * Tương thích linh hoạt: đọc cột phone/email riêng hoặc bóc tách JSON / Regex từ wish_message
 */
export function parseGuestContact(guest: GuestRecord): DecodedContact {
  let phone = (guest.phone || '').trim();
  let email = (guest.email || '').trim();
  let note = (guest.wish_message || '').trim();

  if (note) {
    // 1. Thử giải mã nếu wish_message là JSON
    if (note.startsWith('{') && note.endsWith('}')) {
      try {
        const parsed = JSON.parse(note);
        if (typeof parsed === 'object' && parsed !== null) {
          if (!phone && typeof parsed.phone === 'string') {
            phone = parsed.phone.trim();
          }
          if (!email && typeof parsed.email === 'string') {
            email = parsed.email.trim();
          }
          if (typeof parsed.note === 'string') {
            note = parsed.note.trim();
          } else if (typeof parsed.wish === 'string') {
            note = parsed.wish.trim();
          } else {
            note = '';
          }
        }
      } catch {
        // Không phải JSON
      }
    } else {
      // 2. Thử giải mã nếu wish_message là text định dạng: "SĐT: 098... • Email: abc@gmail.com \n Ghi chú"
      if (!phone) {
        const mPhone = note.match(/(?:SĐT|SDT|Phone|Số điện thoại):\s*([0-9+\s.-]{8,20})/i);
        if (mPhone && mPhone[1]) {
          phone = mPhone[1].trim();
        }
      }
      if (!email) {
        const mEmail = note.match(/(?:Email|Gmail):\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
        if (mEmail && mEmail[1]) {
          email = mEmail[1].trim();
        }
      }

      // Loại bỏ tiền tố liên hệ để lấy lời nhắn thực tế
      const cleaned = note
        .replace(/(?:SĐT|SDT|Phone|Số điện thoại):\s*[0-9+\s.-]{8,20}/gi, '')
        .replace(/(?:Email|Gmail):\s*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, '')
        .replace(/[•|]/g, ' ')
        .trim();
      if (cleaned.length > 0) {
        note = cleaned;
      }
    }
  }

  return { phone, email, note };
}
