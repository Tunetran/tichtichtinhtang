# Playbook Giao Việc Cho AI Agent (Copy-Paste Prompts)

Đặt toàn bộ thư mục `docs/` vào gốc dự án, sau đó giao việc cho AI Agent (Cursor, Windsurf, Claude Code, Copilot...) lần lượt theo 5 prompt dưới đây. Sau mỗi bước, kiểm tra nhanh kết quả rồi mới chuyển sang bước tiếp theo.

---

## Prompt 1 — Khởi tạo & Design System
```text
Hãy đọc kỹ @docs/00-AGENT-MASTER-PLAN.md và @docs/01-CONFIG-AND-DESIGN-SYSTEM.md.
Thực hiện hoàn chỉnh Phase 1: cài đặt các package cần thiết theo Tech Stack bắt buộc, thiết lập config/event.ts, font tiếng Việt trong layout.tsx, và hệ thống 3 theme CSS Variables trong globals.css (mặc định candlelight).
Sau khi xong, chạy `npm run build` để đảm bảo không có lỗi và báo cáo danh sách file đã tạo.
```

## Prompt 2 — Database & Backend APIs
```text
Hãy đọc kỹ @docs/00-AGENT-MASTER-PLAN.md và @docs/02-DATABASE-AND-API-SPEC.md.
Thực hiện hoàn chỉnh Phase 2: tạo supabase/schema.sql, các module trong src/lib/ (supabase-admin, slug, auth, validators, rate-limit), và toàn bộ API Route Handlers cho invites, admin và /api/health.
Đảm bảo tuân thủ chặt State Machine 4 trạng thái và bảo mật cookie HttpOnly. Chạy `npx tsc --noEmit` để xác minh.
```

## Prompt 3 — Luồng Thiệp Mời Khách (`/invite/[slug]`)
```text
Hãy đọc kỹ @docs/00-AGENT-MASTER-PLAN.md, @docs/01-CONFIG-AND-DESIGN-SYSTEM.md và @docs/03-GUEST-INVITATION-FLOW.md.
Thực hiện hoàn chỉnh Phase 3: xây dựng trang /invite/[slug] (kèm Dynamic Open Graph Metadata và not-found) và toàn bộ component cho kịch bản 4 chặng (Phong bì niêm phong, Mở thư + AudioPlayer tương thích iOS Safari/Zalo, Nội dung thư + Gallery Lightbox, RSVP + canvas-confetti).
Chú ý tối ưu mobile-first 375px–430px và chỉ animate transform/opacity. Chạy `npm run build` để xác minh.
```

## Prompt 4 — Trang Quản Trị (`/admin`)
```text
Hãy đọc kỹ @docs/00-AGENT-MASTER-PLAN.md và @docs/04-ADMIN-DASHBOARD-SPEC.md.
Thực hiện hoàn chỉnh Phase 4: xây dựng trang /admin gồm màn hình đăng nhập, 5 thẻ thống kê KPI, tạo khách đơn lẻ, Modal tạo hàng loạt hỗ trợ cú pháp `Tên | Lời nhắn`, bảng lọc 4 trạng thái với nút Copy Link 1 chạm + Copy tin nhắn Zalo, tab tổng hợp bài hát yêu cầu và tính năng xuất CSV có UTF-8 BOM.
Chạy `npm run build` để xác minh.
```

## Prompt 5 — Cấu Hình Deploy, Keep-Alive & Rà Soát QA
```text
Hãy đọc kỹ @docs/05-QA-DEPLOYMENT-CHECKLIST.md.
Thực hiện hoàn chỉnh Phase 5: tạo vercel.json với Cron Job gọi /api/health mỗi 2 ngày, hoàn thiện trang chủ src/app/page.tsx và viết README.md hướng dẫn setup Supabase + thay ảnh/nhạc + deploy Vercel.
Cuối cùng, chạy đủ 3 lệnh `npm run lint`, `npx tsc --noEmit`, `npm run build`, rà soát rò rỉ biến môi trường server sang client và tổng hợp kết quả theo checklist nghiệm thu.
```