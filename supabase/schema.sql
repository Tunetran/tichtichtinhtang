-- ==============================================================================
-- TỊCH TỊCH TÌNH TANG - SUPABASE DATABASE SCHEMA & STORAGE SETUP
-- ==============================================================================
-- Tệp SQL này có tính lũy kế (idempotent), an toàn chạy nhiều lần trên Supabase.
-- ==============================================================================

-- 0. CẤP QUYỀN TRUY CẬP SCHEMA PUBLIC CHO CÁC ROLE SUPABASE (service_role, anon, authenticated)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- 1. ENUM TRẠNG THÁI KHÁCH MỜI
DO $$ BEGIN
  CREATE TYPE guest_status AS ENUM ('NOT_OPENED', 'OPENED', 'ACCEPTED', 'DECLINED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. BẢNG GUESTS (QUẢN LÝ KHÁCH MỜI & XÁC NHẬN RSVP)
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(150),
  custom_message TEXT,
  status guest_status NOT NULL DEFAULT 'NOT_OPENED',
  attendees_count SMALLINT NOT NULL DEFAULT 0,
  guests_count INTEGER NOT NULL DEFAULT 1,
  song_request VARCHAR(200),
  wish_message TEXT,
  opened_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bổ sung các cột nếu bảng đã được tạo từ trước
ALTER TABLE guests ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS email VARCHAR(150);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS guests_count INTEGER DEFAULT 1;
ALTER TABLE guests DROP CONSTRAINT IF EXISTS guests_attendees_count_check;
ALTER TABLE guests ADD CONSTRAINT guests_attendees_count_check CHECK (attendees_count >= 0);

-- 3. CHỈ MỤC TỐI ƯU TRA CỨU & TÌM KIẾM
CREATE INDEX IF NOT EXISTS idx_guests_slug ON guests(slug);
CREATE INDEX IF NOT EXISTS idx_guests_status ON guests(status);
CREATE INDEX IF NOT EXISTS idx_guests_full_name ON guests(full_name);
CREATE INDEX IF NOT EXISTS idx_guests_created_at ON guests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guests_responded_at ON guests(responded_at DESC NULLS LAST);

-- 4. HÀM & TRIGGER TỰ ĐỘNG CẬP NHẬT UPDATED_AT
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

-- 5. PHÂN QUYỀN BẢO MẬT RLS CHO BẢNG GUESTS
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_guests" ON guests;
CREATE POLICY "service_role_all_guests" ON guests
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. BẢNG EVENT_SETTINGS (CẤU HÌNH THỜI GIAN, ĐỊA ĐIỂM, LỊCH TRÌNH TỪ ADMIN)
CREATE TABLE IF NOT EXISTS event_settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_event_settings_updated_at ON event_settings;
CREATE TRIGGER trg_event_settings_updated_at
BEFORE UPDATE ON event_settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_event_settings" ON event_settings;
CREATE POLICY "service_role_all_event_settings" ON event_settings
FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_event_settings" ON event_settings;
CREATE POLICY "public_read_event_settings" ON event_settings
FOR SELECT TO anon, authenticated USING (true);

-- 7. BẢNG SITE_SETTINGS (QUẢN LÝ LOGO, NỀN, CON DẤU SÁP ĐỘNG)
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  event_logo_url TEXT,
  event_bg_url TEXT,
  wax_seal_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS event_bg_url TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS wax_seal_url TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS organizer_contact JSONB;

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON site_settings;
CREATE TRIGGER trg_site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_site_settings" ON site_settings;
CREATE POLICY "service_role_all_site_settings" ON site_settings
FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings" ON site_settings
FOR SELECT TO anon, authenticated USING (true);

-- CẤP QUYỀN TRÊN TẤT CẢ CÁC BẢNG CHO SERVICE_ROLE & CÁC ROLE HỆ THỐNG
GRANT ALL ON TABLE guests TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE event_settings TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE site_settings TO postgres, anon, authenticated, service_role;

-- 8. CẤU HÌNH SUPABASE STORAGE BUCKETS (PUBLIC MEDIA)
-- Tạo 3 bucket lưu trữ: event-images, event-audio, event-assets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('event-images', 'event-images', true),
  ('event-audio', 'event-audio', true),
  ('event-assets', 'event-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Cho phép đọc công khai (SELECT) các file trong 3 bucket sự kiện
DROP POLICY IF EXISTS "Public Access for Event Buckets" ON storage.objects;
CREATE POLICY "Public Access for Event Buckets"
ON storage.objects FOR SELECT
USING (bucket_id IN ('event-images', 'event-audio', 'event-assets'));

-- 9. DỮ LIỆU KHỞI TẠO MẶC ĐỊNH (SEED DATA)
-- 9.1. Cài đặt site_settings ban đầu trỏ về bộ nhận diện Tịch Tịch Tình Tang
INSERT INTO site_settings (id, event_logo_url, event_bg_url, wax_seal_url)
VALUES (
  'main',
  '/images/logo-tichtichtinhtang.png',
  '/images/bg-bamboo-lotus.png',
  '/images/wax-seal-combined.png'
)
ON CONFLICT (id) DO UPDATE SET
  event_logo_url = COALESCE(site_settings.event_logo_url, EXCLUDED.event_logo_url),
  event_bg_url = COALESCE(site_settings.event_bg_url, EXCLUDED.event_bg_url),
  wax_seal_url = COALESCE(site_settings.wax_seal_url, EXCLUDED.wax_seal_url);

-- 9.2. Khởi tạo event_settings mặc định
INSERT INTO event_settings (id, config)
VALUES ('default', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 9.3. Khởi tạo sẵn thiệp mời mẫu (demo & thay-co)
INSERT INTO guests (slug, full_name, custom_message, status)
VALUES
  (
    'demo',
    'Khách Mời Danh Dự',
    'Trân trọng kính mời bạn đến tham dự đêm nhạc đầm ấm Tịch Tịch Tình Tang cùng chúng mình.',
    'NOT_OPENED'
  ),
  (
    'thay-co',
    'Quý Thầy/Cô',
    'Kính gửi Quý Thầy/Cô lời mời trân trọng nhất đến tham dự đêm nhạc đầm ấm cùng chúng em.',
    'NOT_OPENED'
  )
ON CONFLICT (slug) DO NOTHING;

-- 10. THÔNG BÁO POSTGREST TẢI LẠI SCHEMA NGAY LẬP TỨC
NOTIFY pgrst, 'reload schema';

