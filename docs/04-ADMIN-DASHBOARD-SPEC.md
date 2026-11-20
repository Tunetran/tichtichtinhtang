# 04 — Trang Quản Trị Khách Mời (`/admin`) (Phase 4)

## 1. Mục Tiêu & Phạm Vi
Xây dựng trang quản trị bảo vệ bằng mật khẩu giúp chủ sự kiện tạo link mời đơn lẻ hoặc hàng loạt, sao chép link 1 chạm gửi Zalo/Messenger, theo dõi chi tiết 4 trạng thái khách mời, tổng hợp yêu cầu bài hát và xuất danh sách check-in CSV.

## 2. Danh Sách File Cần Tạo
- `src/app/admin/page.tsx`
- `src/components/admin/AdminLoginForm.tsx`
- `src/components/admin/AdminDashboard.tsx`
- `src/components/admin/StatsCards.tsx`
- `src/components/admin/BulkImportModal.tsx`
- `src/components/admin/GuestTable.tsx`
- `src/components/admin/SongRequestsTab.tsx`

---

## 3. Luồng Xác Thực (`src/app/admin/page.tsx` & `AdminLoginForm.tsx`)
- `src/app/admin/page.tsx` là Server Component: kiểm tra session cookie bằng `isAdminAuthenticated()`.
  - Nếu chưa đăng nhập → render `<AdminLoginForm />`.
  - Nếu đã đăng nhập → render `<AdminDashboard />`.
- **`AdminLoginForm.tsx`:**
  - Giao diện tối giản, căn giữa màn hình.
  - Ô nhập mật khẩu (có nút mắt ẩn/hiện mật khẩu), nút **"Đăng nhập"**.
  - Gọi `POST /api/admin/auth`. Nếu `200 OK` → gọi `router.refresh()`. Nếu `401` hoặc `429` → hiển thị thông báo lỗi đỏ rõ ràng.
- Nút **"Đăng xuất"** ở góc trên phải của `AdminDashboard` gọi `DELETE /api/admin/auth` rồi `router.refresh()`.

---

## 4. Bảng Điều Khiển Thống Kê (`StatsCards.tsx`)
Hiển thị 5 thẻ KPI gọn gàng (responsive: 2 cột trên mobile, 5 cột trên desktop):
1. **Tổng thiệp đã tạo:** `stats.totalInvites`
2. **Chưa mở thiệp:** `stats.notOpened` (màu xám trung tính)
3. **Đã mở — Chưa trả lời:** `stats.openedOnly` (màu vàng hổ phách)
4. **Đồng ý tham gia:** Hiển thị nổi bật **`stats.totalAttendees` khách** (và dòng phụ: `từ ${stats.acceptedInvites} thiệp`, màu xanh lá)
5. **Từ chối:** `stats.declinedInvites` (màu đỏ dịu)

---

## 5. Tạo Khách Mời & Tạo Hàng Loạt (`BulkImportModal.tsx`)
Cung cấp 2 nút hành động chính trên thanh công cụ: **"+ Thêm khách"** (tạo 1 người) và **"+ Tạo hàng loạt"** (mở modal dán danh sách).

### Đặc Tả Parser Của Modal Tạo Hàng Loạt
- Một `textarea` lớn với placeholder hướng dẫn rõ ràng:
  ```text
  Nguyễn Minh Anh
  Trần Hoàng Nam | Nhớ đến sớm nghe mở màn nhé!
  Lê Thu Thảo | Cảm ơn cậu luôn đồng hành cùng tụi mình
  ```
- Quy tắc tách dữ liệu ở phía client (hiển thị **Live Preview** ngay bên dưới):
  - Tách theo dòng mới (`\n`), bỏ qua dòng trống.
  - Nếu dòng chứa dấu `|`: phần trước `|` đầu tiên là `full_name`, phần sau (nối lại nếu có nhiều `|`) là `custom_message`.
  - Nếu không chứa `|`: toàn bộ dòng (sau khi trim) là `full_name`, `custom_message = null`.
  - Hiển thị dòng tóm tắt: *"Đã nhận diện **X khách mời** hợp lệ (trong đó có **Y người** có lời nhắn riêng)"*.
- Nút **"Tạo X đường dẫn mời"** gọi `POST /api/admin/guests/bulk`, sau khi thành công tự đóng modal, reload bảng và hiện thông báo toast thành công.

---

## 6. Danh Sách Khách Mời & Thao Tác Nhanh (`GuestTable.tsx`)

