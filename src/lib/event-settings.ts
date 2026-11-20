import fs from 'fs';
import path from 'path';
import { EVENT_CONFIG, type EventConfig } from '@/config/event';
import { supabaseAdmin } from './supabase-admin';
import { deleteMediaFile } from './storage-cleanup';

const LOCAL_OVERRIDE_PATH = path.join(process.cwd(), 'config', 'custom-event.json');

/**
 * Đọc cấu hình sự kiện hiện hành (kết hợp Supabase -> file dự phòng -> mặc định code)
 */
export async function getEventConfig(): Promise<EventConfig> {
  // 1. Thử lấy từ Supabase
  try {
    const { data, error } = await supabaseAdmin
      .from('event_settings')
      .select('config')
      .eq('id', 'default')
      .maybeSingle();

    if (!error && data?.config && typeof data.config === 'object') {
      return {
        ...EVENT_CONFIG,
        ...(data.config as Partial<EventConfig>),
      };
    }
  } catch {
    // Bỏ qua lỗi kết nối Supabase, chuyển sang fallback
  }

  // 2. Fallback đọc từ file custom-event.json nếu có
  try {
    if (fs.existsSync(LOCAL_OVERRIDE_PATH)) {
      const fileData = fs.readFileSync(LOCAL_OVERRIDE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (parsed && typeof parsed === 'object') {
        return {
          ...EVENT_CONFIG,
          ...parsed,
        };
      }
    }
  } catch {
    // Bỏ qua lỗi đọc file
  }

  // 3. Trả về cấu hình gốc mặc định
  return EVENT_CONFIG;
}

/**
 * Cập nhật cấu hình sự kiện từ Admin Dashboard
 */
export async function updateEventConfig(partial: Partial<EventConfig>): Promise<EventConfig> {
  const current = await getEventConfig();
  const merged: EventConfig = {
    ...current,
    ...partial,
    dresscodeColors: partial.dresscodeColors || current.dresscodeColors,
    timeline: partial.timeline || current.timeline,
    gallery: partial.gallery !== undefined ? partial.gallery : current.gallery,
    generalInvitationText: partial.generalInvitationText || current.generalInvitationText,
    audio: {
      ...current.audio,
      ...(partial.audio || {}),
    },
    showCountdown: partial.showCountdown !== undefined ? partial.showCountdown : current.showCountdown,
    showGallery: partial.showGallery !== undefined ? partial.showGallery : current.showGallery,
    showSongRequest: partial.showSongRequest !== undefined ? partial.showSongRequest : current.showSongRequest,
  };

  // 1. Lưu dự phòng vào file local
  try {
    fs.writeFileSync(LOCAL_OVERRIDE_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  } catch {
    // Bỏ qua nếu môi trường read-only (ví dụ serverless Vercel)
  }

  // 2. Lưu vào Supabase
  try {
    const { error: supabaseError } = await supabaseAdmin
      .from('event_settings')
      .upsert({
        id: 'default',
        config: merged,
        updated_at: new Date().toISOString(),
      });

    if (supabaseError) {
      console.error('Lỗi khi lưu Supabase event_settings:', supabaseError.message);
    }
  } catch (err) {
    console.error('Lỗi kết nối Supabase event_settings:', err);
  }

  // 3. Tự động dọn dẹp các tệp media cũ đã bị xóa hoặc thay thế khỏi Supabase Storage
  try {
    // a. Xóa nhạc nền cũ nếu đã bị thay thế bằng bài mới
    if (current.audio?.src && current.audio.src !== merged.audio?.src) {
      await deleteMediaFile(current.audio.src);
    }

    // b. Xóa ảnh bìa OG Image cũ nếu đã bị thay thế
    if (current.ogImage && current.ogImage !== merged.ogImage) {
      await deleteMediaFile(current.ogImage);
    }

    // c. Xóa ảnh Thư viện (Gallery) nếu bị xóa hoặc thay thế
    const newGallerySrcs = new Set((merged.gallery || []).map((p) => p.src));
    const removedPhotos = (current.gallery || []).filter(
      (p) => p.src && !newGallerySrcs.has(p.src)
    );
    for (const p of removedPhotos) {
      await deleteMediaFile(p.src);
    }
  } catch (cleanErr) {
    console.error('Lỗi khi dọn dẹp tệp media cũ:', cleanErr);
  }

  return merged;
}

/**
 * Đặt lại cấu hình về mặc định ban đầu
 */
export async function resetEventConfig(): Promise<EventConfig> {
  const current = await getEventConfig();

  // Dọn dẹp toàn bộ tệp media người dùng đã tải lên trước khi reset
  try {
    if (current.audio?.src) await deleteMediaFile(current.audio.src);
    if (current.ogImage) await deleteMediaFile(current.ogImage);
    if (current.gallery) {
      for (const p of current.gallery) {
        await deleteMediaFile(p.src);
      }
    }
  } catch {}

  try {
    if (fs.existsSync(LOCAL_OVERRIDE_PATH)) {
      fs.unlinkSync(LOCAL_OVERRIDE_PATH);
    }
  } catch {}

  try {
    const { error: deleteError } = await supabaseAdmin
      .from('event_settings')
      .delete()
      .eq('id', 'default');
    if (deleteError) {
      console.error('Lỗi khi xóa Supabase event_settings:', deleteError.message);
    }
  } catch (err) {
    console.error('Lỗi kết nối Supabase khi xóa event_settings:', err);
  }

  return EVENT_CONFIG;
}
