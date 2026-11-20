# 03 — Luồng Thiệp Mời Khách (`/invite/[slug]`) & Storyboard 4 Chặng (Phase 3)

## 1. Mục Tiêu & Phạm Vi
Xây dựng toàn bộ giao diện và trải nghiệm tương tác của khách mời khi mở đường dẫn `/invite/[slug]`, đảm bảo hiển thị khung xem trước (Open Graph) sắc nét trên Zalo/Messenger, chuyển động mượt trên di động, phát nhạc nền ổn định trên iOS Safari/Zalo, và lưu RSVP chuẩn xác.

## 2. Danh Sách File Cần Tạo
- `src/app/invite/[slug]/page.tsx`
- `src/app/invite/[slug]/not-found.tsx`
- `src/components/invite/InviteExperience.tsx`
- `src/components/invite/EnvelopeStage.tsx`
- `src/components/invite/AudioPlayer.tsx`
- `src/components/invite/LetterContent.tsx`
- `src/components/invite/PhotoGallery.tsx`
- `src/components/invite/RsvpSection.tsx`

---

## 3. Server Component & Open Graph Metadata (`page.tsx`)
- `export const dynamic = 'force-dynamic'` để luôn lấy dữ liệu mới nhất khi khách mở lại link.
- Truy vấn trực tiếp dữ liệu khách mời từ `supabaseAdmin` theo `slug`. Nếu không tìm thấy → gọi `notFound()`.
- **`generateMetadata`:**
  - `title`: `Thư mời ${guest.full_name} — ${EVENT_CONFIG.eventName}`
  - `description`: `${EVENT_CONFIG.slogan} | ${EVENT_CONFIG.eventDateLabel}`
  - `openGraph`:
    - `title`: `Trân trọng kính mời ${guest.full_name}`
    - `description`: `${EVENT_CONFIG.eventName} — ${EVENT_CONFIG.eventDateLabel}`
    - `images`: `[{ url: `${NEXT_PUBLIC_SITE_URL}${EVENT_CONFIG.ogImage}`, width: 1200, height: 630 }]`
    - `type`: `'website'`
- **`not-found.tsx`:** Hiển thị thông điệp trang nhã bằng tiếng Việt (*"Liên kết thiệp mời không tồn tại hoặc đã thay đổi"*) kèm nút liên hệ BTC (`EVENT_CONFIG.contactUrl`).

---

## 4. Đặc Tả Chi Tiết Kịch Bản 4 Chặng

### Chặng 1: Màn Hình Phong Bì Niêm Phong (`EnvelopeStage.tsx`)
- **Bố cục:**
  - Chiều cao cố định `min-h-[100dvh] h-[100dvh] overflow-hidden` khi phong bì chưa mở.
  - Căn giữa hoàn toàn chiếc phong bì (tỷ lệ gần 4:3 hoặc 5:4, chiều rộng tối đa `340px` trên điện thoại).
  - Nền có họa tiết nốt nhạc SVG mảnh độ mờ thấp (`opacity-10`) ở các góc.
- **Cá nhân hóa:**
  - Phía trên hoặc ngay mặt phong bì hiển thị:
    - Dòng nhỏ (Sans/Serif uppercase tracking rộng): `Trân trọng kính mời`
    - Tên khách mời (`guest.full_name`): Font `--font-script`, cỡ chữ lớn (`text-3xl sm:text-4xl`), màu nổi bật theo theme.
- **Tương tác dấu sáp:**
  - Nút con dấu sáp hình tròn nằm ngay tâm giao điểm nắp phong bì (`min 64x64px` để bấm dễ bằng ngón cái).
  - Animation nhịp thở (`motion.button`): `animate={{ scale: [1, 1.08, 1] }}`, `transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}`.
  - Dòng nhắc bên dưới: *"Chạm vào dấu sáp để mở thư"*.
- **Ghi nhận lượt mở:** Khi người dùng vào trang hoặc bấm mở thư, gọi `POST /api/invites/[slug]/open` một lần ở chế độ fire-and-forget (không làm chậm thao tác mở thư).

