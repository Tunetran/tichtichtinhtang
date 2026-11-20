import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from './supabase-admin';

export interface ParsedStorageMedia {
  type: 'supabase' | 'local' | 'external';
  bucket?: string;
  storagePath?: string;
  localPath?: string;
}

/**
 * Phân tích đường dẫn tệp media để xác định nguồn lưu trữ
 */
export function parseMediaUrl(url: string | null | undefined): ParsedStorageMedia | null {
  if (!url || typeof url !== 'string') return null;

  // 1. Nhận diện Supabase Storage URL
  // Định dạng: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const supabaseRegex = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/;
  const match = url.match(supabaseRegex);
  if (match) {
    const bucket = match[1];
    const storagePath = decodeURIComponent(match[2]);
    return {
      type: 'supabase',
      bucket,
      storagePath,
    };
  }

  // 2. Nhận diện Local Uploads fallback: /uploads/...
  if (url.startsWith('/uploads/')) {
    const relativePath = url.replace(/^\//, '');
    const localPath = path.join(process.cwd(), 'public', relativePath);
    return {
      type: 'local',
      localPath,
    };
  }

  // 3. Tệp tĩnh mặc định của code (/images/photo-1.jpg, /music/bg-love.mp3) hoặc link ngoài (Unsplash,...) -> không xóa
  return {
    type: 'external',
  };
}

/**
 * Xóa một tệp media khỏi Supabase Storage hoặc local disk fallback
 */
export async function deleteMediaFile(url: string | null | undefined): Promise<boolean> {
  const parsed = parseMediaUrl(url);
  if (!parsed || parsed.type === 'external') {
    return false;
  }

  // Xóa trên Supabase Storage
  if (parsed.type === 'supabase' && parsed.bucket && parsed.storagePath) {
    try {
      const { error } = await supabaseAdmin.storage
        .from(parsed.bucket)
        .remove([parsed.storagePath]);

      if (error) {
        console.error(
          `[Storage Cleanup] Lỗi xóa tệp Supabase (${parsed.bucket}/${parsed.storagePath}):`,
          error.message
        );
        return false;
      }
      return true;
    } catch (err) {
      console.error('[Storage Cleanup] Lỗi kết nối Supabase khi xóa tệp:', err);
      return false;
    }
  }

  // Xóa trên đĩa local fallback
  if (parsed.type === 'local' && parsed.localPath) {
    try {
      if (fs.existsSync(parsed.localPath)) {
        fs.unlinkSync(parsed.localPath);
        return true;
      }
    } catch (err) {
      console.error('[Storage Cleanup] Lỗi xóa tệp local:', err);
      return false;
    }
  }

  return false;
}

/**
 * Xóa danh sách nhiều tệp media cùng lúc
 */
export async function deleteMultipleMediaFiles(
  urls: (string | null | undefined)[]
): Promise<void> {
  const validUrls = urls.filter((u): u is string => Boolean(u));
  await Promise.allSettled(validUrls.map((url) => deleteMediaFile(url)));
}
