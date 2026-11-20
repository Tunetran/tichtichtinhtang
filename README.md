# Thiệp Mời Điện Tử Đêm Nhạc Tình Yêu (Love Concert Invite)

Ứng dụng web thiệp mời âm nhạc lãng mạn, tối ưu trải nghiệm trên thiết bị di động (Zalo & Messenger In-App Browser), đi kèm trang quản trị tạo link hàng loạt, theo dõi phản hồi thời gian thực và tự động giữ database Supabase hoạt động 24/7.

---

## 1. Công Nghệ Sử Dụng (Tech Stack)

- **Framework:** Next.js 15+ (App Router, Server Components & Route Handlers) với TypeScript (`strict: true`).
- **Styling & Design System:** Tailwind CSS với hệ thống biến CSS (CSS Variables) hỗ trợ chuyển đổi 3 theme:
  - `candlelight`: Ánh nến & Rượu vang (Mặc định).
  - `vintage`: Thư tay cổ điển & Khung ảnh Polaroid.
  - `starlight`: Bầu trời đêm ánh sao & Champagne.
- **Typography Chuẩn Tiếng Việt:** `Playfair_Display` (Serif tiêu đề), `Dancing_Script` (Script tên khách), `Plus_Jakarta_Sans` (Sans nội dung).
- **Animation:** `motion` (`motion/react`) — chuyển động phong bì và thư chỉ qua `transform` và `opacity`.
- **Hiệu Ứng Pháo Giấy:** `canvas-confetti` khi khách đồng ý tham dự (RSVP).
- **Icons:** `lucide-react`.
- **Validation:** `zod` xác thực 100% dữ liệu API.
- **Database:** Supabase PostgreSQL với bảo mật Row Level Security (RLS).
- **Keep-Alive:** Vercel Cron Job gọi `/api/health` định kỳ mỗi 2 ngày.

---

## 2. Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Setup)

### Bước 1: Cài đặt thư viện
```bash
npm install
```

### Bước 2: Thiết lập biến môi trường
Tạo file `.env.local` ở thư mục gốc dựa trên mẫu `.env.example`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
ADMIN_PASSWORD=mat-khau-quan-tri-cua-ban
ADMIN_SESSION_SECRET=chuoi-bi-mat-ngau-nhien-it-nhat-32-ky-tu-de-ky-session
```

### Bước 3: Khởi tạo Cơ sở dữ liệu Supabase
1. Đăng nhập vào [Supabase Dashboard](https://supabase.com).
2. Tạo một Project mới (miễn phí).
3. Vào mục **SQL Editor** trong thanh bên trái.
4. Mở file [supabase/schema.sql](supabase/schema.sql), sao chép toàn bộ nội dung và bấm **Run**.
5. Vào **Project Settings -> API**:
   - Sao chép **Project URL** dán vào `SUPABASE_URL`.
   - Sao chép khóa **`service_role` (secret)** dán vào `SUPABASE_SERVICE_ROLE_KEY`.

### Bước 4: Chạy dự án
```bash
npm run dev
```
Mở trình duyệt truy cập:
- Trang chủ: [http://localhost:3000](http://localhost:3000)
- Trang quản trị: [http://localhost:3000/admin](http://localhost:3000/admin) (nhập mật khẩu từ `ADMIN_PASSWORD`).

---

## 3. Hướng Dẫn Tùy Biến Sự Kiện (Chủ Dự Án)

Toàn bộ nội dung sự kiện được tập trung trong file [config/event.ts](config/event.ts):

### A. Tùy biến thông tin chung
Chỉnh sửa các trường trong `EVENT_CONFIG`:
- `theme`: Đổi giữa `'candlelight'`, `'vintage'`, `'starlight'`.
- `eventName`: Tên sự kiện (hiển thị trên tiêu đề, thiệp, Open Graph).
- `slogan`: Câu slogan lãng mạn.
- `eventDateLabel`: Ngày diễn ra sự kiện (ví dụ: *"Thứ Bảy, ngày 14 tháng 02 năm 2026"*).
- `checkinTime` & `startTime`: Giờ đón khách và giờ bắt đầu.
- `venueName`, `venueAddress`, `googleMapsUrl`: Tên, địa chỉ khán phòng và link Google Maps.
- `dresscodeDescription` & `dresscodeColors`: Gợi ý trang phục và mã màu.
- `hostName`: Tên người tổ chức hoặc cặp đôi.
- `generalInvitationText`: Các đoạn văn lời ngỏ chung.
- `timeline`: Các mốc thời gian của đêm nhạc.

### B. Thay đổi hình ảnh & âm thanh
- **Ảnh bìa xem trước Zalo/Messenger:** Thay file [public/images/cover.jpg](public/images/cover.jpg) (Kích thước chuẩn: `1200 x 630 px`, dung lượng `< 300 KB`).
- **4 ảnh bộ sưu tập:** Thay các file [public/images/photo-1.jpg](public/images/photo-1.jpg) đến `photo-4.jpg` (`< 300 KB/ảnh`).
- **Nhạc nền:** Thay file [public/music/bg-love.mp3](public/music/bg-love.mp3) (Định dạng MP3 `128 kbps`, lặp mượt, `< 1.5 MB`).

---

## 4. Hướng Dẫn Sử Dụng Trang Quản Trị (`/admin`)

Truy cập đường dẫn `/admin` và nhập mật khẩu quản trị:

1. **Thống kê thời gian thực (5 thẻ KPI):**
   - Tổng số thiệp đã tạo.
   - Số khách chưa mở thiệp.
   - Số khách đã mở nhưng chưa phản hồi.
   - Số khách đồng ý tham gia (kèm tổng số lượng người thực tế tham dự).
   - Số khách từ chối.
2. **Tạo thiệp mời đơn lẻ:** Bấm **"+ Thêm khách"**, nhập họ tên và lời nhắn riêng (nếu có).
3. **Tạo hàng loạt (Bulk Import):** Bấm **"+ Tạo hàng loạt"**, dán danh sách khách mời theo cú pháp:
   ```text
   Nguyễn Minh Anh
   Trần Hoàng Nam | Nhớ đến sớm nghe mở màn nhé!
   Lê Thu Thảo | Cảm ơn bạn đã luôn đồng hành cùng tụi mình
   ```
   Hệ thống có **Live Preview** thời gian thực, tự động tách tên và lời nhắn, sinh mã slug duy nhất và lưu vào Supabase.
4. **Gửi thiệp 1-chạm:**
   - **Nút Copy Link:** Sao chép link `/invite/[slug]` để gửi riêng.
   - **Nút Zalo:** Tự động tạo tin nhắn lịch sự: *"Trân trọng kính mời [Tên khách] tham dự Đêm Nhạc Tình Yêu... Xem thiệp mời riêng tại đây nhé: [Link]"*.
5. **Tab Bài hát yêu cầu:** Tổng hợp nhanh các ca khúc do khách mời yêu cầu để gửi cho ban nhạc.
6. **Xuất file CSV:** Bấm **"Xuất CSV"** để tải file danh sách check-in. File được gắn sẵn ký tự **UTF-8 BOM (`\uFEFF`)**, mở bằng Microsoft Excel trên Windows/macOS không bao giờ bị lỗi font tiếng Việt.

---

## 5. Triển Khai Lên Vercel & Giữ Supabase Hoạt Động 24/7

### A. Triển khai lên Vercel
1. Đẩy mã nguồn lên GitHub.
2. Truy cập [Vercel](https://vercel.com), bấm **Add New -> Project** và chọn repository.
3. Trong phần **Environment Variables**, điền đầy đủ 5 biến môi trường:
   - `NEXT_PUBLIC_SITE_URL`: Tên miền chính thức (ví dụ: `https://love-concert.vercel.app`).
   - `SUPABASE_URL`: URL dự án Supabase.
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role secret key từ Supabase.
   - `ADMIN_PASSWORD`: Mật khẩu đăng nhập trang `/admin`.
   - `ADMIN_SESSION_SECRET`: Chuỗi bảo mật ngẫu nhiên ít nhất 32 ký tự.