### Chặng 2: Khoảnh Khắc Mở Thư & Điều Khiển Nhạc Nền (`EnvelopeStage.tsx` + `AudioPlayer.tsx`)
- **Chuỗi Animation Mở Thư (Tổng thời gian `~1.6s`):**
  1. `0.0s – 0.3s`: Dấu sáp mờ dần (`opacity: 0, scale: 0.7`).
  2. `0.2s – 0.8s`: Nắp phong bì lật mở lên (`rotateX: 0 -> -180deg`, `transformOrigin: 'top'`, dùng CSS `perspective: 1000px`).
  3. `0.6s – 1.2s`: Tờ thư bên trong trượt lên (`y: 40 -> -20`, `opacity: 0 -> 1`).
  4. `1.1s – 1.6s`: Toàn bộ phong bì mờ dần và chuyển mượt sang giao diện đọc thư toàn màn hình (`LetterContent`), đồng thời mở khóa cuộn dọc trang.
- **Yêu Cầu Xử Lý Âm Thanh Bắt Buộc (`AudioPlayer.tsx`):**
  - Thẻ `<audio ref={audioRef} src={EVENT_CONFIG.audio.src} loop preload="none" playsInline />` được mount sẵn ở `InviteExperience`.
  - **Bắt buộc vượt Autoplay trên iOS Safari & Zalo:** Gọi `audioRef.current.play()` **đồng bộ ngay bên trong event handler `onClick`** của nút dấu sáp (không đặt trong `setTimeout` hay sau `await`).
  - **Fade-in âm lượng:** Đặt `volume = 0.05` rồi tăng dần lên `0.4` (`EVENT_CONFIG.audio.defaultVolume`) trong khoảng `1.5s` (bọc `try/catch` vì iOS Safari không cho chỉnh thuộc tính `audio.volume` bằng JS, tránh văng lỗi).
  - **Nút nổi điều khiển:** Ghim cố định `fixed top-4 right-4 z-50`, hình tròn `w-11 h-11`, dùng icon `Volume2` (đang phát) / `VolumeX` (đang tắt) từ `lucide-react`, có `aria-label="Bật/tắt nhạc nền"`.
  - **Tự động tắt khi rời ứng dụng:** Lắng nghe `document.addEventListener('visibilitychange', ...)`: khi `document.hidden === true` → gọi `audio.pause()`; khi quay lại chỉ phát tiếp nếu trước đó người dùng chưa chủ động bấm tắt.

### Chặng 3: Nội Dung Thư, Lịch Trình & Thư Viện Ảnh (`LetterContent.tsx` + `PhotoGallery.tsx`)
- **Khung hiển thị:** Căn giữa `max-w-[460px] mx-auto px-5 py-10 space-y-10`.
- **1. Header Đêm Nhạc:** Tên sự kiện (`--font-serif`), câu Slogan nghiêng, đường kẻ trang trí mảnh có icon nốt nhạc ở giữa.
- **2. Lời Ngỏ Cá Nhân:**
  - Lời chào *"Thân gửi [Tên khách mời],"* (`--font-script`).
  - Các đoạn văn trong `EVENT_CONFIG.generalInvitationText`.
  - **Khối lời nhắn riêng (`guest.custom_message`):** Chỉ render nếu `custom_message` có nội dung không rỗng. Thiết kế như một thẻ trích dẫn có viền trái màu `--accent`, nền hơi khác biệt để tạo cảm giác viết riêng.
- **3. Khối Thông Tin Chính:**
  - Hiển thị rõ ràng bằng icon Lucide (`Calendar`, `Clock`, `MapPin`, `Shirt`):
    - Thời gian: Ngày, giờ đón khách, giờ bắt đầu.
    - Địa điểm: Tên quán/khán phòng, địa chỉ cụ thể, và nút **"Xem bản đồ (Google Maps)"** (`target="_blank" rel="noopener noreferrer"`).
    - Dresscode: Mô tả trang phục + hàng chấm tròn mã màu (`EVENT_CONFIG.dresscodeColors`) kèm tên màu bên dưới.
  - **Timeline buổi diễn:** Trục dọc mảnh nối các chấm tròn; mỗi mốc hiển thị giờ (`font-semibold`) và tên hoạt động.
