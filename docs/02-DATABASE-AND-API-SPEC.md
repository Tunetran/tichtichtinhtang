# 02 — Cơ Sở Dữ Liệu Supabase & Đặc Tả API (Phase 2)

## 1. Mục Tiêu & Phạm Vi
Khởi tạo lược đồ cơ sở dữ liệu PostgreSQL trên Supabase, thiết lập lớp bảo mật RLS, xây dựng toàn bộ API Route Handlers cho luồng khách mời, luồng quản trị và cơ chế giữ kết nối `/api/health`.

## 2. Danh Sách File Cần Tạo
- `supabase/schema.sql`
- `src/types/guest.ts`
- `src/lib/supabase-admin.ts`
- `src/lib/slug.ts`
- `src/lib/auth.ts`
- `src/lib/validators.ts`
- `src/lib/rate-limit.ts`
- `src/app/api/health/route.ts`
- `src/app/api/invites/[slug]/route.ts`
- `src/app/api/invites/[slug]/open/route.ts`
- `src/app/api/invites/[slug]/rsvp/route.ts`
- `src/app/api/admin/auth/route.ts`
- `src/app/api/admin/guests/route.ts`
- `src/app/api/admin/guests/bulk/route.ts`
- `src/app/api/admin/guests/[id]/route.ts`

---

## 3. Lược Đồ Cơ Sở Dữ Liệu (`supabase/schema.sql`)

```sql
-- 1. Enum 4 trạng thái bắt buộc
CREATE TYPE guest_status AS ENUM ('NOT_OPENED', 'OPENED', 'ACCEPTED', 'DECLINED');

-- 2. Bảng guests
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  custom_message TEXT,
  status guest_status NOT NULL DEFAULT 'NOT_OPENED',
  attendees_count SMALLINT NOT NULL DEFAULT 0 CHECK (attendees_count BETWEEN 0 AND 4),
  song_request VARCHAR(200),
  wish_message TEXT,
  opened_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes phục vụ tra cứu slug và lọc trạng thái
CREATE INDEX IF NOT EXISTS idx_guests_slug ON guests(slug);
CREATE INDEX IF NOT EXISTS idx_guests_status ON guests(status);
CREATE INDEX IF NOT EXISTS idx_guests_created_at ON guests(created_at DESC);

-- 4. Trigger tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_guests_updated_at ON guests;
CREATE TRIGGER trg_guests_updated_at
BEFORE UPDATE ON guests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5. Bảo mật RLS: Chặn toàn bộ truy cập trực tiếp từ anon/authenticated client
-- Mọi truy vấn đi qua Next.js Server bằng SUPABASE_SERVICE_ROLE_KEY
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
```

---

## 4. State Machine & Quy Tắc Nghiệp Vụ Cốt Lõi

### 4.1. Quy tắc chuyển đổi trạng thái (`guest_status`)
1. **Tạo mới:** `status = 'NOT_OPENED'`, `attendees_count = 0`, `opened_at = NULL`, `responded_at = NULL`.
2. **Ghi nhận mở thiệp (`POST /api/invites/[slug]/open`):**
   - CHỈ cập nhật `status = 'OPENED'` và `opened_at = NOW()` nếu hiện tại `status = 'NOT_OPENED'`.
   - Nếu `status` đã là `'OPENED'`, `'ACCEPTED'`, hoặc `'DECLINED'` → **không ghi đè**, trả về `200 OK` (idempotent).
3. **Gửi / Cập nhật RSVP (`POST /api/invites/[slug]/rsvp`):**
   - Nếu chọn `ACCEPTED`: `status = 'ACCEPTED'`, `attendees_count` bắt buộc nằm trong `1..4`, lưu `song_request` (trim, rỗng thành `null`), lưu `wish_message` (trim, rỗng thành `null`), `responded_at = NOW()`. Nếu `opened_at` đang `null` thì cập nhật luôn `NOW()`.
   - Nếu chọn `DECLINED`: `status = 'DECLINED'`, ép `attendees_count = 0`, `song_request = null`, lưu `wish_message`, `responded_at = NOW()`.
   - Cho phép khách gửi lại nhiều lần để cập nhật thay đổi lịch trình.

### 4.2. Hàm tạo Slug (`src/lib/slug.ts`)
- Đầu vào: `fullName: string` (Ví dụ: `"Nguyễn Minh Ánh"`).
- Xử lý:
  1. Chuẩn hóa Unicode NFD, loại bỏ dấu thanh tiếng Việt, đổi `đ/Đ` → `d`.
  2. Chuyển chữ thường, thay ký tự không phải chữ/số bằng `-`, gộp nhiều dấu `-` liên tiếp, cắt `-` hai đầu, giới hạn tối đa 60 ký tự.
  3. Nối thêm hậu tố ngẫu nhiên 4 ký tự an toàn (tập ký tự `abcdefghjkmnpqrstuvwxyz23456789` — bỏ `0, o, 1, l, i` tránh nhầm mắt).
- Đầu ra ví dụ: `nguyen-minh-anh-8x2k`.
- Khi insert vào DB nếu gặp lỗi unique violation (`23505`), tự động thử sinh lại hậu tố tối đa 3 lần.

