# 00 — Agent Master Plan & Kiến Trúc Dự Án

> **Hướng dẫn dành cho AI Agent:** Đọc kỹ file này trước khi thực thi bất kỳ tác vụ nào. Mọi quyết định về cấu trúc thư mục, thư viện, đặt tên và bảo mật đều phải tuân thủ tuyệt đối tài liệu này.

---

## 1. Tổng Quan Dự Án
- **Tên dự án:** Thiệp Mời Điện Tử — Đêm Nhạc Tình Yêu (`love-concert-invite`)
- **Mục tiêu:** Xây dựng ứng dụng web thiệp mời cá nhân hóa theo đường dẫn riêng (`/invite/[slug]`) tối ưu cho điện thoại (Zalo/Messenger In-App Browser), đi kèm trang quản trị (`/admin`) để tạo link hàng loạt và theo dõi trạng thái phản hồi (RSVP) theo thời gian thực.

---

## 2. Tech Stack Bắt Buộc
Không tự ý cài đặt thêm thư viện thay thế nếu không có yêu cầu.

| Thành phần | Công nghệ / Thư viện | Ghi chú |
| :--- | :--- | :--- |
| Framework | **Next.js 15+ (App Router)** | Bắt buộc dùng TypeScript (`strict: true`) |
| Styling | **Tailwind CSS** | Dùng CSS Variables cho hệ thống 3 theme |
| Animation | **motion** (`motion/react`) | Không dùng WebGL / Three.js nặng |
| Icons | **lucide-react** | Dùng cho nút âm thanh, map, admin UI |
| Confetti | **canvas-confetti** (+ `@types/canvas-confetti`) | Hiệu ứng kết nhẹ sau khi đồng ý RSVP |
| Validation | **zod** | Validate 100% payload đầu vào ở API |
| Database | **Supabase (`@supabase/supabase-js`)** | Chỉ gọi từ Server Components / Route Handlers |
| Hosting | **Vercel** | Deploy kèm Vercel Cron Job |

---

## 3. Cấu Trúc Thư Mục Chuẩn (Target Architecture)

```text
├── config/
│   └── event.ts                        # Dữ liệu sự kiện cốt lõi & cấu hình theme mặc định
├── public/
│   ├── images/
│   │   ├── cover.jpg                   # 1200x630 (< 300KB) cho Zalo/Messenger OG Preview
│   │   ├── photo-1.jpg                 # Ảnh gallery 1 (< 300KB)
│   │   ├── photo-2.jpg                 # Ảnh gallery 2 (< 300KB)
│   │   ├── photo-3.jpg                 # Ảnh gallery 3 (< 300KB)
│   │   └── photo-4.jpg                 # Ảnh gallery 4 (< 300KB)
│   └── music/
│       └── bg-love.mp3                 # Nhạc nền acoustic/piano 128kbps (< 1.5MB)
├── supabase/
│   └── schema.sql                      # DDL khởi tạo bảng, enum, index và RLS
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Load Google Fonts tiếng Việt & áp dụng data-theme
│   │   ├── globals.css                 # Design tokens cho 3 theme (candlelight/vintage/starlight)
│   │   ├── page.tsx                    # Trang chủ mặc định (thông báo hoặc chuyển hướng gọn)
│   │   ├── invite/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx            # Server Component: fetch guest + generateMetadata OG
│   │   │       └── not-found.tsx       # Trang báo link không hợp lệ thân thiện
│   │   ├── admin/
│   │   │   └── page.tsx                # Trang quản trị (kiểm tra session, render Login hoặc Dashboard)
│   │   └── api/
│   │       ├── health/route.ts         # Endpoint giữ Supabase không ngủ đông
│   │       ├── invites/[slug]/
│   │       │   ├── route.ts            # GET chi tiết 1 khách
│   │       │   ├── open/route.ts       # POST ghi nhận lượt mở đầu tiên
│   │       │   └── rsvp/route.ts       # POST cập nhật phản hồi tham dự
│   │       └── admin/
│   │           ├── auth/route.ts       # POST đăng nhập / DELETE đăng xuất
│   │           └── guests/
│   │               ├── route.ts        # GET danh sách + stats / POST tạo 1 khách
│   │               ├── bulk/route.ts   # POST tạo hàng loạt
│   │               └── [id]/route.ts   # PATCH sửa / DELETE xóa
│   ├── components/
│   │   ├── invite/
│   │   │   ├── InviteExperience.tsx    # Orchestrator điều phối 4 chặng + state mở thư
│   │   │   ├── EnvelopeStage.tsx       # Chặng 1 & 2: Phong bì niêm phong + dấu sáp + mở nắp
│   │   │   ├── AudioPlayer.tsx         # Nút nổi góc trên phải + xử lý autoplay/visibilitychange
│   │   │   ├── LetterContent.tsx       # Chặng 3: Lời ngỏ, thông tin sự kiện, timeline
│   │   │   ├── PhotoGallery.tsx        # Chặng 3: Lưới ảnh Polaroid/Grid + Lightbox
│   │   │   └── RsvpSection.tsx         # Chặng 4: Form xác nhận, confetti, cập nhật phản hồi
│   │   └── admin/
│   │       ├── AdminLoginForm.tsx      # Form nhập mật khẩu quản trị
│   │       ├── AdminDashboard.tsx      # Container chính của trang quản trị
│   │       ├── StatsCards.tsx          # 5 thẻ thống kê KPI
│   │       ├── BulkImportModal.tsx     # Modal dán danh sách & xem trước
│   │       ├── GuestTable.tsx          # Bảng khách mời, lọc 4 trạng thái, Copy 1 chạm
│   │       └── SongRequestsTab.tsx     # Tổng hợp yêu cầu bài hát cho ban nhạc
│   ├── lib/
│   │   ├── supabase-admin.ts           # Supabase client dùng SERVICE_ROLE_KEY (server-only)
│   │   ├── auth.ts                     # Tạo & xác thực signed HttpOnly session cookie
│   │   ├── slug.ts                     # Chuẩn hóa tiếng Việt không dấu + hậu tố 4 ký tự
│   │   ├── rate-limit.ts               # Rate limiter nhẹ trong bộ nhớ cho auth & RSVP
│   │   └── validators.ts               # Toàn bộ Zod schemas dùng chung
│   └── types/
│       └── guest.ts                    # TypeScript types & enums chuẩn của hệ thống
├── vercel.json                         # Cấu hình Cron Job gọi /api/health mỗi 2 ngày
└── .env.example                        # Danh sách biến môi trường mẫu
```