### Bộ Lọc & Tìm Kiếm
- **Tab lọc theo 4 trạng thái:** `Tất cả`, `Chưa mở`, `Đã mở`, `Tham gia`, `Từ chối` (kèm số đếm nhỏ trên mỗi tab).
- **Ô tìm kiếm tức thời:** Tìm theo tên khách mời (hỗ trợ tìm không phân biệt hoa thường và bỏ dấu tiếng Việt).
- **Nút Làm mới (Refresh)** dữ liệu và **Nút Xuất CSV**.

### Cấu Trúc Bảng / Card Responsive
- Trên Desktop hiển thị dạng bảng (`table`), trên Mobile hiển thị dạng danh sách thẻ (`cards`) để chủ sự kiện vẫn quản lý tốt ngay trên điện thoại.
- Thông tin mỗi khách mời gồm:
  1. **Tên khách mời** + đường dẫn rút gọn (`/invite/slug`) + biểu tượng nhỏ nếu có `custom_message`.
  2. **Nhãn trạng thái (Status Badge):**
     - `NOT_OPENED` → `"Chưa mở"` (Xám)
     - `OPENED` → `"Đã mở"` (Vàng)
     - `ACCEPTED` → `"Tham gia (X người)"` (Xanh lá)
     - `DECLINED` → `"Từ chối"` (Đỏ)
  3. **Bài hát yêu cầu & Lời chúc:** Hiển thị tóm tắt hoặc mở popover/modal xem đầy đủ nếu dài.
  4. **Thời gian cập nhật:** Hiển thị `responded_at` hoặc `opened_at` theo định dạng Việt Nam (`HH:mm dd/MM`).
  5. **Cụm nút thao tác nhanh:**
     - **Nút Copy Link 1 chạm:** Copy `${window.location.origin}/invite/${guest.slug}`. Đổi icon từ `Copy` → `Check` xanh + chữ *"Đã copy"* trong `2s`.
     - **Nút Copy Tin Nhắn Zalo:** Copy đoạn mẫu:
       `Trân trọng kính mời ${guest.full_name} tham dự ${EVENT_CONFIG.eventName}. Xem thiệp mời riêng tại đây nhé: ${url}`
     - **Nút Xem thử thiệp:** Mở `/invite/${guest.slug}` trong tab mới.
     - **Nút Sửa:** Mở modal sửa `full_name` và `custom_message` (`PATCH /api/admin/guests/[id]`).
     - **Nút Xóa:** Hiện hộp thoại xác nhận trước khi gọi `DELETE /api/admin/guests/[id]`.

---

## 7. Tổng Hợp Yêu Cầu Bài Hát & Xuất File CSV (`SongRequestsTab.tsx`)
- **Tab chuyển đổi chính trên Dashboard:** `[Danh sách khách mời]` | `[Bài hát yêu cầu (N)]`.
- **Tab Bài hát yêu cầu:** Liệt kê gọn các khách có `status === 'ACCEPTED'` và có điền `song_request` (hiển thị Tên bài hát, Tên khách yêu cầu, Lời chúc đi kèm) để dễ gửi cho ban nhạc chuẩn bị.
- **Tính năng Xuất CSV (Client-side):**
  - Tạo file `danh-sach-khach-moi-YYYYMMDD.csv`.
  - **Bắt buộc thêm ký tự UTF-8 BOM (`\uFEFF`)** ở đầu chuỗi CSV để mở trực tiếp bằng Microsoft Excel trên Windows/macOS không bị lỗi font tiếng Việt.
  - Các cột xuất: `STT`, `Tên khách mời`, `Trạng thái`, `Số người tham dự`, `Bài hát yêu cầu`, `Lời chúc`, `Lời nhắn riêng`, `Link thiệp mời`, `Thời gian mở`, `Thời gian phản hồi`.
  - Escape đúng dấu ngoặc kép (`"`) và dấu phẩy trong nội dung văn bản.

---

## 8. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- [ ] Dán 10 dòng có trộn cả dòng có `|` và không có `|` vào Bulk Import tạo đủ 10 bản ghi với đúng `custom_message`.
- [ ] Nút Copy Link 1 chạm hoạt động trên cả Chrome Desktop và Safari Mobile (có fallback nếu `navigator.clipboard` bị hạn chế).
- [ ] Mở file CSV tải về trên Excel hiển thị hoàn hảo tiếng Việt có dấu.
- [ ] Số liệu 5 thẻ KPI khớp chính xác 100% với danh sách khách mời sau khi thêm/sửa/xóa hoặc sau khi có khách vừa gửi RSVP.