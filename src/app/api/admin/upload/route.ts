import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { deleteMediaFile } from '@/lib/storage-cleanup';

export const dynamic = 'force-dynamic';

const IMAGE_BUCKET_NAME = 'event-images';
const AUDIO_BUCKET_NAME = 'event-audio';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_SIZE = 30 * 1024 * 1024; // 30MB

const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

const ALLOWED_AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/x-m4a',
  'audio/m4a',
  'audio/aac',
  'audio/x-wav',
];

/**
 * Đảm bảo bucket tồn tại trong Supabase Storage và ở chế độ Public
 */
async function ensureBucketExists(
  bucketName: string,
  sizeLimit: number,
  allowedMimes: string[]
): Promise<void> {
  try {
    const { data: bucket, error } = await supabaseAdmin.storage.getBucket(bucketName);
    if (error || !bucket) {
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: sizeLimit,
        allowedMimeTypes: allowedMimes,
      });
    }
  } catch {
    // Tiếp tục thực hiện upload dù không kiểm tra được bucket
  }
}

export async function POST(req: Request) {
  // 1. Kiểm tra xác thực Admin
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Vui lòng chọn một tệp để tải lên' },
        { status: 400 }
      );
    }

    const originalExt = file.name.split('.').pop()?.toLowerCase() || '';
    const isImageExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(originalExt);
    const isAudioExt = ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(originalExt);

    const isImage = ALLOWED_IMAGE_MIMES.includes(file.type) || isImageExt;
    const isAudio =
      ALLOWED_AUDIO_MIMES.includes(file.type) ||
      file.type.startsWith('audio/') ||
      isAudioExt;

    if (!isImage && !isAudio) {
      return NextResponse.json(
        {
          error:
            'Định dạng không được hỗ trợ. Vui lòng tải lên tệp hình ảnh (JPEG, PNG, WEBP, GIF, AVIF) hoặc tệp âm thanh (MP3, WAV, OGG, M4A, AAC)',
        },
        { status: 400 }
      );
    }

    // 2. Kiểm tra kích thước tệp
    const maxLimit = isAudio ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;
    const limitLabel = isAudio ? '30MB' : '10MB';
    if (file.size > maxLimit) {
      return NextResponse.json(
        { error: `Kích thước tệp vượt quá giới hạn cho phép (${limitLabel})` },
        { status: 400 }
      );
    }

    // 3. Chuẩn hóa tên và định dạng tệp
    let cleanExt = originalExt;
    if (isAudio && !['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(cleanExt)) {
      cleanExt = 'mp3';
    } else if (isImage && !['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(cleanExt)) {
      cleanExt = 'jpg';
    }

    const safeBaseName = file.name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .slice(0, 40);

    const bucketName = isAudio ? AUDIO_BUCKET_NAME : IMAGE_BUCKET_NAME;
    const subFolder = isAudio ? 'audio' : 'images';
    const fileName = `${Date.now()}-${safeBaseName || subFolder}.${cleanExt}`;
    const storagePath = `uploads/${subFolder}/${fileName}`;
    const contentType =
      file.type || (isAudio ? 'audio/mpeg' : 'image/jpeg');

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Thử upload lên Supabase Storage
    try {
      await ensureBucketExists(
        bucketName,
        maxLimit,
        isAudio ? ALLOWED_AUDIO_MIMES : ALLOWED_IMAGE_MIMES
      );

      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(storagePath, buffer, {
          contentType,
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from(bucketName)
          .getPublicUrl(storagePath);

        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
            storage: 'supabase',
            type: isAudio ? 'audio' : 'image',
            fileName: file.name,
            size: file.size,
          });
        }
      }
    } catch {
      // Supabase Storage gặp lỗi kết nối -> chuyển sang fallback cục bộ
    }

    // 5. Fallback lưu trữ cục bộ nếu Supabase offline hoặc môi trường dev không mạng
    try {
      const localUploadsDir = path.join(process.cwd(), 'public', 'uploads', subFolder);
      if (!fs.existsSync(localUploadsDir)) {
        fs.mkdirSync(localUploadsDir, { recursive: true });
      }

      const localFilePath = path.join(localUploadsDir, fileName);
      fs.writeFileSync(localFilePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${subFolder}/${fileName}`,
        storage: 'local-fallback',
        type: isAudio ? 'audio' : 'image',
        fileName: file.name,
        size: file.size,
        note: `Đã lưu trữ cục bộ dự phòng (Supabase Storage offline)`,
      });
    } catch (localErr) {
      return NextResponse.json(
        { error: 'Không thể lưu trữ tệp: ' + (localErr as Error).message },
        { status: 500 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi xử lý tệp: ' + (err as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Xóa một tệp media khỏi Supabase Storage (hoặc local fallback)
 */
export async function DELETE(req: Request) {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await req.json().catch(() => null);
    const url = body?.url;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Đường dẫn tệp không hợp lệ' }, { status: 400 });
    }

    const deleted = await deleteMediaFile(url);
    return NextResponse.json({ success: true, deleted, url });
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi khi xóa tệp: ' + (err as Error).message },
      { status: 500 }
    );
  }
}
