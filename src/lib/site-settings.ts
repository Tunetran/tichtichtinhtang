import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from './supabase-admin';
import type { SiteSettings } from './site-settings-shared';

export * from './site-settings-shared';

const LOCAL_SITE_SETTINGS_PATH = path.join(process.cwd(), 'config', 'site-settings.json');

/**
 * Lấy cấu hình site_settings hiện tại (kết hợp Supabase -> file dự phòng cục bộ)
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  // 1. Thử lấy từ Supabase
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('event_logo_url, event_bg_url, wax_seal_url, organizer_contact, thank_you_body, updated_at')
      .eq('id', 'main')
      .maybeSingle();

    if (!error && data) {
      return {
        event_logo_url: data.event_logo_url || null,
        event_bg_url: data.event_bg_url || null,
        wax_seal_url: data.wax_seal_url || null,
        organizer_contact: data.organizer_contact || null,
        thank_you_body: data.thank_you_body || null,
        updated_at: data.updated_at,
      };
    }
  } catch {
    // Bỏ qua lỗi kết nối Supabase, chuyển sang fallback
  }

  // 2. Fallback đọc từ file cục bộ nếu Supabase offline hoặc chưa chạy migration
  try {
    if (fs.existsSync(LOCAL_SITE_SETTINGS_PATH)) {
      const fileData = fs.readFileSync(LOCAL_SITE_SETTINGS_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (parsed && typeof parsed === 'object') {
        return {
          event_logo_url: parsed.event_logo_url || null,
          event_bg_url: parsed.event_bg_url || null,
          wax_seal_url: parsed.wax_seal_url || null,
          organizer_contact: parsed.organizer_contact || null,
          thank_you_body: parsed.thank_you_body || null,
          updated_at: parsed.updated_at,
        };
      }
    }
  } catch {
    // Bỏ qua lỗi đọc file
  }

  return { event_logo_url: null, event_bg_url: null, wax_seal_url: null, organizer_contact: null, thank_you_body: null };
}

/**
 * Cập nhật cấu hình site_settings (đồng bộ Supabase & file dự phòng cục bộ)
 */
export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...settings,
    updated_at: new Date().toISOString(),
  };

  // 1. Lưu dự phòng vào file cục bộ
  try {
    const configDir = path.dirname(LOCAL_SITE_SETTINGS_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_SITE_SETTINGS_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch {
    // Bỏ qua nếu môi trường chỉ đọc (Vercel serverless)
  }

  // 2. Lưu vào bảng site_settings trong Supabase
  try {
    const { error: supabaseError } = await supabaseAdmin
      .from('site_settings')
      .upsert({
        id: 'main',
        event_logo_url: updated.event_logo_url,
        event_bg_url: updated.event_bg_url,
        wax_seal_url: updated.wax_seal_url,
        organizer_contact: updated.organizer_contact ?? null,
        thank_you_body: updated.thank_you_body ?? null,
        updated_at: updated.updated_at,
      });

    if (supabaseError) {
      console.error('[SiteSettings] Lỗi lưu Supabase site_settings:', supabaseError.message);
    }
  } catch (err) {
    console.error('[SiteSettings] Lỗi kết nối Supabase site_settings:', err);
  }

  return updated;
}