---

## 4. Biến Môi Trường Bắt Buộc (`.env.example`)

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-strong-admin-password
ADMIN_SESSION_SECRET=min-32-chars-random-secret-key
```

---

## 5. Quy Ước Code & Ràng Buộc Nghiêm Ngặt (Agent Guardrails)
1. **Bảo mật dữ liệu:** Tuyệt đối KHÔNG import `supabase-admin.ts` hoặc để lộ `SUPABASE_SERVICE_ROLE_KEY` vào Client Components (`"use client"`). Sử dụng package `server-only` trong `src/lib/supabase-admin.ts`.
2. **Mobile-first & Zalo/Messenger:** Thiết kế ưu tiên viewport `375px – 430px`. Trên màn hình lớn (`>= 768px`), căn giữa nội dung thiệp trong khung `max-w-[460px]` có nền trang trí dịu hai bên.
3. **Hiệu năng Animation:** Chỉ animate `transform` và `opacity`. Tránh `backdrop-filter` lồng nhiều lớp. Không tải file nhạc chặn luồng render đầu tiên.
4. **Ngôn ngữ hiển thị:** 100% giao diện khách mời và quản trị dùng **tiếng Việt có dấu chuẩn**, văn phong lịch sự, lãng mạn, tự nhiên.
5. **Không bỏ sót trạng thái:** Mọi nút gọi API đều phải có trạng thái `loading`, vô hiệu hóa bấm đúp (`disabled`), và hiển thị thông báo lỗi tiếng Việt rõ ràng nếu thất bại.

---

## 6. Thứ Tự Giao Việc Cho AI Agent (Execution Roadmap)
Thực hiện tuần tự theo đúng 5 bước sau để tránh xung đột dependency:

1. **Phase 1 — Foundation & Design System:** Thực thi theo `docs/01-CONFIG-AND-DESIGN-SYSTEM.md`.
2. **Phase 2 — Database & Backend APIs:** Thực thi theo `docs/02-DATABASE-AND-API-SPEC.md`.
3. **Phase 3 — Guest Invitation Experience:** Thực thi theo `docs/03-GUEST-INVITATION-FLOW.md`.
4. **Phase 4 — Admin Dashboard:** Thực thi theo `docs/04-ADMIN-DASHBOARD-SPEC.md`.
5. **Phase 5 — QA, Cron & Deployment:** Thực thi theo `docs/05-QA-DEPLOYMENT-CHECKLIST.md`.