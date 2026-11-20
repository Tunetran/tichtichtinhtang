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