4. Bấm **Deploy**.

### B. Cơ chế Vercel Cron Job tự động giữ Database hoạt động
Gói miễn phí của Supabase tự động tạm dừng (pause) dự án nếu không có truy vấn trong vòng 7 ngày. Dự án đã được tích hợp file [vercel.json](vercel.json):

```json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "0 8 */2 * *"
    }
  ]
}
```
Vercel sẽ tự động gọi endpoint `/api/health` mỗi 2 ngày vào lúc 08:00 UTC để thực hiện một truy vấn nhẹ, giúp database luôn thức 24/7.

> **Phương án dự phòng miễn phí (Nếu dùng tài khoản Vercel Hobby có hạn chế cron):**
> 1. Truy cập [cron-job.org](https://cron-job.org) hoặc [UptimeRobot](https://uptimerobot.com).
> 2. Tạo một Job gọi `GET https://your-domain.vercel.app/api/health` với tần suất mỗi 24 giờ đến 48 giờ một lần.

---

## 6. Checklist Nghiệm Thu Trước Khi Gửi Khách (Pre-Flight QA)

- [x] `npm run lint` đạt 0 lỗi.
- [x] `npx tsc --noEmit` đạt 0 lỗi kiểu TypeScript.
- [x] `npm run build` thành công 100%.
- [x] Thẻ meta Open Graph hiển thị chính xác tên từng khách mời khi gửi qua Zalo / Messenger.
- [x] Chạm dấu sáp trên điện thoại mở nắp phong bì mượt mà và tự động phát nhạc không lỗi autoplay.
- [x] Nút loa góc trên phải bật/tắt nhanh; chuyển tab/ẩn ứng dụng thì nhạc tự tạm dừng.
- [x] Xác nhận tham dự (RSVP) bắn pháo giấy nhẹ, reload trang vẫn ghi nhớ trạng thái và cho phép đổi phản hồi.
- [x] Không rò rỉ `SUPABASE_SERVICE_ROLE_KEY` hoặc `ADMIN_PASSWORD` sang bundle phía client.
- [x] Mọi route quản trị `/api/admin/*` đều được bảo vệ nghiêm ngặt bằng cookie HttpOnly.
