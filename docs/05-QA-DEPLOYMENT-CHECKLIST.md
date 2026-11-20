# 05 — Cấu Hình Triển Khai, Keep-Alive & QA Checklist (Phase 5)

## 1. Mục Tiêu & Phạm Vi
Hoàn thiện cấu hình triển khai lên Vercel, thiết lập cơ chế giữ cơ sở dữ liệu Supabase miễn phí hoạt động 24/7 không bị tạm dừng, và chạy kiểm tra chất lượng toàn diện trước khi phát hành thiệp mời cho khách.

## 2. Danh Sách File Cần Tạo / Kiểm Tra
- `vercel.json`
- `src/app/page.tsx` (Trang chủ gọn gàng khi ai đó truy cập tên miền gốc)
- `README.md` (Hướng dẫn chạy local, chạy `schema.sql`, thay ảnh/nhạc và deploy Vercel)

---

## 3. Cấu Hình Giữ Supabase Hoạt Động 24/7 (`vercel.json`)
Supabase gói miễn phí tạm dừng dự án sau 7 ngày không có truy vấn. Cấu hình Vercel Cron Job gọi `/api/health` định kỳ lúc `08:00 UTC` mỗi 2 ngày một lần (ví dụ các ngày chẵn trong tháng):

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

> **Ghi chú:** Trong `README.md`, hướng dẫn thêm phương án dự phòng miễn phí dùng `cron-job.org` hoặc `UptimeRobot` gọi `GET https://your-domain.vercel.app/api/health` mỗi 24–48 giờ trong trường hợp tài khoản Vercel Free giới hạn số lượng hoặc tần suất Cron Job.

---

## 4. Trang Chủ Mặc Định (`src/app/page.tsx`)
- Khi người dùng truy cập đường dẫn gốc `/`, không hiển thị lỗi 404 hay trang mặc định của Next.js.
- Hiển thị một tấm thiệp giới thiệu ngắn gọn gồm Tên sự kiện, Thời gian, Địa điểm (đọc từ `EVENT_CONFIG`) và dòng thông báo *"Vui lòng mở đường dẫn thiệp mời cá nhân đã được gửi riêng cho bạn"*.

---

## 5. Quy Trình Kiểm Tra Tự Động Của AI Agent (Pre-Flight Verification)
AI Agent bắt buộc tự chạy và xác nhận vượt qua tất cả lệnh sau trước khi báo cáo hoàn thành:

1. `npm run lint` — 0 lỗi ESLint.
2. `npx tsc --noEmit` — 0 lỗi kiểu TypeScript.
3. `npm run build` — Build production thành công, không cảnh báo thiếu dependency hoặc lỗi Server/Client boundary.
4. Kiểm tra rà soát bảo mật:
   - Xác nhận không có chuỗi `SUPABASE_SERVICE_ROLE_KEY` hoặc `ADMIN_PASSWORD` xuất hiện trong bundle phía client (`.next/static`).
   - Xác nhận tất cả route trong `src/app/api/admin/**` (ngoại trừ `/auth`) đều gọi `requireAdmin()`.

---

## 6. Checklist Nghiệm Thu Thực Tế Trước Khi Gửi Khách (UAT)

### A. Kiểm tra Preview Link trên Ứng Dụng Nhắn Tin
- [ ] Gửi thử link `/invite/[slug-test]` vào "Cloud của tôi" trên Zalo (iOS & Android): kiểm tra ảnh bìa `1200x630` sắc nét, không bị cắt mất chữ, tiêu đề hiển thị đúng tên khách mời.
- [ ] Kiểm tra link qua Facebook Sharing Debugger để làm mới cache Messenger.

### B. Kiểm tra Trải Nghiệm Khách Mời Trên Điện Thoại Thật (`375px – 430px`)
- [ ] Mở link trực tiếp bên trong **Zalo In-App Browser** và **Messenger In-App Browser**:
  - [ ] Màn hình Chặng 1 (Phong bì) vừa khít `100dvh`, không bị thanh công cụ che mất nút dấu sáp.
  - [ ] Chạm dấu sáp: nắp phong bì lật mượt (không giật lag), nhạc nền tự động phát ở mức âm lượng dễ chịu (~40%).
  - [ ] Bấm nút loa góc trên phải: tắt/bật nhạc hoạt động tức thì.
  - [ ] Bấm nút Home thoát khỏi Zalo: nhạc nền tự động dừng, không phát ngầm.
  - [ ] Cuộn xuống Chặng 3: ảnh gallery hiện lên mượt, chạm vào ảnh mở được phóng to và đóng lại dễ dàng.
  - [ ] Bấm nút Google Maps: mở đúng tọa độ quán/khán phòng.
  - [ ] Gửi RSVP **Tham gia** (chọn 2 người + yêu cầu bài hát + lời chúc): pháo giấy hiển thị mượt, không đứng máy.
  - [ ] Đóng link và mở lại: thấy đúng phản hồi vừa gửi, bấm **"Thay đổi phản hồi"** sang **Từ chối** rồi lưu lại thành công.

### C. Kiểm tra Trang Quản Trị (`/admin`) & Vận Hành
- [ ] Đăng nhập sai mật khẩu báo lỗi; nhập sai > 5 lần liên tiếp bị chặn tạm thời (429).
- [ ] Tạo hàng loạt 5 khách mời, copy link 1 chạm gửi thành công.
- [ ] Kiểm tra 5 thẻ thống kê cập nhật chính xác tổng số khách thực tế tham dự.
- [ ] Xuất file CSV và mở bằng Excel không lỗi dấu tiếng Việt.
- [ ] Truy cập `https://your-domain.vercel.app/api/health` trả về JSON `{"status":"ok","database":"connected",...}`.