### 4.3. Xác Thực Trang Quản Trị (`src/lib/auth.ts`)
- Không lưu mật khẩu thô trong cookie.
- Dùng HMAC-SHA256 (Node `crypto.createHmac` + `timingSafeEqual`) với `ADMIN_SESSION_SECRET` để ký payload `{ role: 'admin', exp: timestamp }`.
- Tên cookie: `invite_admin_session`.
- Thuộc tính cookie: `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax'`, `path: '/'`, `maxAge: 60 * 60 * 24 * 7` (7 ngày).
- Cung cấp hàm helper `requireAdmin()` cho toàn bộ route `/api/admin/*`.

---

## 5. Đặc Tả Chi Tiết Các API Endpoints

### 5.1. Public Invite APIs
- **`GET /api/invites/[slug]`**
  - Trả về `200`: `{ guest: PublicGuest }` (chỉ gồm `slug`, `full_name`, `custom_message`, `status`, `attendees_count`, `song_request`, `wish_message`, `responded_at` — không trả `id` nội bộ nếu không cần).
  - Trả về `404`: `{ error: 'Không tìm thấy thiệp mời' }`.

- **`POST /api/invites/[slug]/open`**
  - Cập nhật trạng thái `NOT_OPENED` → `OPENED`.
  - Trả về `200`: `{ ok: true, status }`.

- **`POST /api/invites/[slug]/rsvp`**
  - Rate limit: tối đa 20 requests / 10 phút theo IP.
  - Validate bằng Zod:
    ```ts
    const rsvpSchema = z.object({
      status: z.enum(['ACCEPTED', 'DECLINED']),
      attendees_count: z.number().int().min(0).max(4).optional(),
      song_request: z.string().trim().max(200).optional().nullable(),
      wish_message: z.string().trim().max(500).optional().nullable(),
    }).refine(
      (data) => data.status === 'DECLINED' || (data.attendees_count !== undefined && data.attendees_count >= 1 && data.attendees_count <= 4),
      { message: 'Vui lòng chọn số người tham dự từ 1 đến 4' }
    );
    ```
  - Trả về `200`: `{ ok: true, guest: PublicGuest }`.
  - Trả về `400`: `{ error: string }` nếu dữ liệu không hợp lệ.

### 5.2. Admin APIs
- **`POST /api/admin/auth`**
  - Rate limit: tối đa 5 lần sai / phút theo IP.
  - Body: `{ password: string }`. So sánh an toàn với `process.env.ADMIN_PASSWORD`.
  - Đúng: Set HttpOnly cookie, trả `200 { ok: true }`. Sai: Trả `401 { error: 'Mật khẩu không chính xác' }`.
- **`DELETE /api/admin/auth`**
  - Xóa cookie phiên làm việc, trả `200 { ok: true }`.

- **`GET /api/admin/guests`** (Yêu cầu Admin)
  - Query params tùy chọn: `?status=ALL|NOT_OPENED|OPENED|ACCEPTED|DECLINED&q=keyword`.
  - Trả về `200`:
    ```ts
    {
      guests: GuestRecord[];
      stats: {
        totalInvites: number;
        notOpened: number;
        openedOnly: number;
        acceptedInvites: number;
        totalAttendees: number; // Tổng attendees_count của các bản ghi ACCEPTED
        declinedInvites: number;
      };
    }
    ```

- **`POST /api/admin/guests`** (Yêu cầu Admin)
  - Body: `{ full_name: string (1..150), custom_message?: string (<= 1000) }`.
  - Sinh `slug`, insert DB, trả `201 { guest }`.

- **`POST /api/admin/guests/bulk`** (Yêu cầu Admin)
  - Body: `{ items: Array<{ full_name: string; custom_message?: string | null }> }` (tối thiểu 1, tối đa 200 dòng/lần).
  - Sinh `slug` duy nhất cho từng phần tử, thực hiện batch insert vào Supabase.
  - Trả `201`: `{ createdCount: number, guests: GuestRecord[] }`.

- **`PATCH /api/admin/guests/[id]`** (Yêu cầu Admin)
  - Body: `{ full_name?: string, custom_message?: string | null }`.
  - Cập nhật thông tin (giữ nguyên `slug` để không làm hỏng link đã gửi cho khách).
  - Trả `200`: `{ guest }`.

- **`DELETE /api/admin/guests/[id]`** (Yêu cầu Admin)
  - Xóa bản ghi theo `id`, trả `200 { ok: true }`.

### 5.3. Health Check / Keep-Alive API
- **`GET /api/health`**
  - Thực hiện truy vấn nhẹ: `supabaseAdmin.from('guests').select('id', { count: 'exact', head: true })`.
  - Disable cache (`export const dynamic = 'force-dynamic'`).
  - Thành công: trả `200 { status: 'ok', database: 'connected', timestamp: new Date().toISOString() }`.
  - Lỗi DB: trả `500 { status: 'error', database: 'disconnected' }`.

---

## 6. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- [ ] Gọi trực tiếp `/api/admin/guests` khi chưa đăng nhập trả về `401 Unauthorized`.
- [ ] Gọi `/api/invites/[slug]/open` sau khi khách đã `ACCEPTED` không làm thay đổi trạng thái về `OPENED`.
- [ ] Bulk insert 50 tên trùng nhau (ví dụ 2 người cùng tên "Nguyễn Minh Anh") sinh ra 2 `slug` khác nhau và không lỗi.
- [ ] `GET /api/health` kết nối được Supabase và trả `200 OK`.