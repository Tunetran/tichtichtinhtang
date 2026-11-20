# 01 — Cấu Hình Sự Kiện & Design System (Phase 1)

## 1. Mục Tiêu & Phạm Vi
Thiết lập nền tảng dự án Next.js, tải font tiếng Việt chuẩn, xây dựng hệ thống biến màu cho 3 phong cách trang trí (mặc định: **Phương án A — Ánh Nến & Rượu Vang**), và tập trung toàn bộ nội dung sự kiện vào 1 file cấu hình duy nhất.

## 2. Danh Sách File Cần Tạo / Chỉnh Sửa
- `config/event.ts`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `public/images/.gitkeep` & `public/music/.gitkeep` (kèm ghi chú tài nguyên)
- `.env.example`

---

## 3. Đặc Tả File Cấu Hình Sự Kiện (`config/event.ts`)
Tạo interface `EventConfig` và export hằng số `EVENT_CONFIG` với đầy đủ dữ liệu mẫu có sẵn để chạy thử ngay (chủ dự án chỉ cần sửa chữ trong file này trước khi gửi khách):

```ts
export type ThemeName = 'candlelight' | 'vintage' | 'starlight';

export interface TimelineItem {
  time: string;
  title: string;
  description?: string;
}

export interface DresscodeColor {
  name: string;
  hex: string;
}

export interface GalleryPhoto {
  src: string;
  alt: string;
  caption?: string;
}

export interface EventConfig {
  theme: ThemeName;
  eventName: string;
  slogan: string;
  eventDateLabel: string;
  checkinTime: string;
  startTime: string;
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  dresscodeDescription: string;
  dresscodeColors: DresscodeColor[];
  hostName: string;
  contactLabel: string;
  contactUrl: string; // tel:09xxxxxxxx hoặc https://zalo.me/09xxxxxxxx
  generalInvitationText: string[]; // Mảng các đoạn văn lời ngỏ chung
  timeline: TimelineItem[];
  gallery: GalleryPhoto[];
  audio: {
    src: string;
    defaultVolume: number; // 0.4
  };
  ogImage: string; // '/images/cover.jpg'
}
```

**Giá trị mặc định bắt buộc trong `EVENT_CONFIG`:**
- `theme`: `'candlelight'`
- `eventName`: `'Đêm Nhạc Tình Yêu — Giai Điệu Chạm Trái Tim'`
- `slogan`: `'Một buổi tối chỉ có ánh nến, tiếng đàn và những bản tình ca'`
- `timeline`: Ít nhất 3 mốc mẫu (`19:00 Đón khách & Check-in`, `19:30 Khai mạc đêm nhạc`, `20:00 Giao lưu & Bản tình ca yêu cầu`).
- `gallery`: Mảng 4 ảnh trỏ tới `/images/photo-1.jpg` đến `/images/photo-4.jpg`.
- `audio`: `{ src: '/music/bg-love.mp3', defaultVolume: 0.4 }`.

---

## 4. Đặc Tả Hệ Thống Giao Diện & 3 Theme (`src/app/globals.css`)
Sử dụng thuộc tính `data-theme` trên thẻ `<html>` (đọc từ `EVENT_CONFIG.theme`) để chuyển đổi toàn bộ bảng màu và họa tiết qua CSS Variables.

### Bảng Design Tokens Bắt Buộc

| CSS Variable | `candlelight` (A - Mặc định) | `vintage` (B - Thư Tay) | `starlight` (C - Ánh Sao) |
| :--- | :--- | :--- | :--- |
| `--bg` | `#FAF6F0` | `#FDFBF7` | `#0F172A` |
| `--bg-surface` | `#FFFFFF` | `#FFFDF9` | `rgba(30, 41, 59, 0.72)` |
| `--bg-envelope` | `#7A1835` | `#B56576` | `#1E293B` |
| `--bg-envelope-flap` | `#631129` | `#9E5162` | `#334155` |
| `--primary` | `#7A1835` | `#B56576` | `#E2C275` |
| `--primary-fg` | `#FAF6F0` | `#FDFBF7` | `#0F172A` |
| `--accent` | `#C89B54` | `#4A373B` | `#F8FAFC` |
| `--text` | `#2B181E` | `#332528` | `#F1F5F9` |
| `--text-muted` | `#6B4E56` | `#755F64` | `#94A3B8` |
| `--border` | `rgba(200, 155, 84, 0.35)` | `rgba(74, 55, 59, 0.2)` | `rgba(226, 194, 117, 0.3)` |

### Họa Tiết Đặc Trưng Theo Theme (Tối Ưu Hiệu Năng)
- **`candlelight`:** Nền kem ấm có hiệu ứng radial-gradient ánh nến mờ nhẹ ở góc, phong bì đỏ rượu đổ bóng mềm, con dấu sáp vàng đồng dập nổi bằng CSS gradient + SVG nốt nhạc mảnh.
- **`vintage`:** Nền giấy vân nhẹ (SVG noise opacity `0.03`), khung ảnh gallery nghiêng luân phiên `-2deg` / `+2deg` dạng Polaroid có viền trắng dày ở đáy.
- **`starlight`:** Nền xanh đêm có các chấm sao nhỏ tạo bằng CSS radial-gradient tĩnh + animation `opacity` nhẹ, thẻ nội dung dùng viền vàng champagne mảnh.

---

## 5. Đặc Tả Typography (`src/app/layout.tsx`)
Sử dụng `next/font/google` với đầy đủ `subsets: ['vietnamese', 'latin']` để tránh lỗi vỡ dấu tiếng Việt:
1. **Font Tiêu đề (`--font-serif`):** `Playfair_Display` (weights: `['500', '600', '700']`, styles: `['normal', 'italic']`).
2. **Font Tên khách mời (`--font-script`):** `Dancing_Script` (weights: `['600', '700']`).
3. **Font Nội dung & UI (`--font-sans`):** `Plus_Jakarta_Sans` (weights: `['400', '500', '600', '700']`).

**Quy tắc hiển thị bắt buộc:**
- Cỡ chữ nội dung cơ sở (`body`) tối thiểu `15px` (`text-[15px]` hoặc `text-base`), `line-height: 1.65`.
- Không sử dụng `--font-script` cho đoạn văn dài hơn 1 dòng.
- Đảm bảo độ tương phản chữ và nền đạt chuẩn WCAG AA (`>= 4.5:1`) trên cả 3 theme.
- Cấu hình viewport chuẩn mobile: không khóa zoom người dùng (`userScalable: true`), sử dụng `100dvh` thay vì `100vh` cho các section toàn màn hình.

---

## 6. Quy Chuẩn Tài Nguyên Media (Ghi Chú Cho Người Dùng)
Agent cần tạo các placeholder SVG hoặc xử lý fallback gracefully nếu file ảnh chưa được thay:
- `public/images/cover.jpg`: `1200 x 630 px`, `< 300 KB`.
- `public/images/photo-1.jpg` đến `photo-4.jpg`: `< 300 KB/ảnh`.
- `public/music/bg-love.mp3`: `128 kbps`, lặp mượt, `< 1.5 MB`.

---

## 7. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- [ ] `npm run build` thành công không lỗi TypeScript.
- [ ] Đổi giá trị `EVENT_CONFIG.theme` giữa `candlelight`, `vintage`, `starlight` làm thay đổi toàn bộ bảng màu tức thì.
- [ ] Cả 3 font hiển thị chuẩn tiếng Việt (kiểm tra với chuỗi mẫu: *"Đêm Nhạc Tình Yêu — Nguyễn Minh Ánh — Ước nguyện đêm trăng"*).