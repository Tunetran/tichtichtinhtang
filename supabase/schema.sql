-- 1. Enum 4 trạng thái bắt buộc
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'guest_status') THEN
    CREATE TYPE guest_status AS ENUM ('NOT_OPENED', 'OPENED', 'ACCEPTED', 'DECLINED');
  END IF;
END $$;

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

-- 6. Bảng event_settings lưu trữ tùy chỉnh nội dung & câu từ từ Admin
CREATE TABLE IF NOT EXISTS event_settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;

-- 6.1. Policies cho phép service_role toàn quyền CRUD trên bảng guests và event_settings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'guests' AND policyname = 'service_role_all_guests'
  ) THEN
    CREATE POLICY "service_role_all_guests" ON guests
    FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'event_settings' AND policyname = 'service_role_all_event_settings'
  ) THEN
    CREATE POLICY "service_role_all_event_settings" ON event_settings
    FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 7. Cấu hình Storage Bucket 'event-images' lưu trữ ảnh sự kiện
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Cho phép đọc công khai ảnh trong bucket event-images
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access event-images'
  ) THEN
    CREATE POLICY "Public Access event-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'event-images');
  END IF;
END $$;

-- 8. Cấu hình Storage Bucket 'event-audio' lưu trữ nhạc nền sự kiện
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-audio',
  'event-audio',
  true,
  31457280, -- 30MB
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/m4a', 'audio/aac']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Cho phép đọc công khai tệp âm thanh trong bucket event-audio
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access event-audio'
  ) THEN
    CREATE POLICY "Public Access event-audio"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'event-audio');
  END IF;
END $$;

-- 9. Bảng site_settings quản lý cài đặt trang & Logo sự kiện động
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  event_logo_url TEXT,
  event_bg_url TEXT,
  wax_seal_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bổ sung cột event_bg_url và wax_seal_url nếu bảng đã tồn tại từ trước
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS event_bg_url TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS wax_seal_url TEXT;

-- Chèn sẵn 1 dòng mặc định id = 'main'
INSERT INTO site_settings (id, event_logo_url)
VALUES ('main', NULL)
ON CONFLICT (id) DO NOTHING;

-- Trigger tự động cập nhật updated_at cho site_settings
DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON site_settings;
CREATE TRIGGER trg_site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Bảo mật RLS cho site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'service_role_all_site_settings'
  ) THEN
    CREATE POLICY "service_role_all_site_settings" ON site_settings
    FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'public_read_site_settings'
  ) THEN
    CREATE POLICY "public_read_site_settings" ON site_settings
    FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

-- 10. Cấu hình Storage Bucket 'event-assets' lưu ảnh logo sự kiện (PNG, JPG, WEBP, SVG)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-assets',
  'event-assets',
  true,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Cho phép đọc công khai tệp trong bucket event-assets
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access event-assets'
  ) THEN
    CREATE POLICY "Public Access event-assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'event-assets');
  END IF;
END $$;