- **4. Thư Viện Ảnh (`PhotoGallery.tsx`):**
  - Lưới 2 cột (`grid-cols-2 gap-3.5`) cho 3–4 ảnh.
  - Mỗi ảnh dùng `motion.div` với `initial={{ opacity: 0, y: 24 }}`, `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true, amount: 0.2 }}`, stagger nhẹ theo `index * 0.1s`.
  - Nếu theme là `vintage`, áp dụng khung Polaroid (viền trắng, đáy dày chứa `caption`, góc nghiêng nhẹ luân phiên).
  - **Lightbox:** Chạm vào bất kỳ ảnh nào sẽ mở modal phóng to ảnh giữa màn hình (nền tối `bg-black/85`), có nút `X` đóng và hỗ trợ chạm nền ngoài để đóng.

### Chặng 4: Xác Nhận Tham Dự (RSVP) & Hiệu Ứng Kết (`RsvpSection.tsx`)
- **Trạng thái đã phản hồi trước đó:**
  - Nếu `guest.status` là `'ACCEPTED'` hoặc `'DECLINED'` khi tải trang: hiển thị thẻ tóm tắt trạng thái hiện tại (ví dụ: *"Bạn đã xác nhận tham dự cùng 2 người"* hoặc *"Bạn đã báo không thể tham dự"*, kèm bài hát/lời chúc đã gửi nếu có) và nút **"Thay đổi phản hồi"** để mở lại form chỉnh sửa.
- **Biểu mẫu chọn lựa:**
  - Hai nút chọn lớn, dễ bấm trên điện thoại:
    - **"Tôi sẽ tham gia"** (nền `--primary`, chữ `--primary-fg`, icon `Heart` hoặc `Check`).
    - **"Rất tiếc không thể đến"** (viền mảnh `--border`, chữ `--text`).
  - **Trường mở rộng động (`AnimatePresence`):**
    - Khi chọn **Tham gia**:
      - Bộ chọn nhanh số người đi cùng: 4 nút vuông/tròn `[1] [2] [3] [4]` (mặc định `1`).
      - Ô input: *"Bài hát bạn muốn nghe trong đêm nhạc (không bắt buộc)"* (max 200 ký tự).
      - Ô textarea: *"Lời chúc gửi đến đêm nhạc (không bắt buộc)"* (max 500 ký tự).
    - Khi chọn **Từ chối**:
      - Chỉ hiển thị ô textarea: *"Gửi lời chúc đến đêm nhạc (không bắt buộc)"*.
  - Nút **"Gửi xác nhận"** hiển thị spinner khi đang gửi (`isSubmitting`).
- **Hiệu ứng sau khi lưu thành công:**
  - Gọi `POST /api/invites/[slug]/rsvp`.
  - Nếu `ACCEPTED`: Bắn hiệu ứng nhẹ bằng `canvas-confetti`:
    ```ts
    confetti({
      particleCount: 55,
      spread: 65,
      origin: { y: 0.7 },
      colors: ['#7A1835', '#C89B54', '#FAF6F0', '#E2C275'], // Điều chỉnh khớp theme hiện tại
      disableForReducedMotion: true,
    });
    ```
  - Chuyển sang thẻ cảm ơn kèm thông tin liên hệ BTC (`EVENT_CONFIG.contactLabel` / `contactUrl`) ở chân trang (Footer).

---

## 5. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- [ ] View Source HTML của `/invite/[slug]` chứa đủ các thẻ `og:title`, `og:description`, `og:image` có tên đúng khách mời.
- [ ] Không có thanh cuộn ngang (`overflow-x: hidden`) trên màn hình `375px`.
- [ ] Chạm dấu sáp mở thư kích hoạt đồng thời animation mở nắp phong bì và phát nhạc `bg-love.mp3` không báo lỗi console.
- [ ] Bấm nút loa góc trên phải bật/tắt nhạc ngay lập tức; chuyển tab trình duyệt thì nhạc tự dừng.
- [ ] Gửi RSVP "Tham gia" với 3 người + tên bài hát lưu thành công vào DB, bắn confetti, reload trang vẫn thấy đúng trạng thái đã đăng ký và nút "Thay đổi phản hồi" hoạt động.