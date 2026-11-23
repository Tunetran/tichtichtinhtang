import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { isAdminAuthenticated, verifyAdminPassword } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getSiteSettings, updateSiteSettings, type OrganizerContact, type SiteSettings } from '@/lib/site-settings';
import { deleteMediaFile } from '@/lib/storage-cleanup';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ASSET_BUCKET_NAME = 'event-assets';
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'image/svg',
];

const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'svg'];

/**
 * Đảm bảo bucket event-assets tồn tại và công khai trong Supabase Storage
 */
async function ensureAssetBucketExists(): Promise<void> {
  try {
    const { data: bucket, error } = await supabaseAdmin.storage.getBucket(ASSET_BUCKET_NAME);
    if (error || !bucket) {
      await supabaseAdmin.storage.createBucket(ASSET_BUCKET_NAME, {
        public: true,
        fileSizeLimit: MAX_IMAGE_SIZE,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
      });
    }
  } catch {
    // Tiếp tục dù không truy vấn được bucket
  }
}

/**
 * Kiểm tra xác thực admin: hỗ trợ session cookie, header x-admin-password, Bearer token, hoặc password trong body/form
 */
async function checkAdminAuth(
  req: Request,
  formData?: FormData,
  body?: Record<string, unknown> | null
): Promise<boolean> {
  // 1. Session cookie (gọi trực tiếp từ giao diện trang quản trị)
  if (await isAdminAuthenticated()) {
    return true;
  }

  // 2. Header x-admin-password
  const headerPassword = req.headers.get('x-admin-password');
  if (headerPassword && verifyAdminPassword(headerPassword)) {
    return true;
  }

  // 3. Authorization header: Bearer <password>
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ') && verifyAdminPassword(authHeader.substring(7).trim())) {
    return true;
  }

  // 4. Mật khẩu trong FormData
  const formPassword = formData?.get('password') || formData?.get('admin_password');
  if (typeof formPassword === 'string' && verifyAdminPassword(formPassword)) {
    return true;
  }

  // 5. Mật khẩu trong JSON body
  const bodyPassword = body?.password || body?.admin_password;
  if (typeof bodyPassword === 'string' && verifyAdminPassword(bodyPassword)) {
    return true;
  }

  return false;
}

/**
 * GET: Trả về { event_logo_url, event_bg_url, wax_seal_url, organizer_contact, thank_you_body } hiện tại
 */
export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(
    {
      event_logo_url: settings.event_logo_url,
      event_bg_url: settings.event_bg_url,
      wax_seal_url: settings.wax_seal_url,
      organizer_contact: settings.organizer_contact || null,
      thank_you_body: settings.thank_you_body || null,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}

/**
 * POST: Upload ảnh mới (logo, ảnh nền, hoặc con dấu sáp) lên bucket event-assets hoặc nhận URL ảnh trực tiếp
 */
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let isAuthorized = false;
    let file: File | null = null;
    let directUrl: string | null = null;
    let assetType: 'logo' | 'bg' | 'seal' = 'logo';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      isAuthorized = await checkAdminAuth(req, formData);
      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'Yêu cầu mật khẩu quản trị viên hoặc phiên đăng nhập admin' },
          { status: 401 }
        );
      }

      const target = (
        formData.get('type') ||
        formData.get('target') ||
        formData.get('asset_type') ||
        ''
      ).toString().toLowerCase();

      if (
        target === 'seal' ||
        target === 'wax_seal' ||
        target === 'wax-seal' ||
        formData.has('wax_seal_url') ||
        formData.has('seal_file')
      ) {
        assetType = 'seal';
      } else if (
        target === 'bg' ||
        target === 'background' ||
        formData.has('event_bg_url') ||
        formData.has('bg_file')
      ) {
        assetType = 'bg';
      } else {
        assetType = 'logo';
      }

      const formFile =
        formData.get('file') ||
        formData.get('seal_file') ||
        formData.get('bg_file') ||
        formData.get('logo') ||
        formData.get('image');

      if (formFile instanceof File && formFile.size > 0) {
        file = formFile;
      }

      const rawUrl =
        (assetType === 'seal' ? formData.get('wax_seal_url') || formData.get('seal_url') : null) ||
        (assetType === 'bg' ? formData.get('event_bg_url') || formData.get('bg_url') : null) ||
        formData.get('event_logo_url') ||
        formData.get('logo_url') ||
        formData.get('url');

      if (typeof rawUrl === 'string' && rawUrl.trim().length > 0) {
        directUrl = rawUrl.trim();
      }
    } else {
      const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
      isAuthorized = await checkAdminAuth(req, undefined, body);
      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'Yêu cầu mật khẩu quản trị viên hoặc phiên đăng nhập admin' },
          { status: 401 }
        );
      }

      // Xử lý lưu đối tượng organizer_contact hoặc gói cập nhật cài đặt tổng hợp
      if (
        body &&
        ('organizer_contact' in body ||
          'thank_you_body' in body ||
          ('event_logo_url' in body && 'event_bg_url' in body) ||
          ('wax_seal_url' in body && 'event_bg_url' in body))
      ) {
        let organizerContactToSave: OrganizerContact | null | undefined = undefined;
        if ('organizer_contact' in body) {
          if (body.organizer_contact && typeof body.organizer_contact === 'object') {
            const raw = body.organizer_contact as Record<string, unknown>;
            organizerContactToSave = {
              name: typeof raw.name === 'string' ? raw.name.trim() : '',
              phone: typeof raw.phone === 'string' ? raw.phone.trim() : '',
              email: typeof raw.email === 'string' ? raw.email.trim() : '',
              social_url: typeof raw.social_url === 'string' ? raw.social_url.trim() : '',
              note: typeof raw.note === 'string' ? raw.note.trim() : '',
            };
          } else {
            organizerContactToSave = null;
          }
        }

        const updates: Partial<SiteSettings> = {};
        if ('organizer_contact' in body) {
          updates.organizer_contact = organizerContactToSave;
        }
        if ('thank_you_body' in body) {
          updates.thank_you_body = typeof body.thank_you_body === 'string' ? body.thank_you_body.trim() : null;
        }
        if (typeof body.event_logo_url === 'string') {
          updates.event_logo_url = body.event_logo_url.trim() || null;
        }
        if (typeof body.event_bg_url === 'string') {
          updates.event_bg_url = body.event_bg_url.trim() || null;
        }
        if (typeof body.wax_seal_url === 'string') {
          updates.wax_seal_url = body.wax_seal_url.trim() || null;
        }

        const updated = await updateSiteSettings(updates);
        return NextResponse.json(
          {
            success: true,
            event_logo_url: updated.event_logo_url,
            event_bg_url: updated.event_bg_url,
            wax_seal_url: updated.wax_seal_url,
            organizer_contact: updated.organizer_contact || null,
            thank_you_body: updated.thank_you_body || null,
            message: 'Đã lưu cấu hình cài đặt thành công!',
          },
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            },
          }
        );
      }

      const target = (
        body?.type ||
        body?.target ||
        body?.asset_type ||
        ''
      ).toString().toLowerCase();

      if (
        target === 'seal' ||
        target === 'wax_seal' ||
        target === 'wax-seal' ||
        ('wax_seal_url' in (body || {}))
      ) {
        assetType = 'seal';
      } else if (
        target === 'bg' ||
        target === 'background' ||
        ('event_bg_url' in (body || {}))
      ) {
        assetType = 'bg';
      } else {
        assetType = 'logo';
      }

      const rawUrl =
        assetType === 'seal'
          ? body?.wax_seal_url || body?.seal_url || body?.url
          : assetType === 'bg'
          ? body?.event_bg_url || body?.bg_url || body?.url
          : body?.event_logo_url || body?.logo_url || body?.url;

      if (typeof rawUrl === 'string' && rawUrl.trim().length > 0) {
        directUrl = rawUrl.trim();
      }
    }

    if (!file && !directUrl) {
      return NextResponse.json(
        { error: 'Vui lòng chọn tệp ảnh để tải lên hoặc dán liên kết URL ảnh' },
        { status: 400 }
      );
    }

    let finalImageUrl: string | null = null;

    // 1. Trường hợp tải tệp ảnh lên bucket event-assets
    if (file) {
      const originalExt = file.name.split('.').pop()?.toLowerCase() || '';
      const isAllowedExt = ALLOWED_EXTENSIONS.includes(originalExt);
      const isAllowedMime =
        ALLOWED_MIME_TYPES.includes(file.type) || file.type.startsWith('image/');

      if (!isAllowedExt && !isAllowedMime) {
        return NextResponse.json(
          { error: 'Định dạng ảnh không hỗ trợ. Vui lòng chọn tệp PNG, JPG, WEBP hoặc SVG.' },
          { status: 400 }
        );
      }

      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: 'Kích thước tệp vượt quá giới hạn 10MB cho phép' },
          { status: 400 }
        );
      }

      let cleanExt = originalExt;
      if (!ALLOWED_EXTENSIONS.includes(cleanExt)) {
        cleanExt = 'png';
      }
      if (cleanExt === 'jpeg') cleanExt = 'jpg';

      const safeBaseName = file.name
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-')
        .slice(0, 30);

      const prefix = assetType === 'seal' ? 'seal' : assetType === 'bg' ? 'bg' : 'logo';
      const folder = assetType === 'seal' ? 'seals' : assetType === 'bg' ? 'backgrounds' : 'logos';
      const fileName = `${prefix}-${Date.now()}-${safeBaseName || 'asset'}.${cleanExt}`;
      const storagePath = `${folder}/${fileName}`;
      const uploadContentType =
        file.type || (cleanExt === 'svg' ? 'image/svg+xml' : `image/${cleanExt}`);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Thử tải lên Supabase Storage bucket event-assets
      try {
        await ensureAssetBucketExists();

        const { error: uploadError } = await supabaseAdmin.storage
          .from(ASSET_BUCKET_NAME)
          .upload(storagePath, buffer, {
            contentType: uploadContentType,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from(ASSET_BUCKET_NAME)
            .getPublicUrl(storagePath);

          if (publicUrlData?.publicUrl) {
            finalImageUrl = publicUrlData.publicUrl;
          }
        }
      } catch (storageErr) {
        console.error('[Settings] Lỗi upload Supabase Storage:', storageErr);
      }

      // Dự phòng lưu trữ cục bộ nếu Supabase Storage offline
      if (!finalImageUrl) {
        try {
          const localDir = path.join(process.cwd(), 'public', 'uploads', 'assets');
          if (!fs.existsSync(localDir)) {
            fs.mkdirSync(localDir, { recursive: true });
          }
          const localPath = path.join(localDir, fileName);
          fs.writeFileSync(localPath, buffer);
          finalImageUrl = `/uploads/assets/${fileName}`;
        } catch (localErr) {
          return NextResponse.json(
            { error: 'Không thể lưu trữ tệp: ' + (localErr as Error).message },
            { status: 500 }
          );
        }
      }
    } else if (directUrl) {
      // 2. Trường hợp nhập URL trực tiếp
      finalImageUrl = directUrl;
    }

    if (!finalImageUrl) {
      return NextResponse.json(
        { error: 'Không thể xử lý ảnh tải lên' },
        { status: 500 }
      );
    }

    const current = await getSiteSettings();

    if (assetType === 'seal') {
      const oldSealUrl = current.wax_seal_url;
      const updated = await updateSiteSettings({ wax_seal_url: finalImageUrl });

      if (oldSealUrl && oldSealUrl !== finalImageUrl) {
        await deleteMediaFile(oldSealUrl);
      }

      return NextResponse.json(
        {
          success: true,
          wax_seal_url: updated.wax_seal_url,
          message: 'Đã lưu ảnh con dấu sáp thành công!',
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        }
      );
    } else if (assetType === 'bg') {
      const oldBgUrl = current.event_bg_url;
      const updated = await updateSiteSettings({ event_bg_url: finalImageUrl });

      if (oldBgUrl && oldBgUrl !== finalImageUrl) {
        await deleteMediaFile(oldBgUrl);
      }

      return NextResponse.json(
        {
          success: true,
          event_bg_url: updated.event_bg_url,
          message: 'Đã lưu ảnh nền thiệp thành công!',
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        }
      );
    } else {
      const oldLogoUrl = current.event_logo_url;
      const updated = await updateSiteSettings({ event_logo_url: finalImageUrl });

      if (oldLogoUrl && oldLogoUrl !== finalImageUrl) {
        await deleteMediaFile(oldLogoUrl);
      }

      return NextResponse.json(
        {
          success: true,
          event_logo_url: updated.event_logo_url,
          message: 'Đã lưu logo sự kiện thành công!',
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ', details: (err as Error).message },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Gỡ bỏ logo sự kiện, ảnh nền hoặc con dấu sáp hiện tại
 */
export async function DELETE(req: Request) {
  try {
    const isAuthorized = await checkAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Yêu cầu mật khẩu quản trị viên hoặc phiên đăng nhập admin' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const target = (
      url.searchParams.get('target') ||
      url.searchParams.get('type') ||
      'logo'
    ).toLowerCase();

    const current = await getSiteSettings();

    if (target === 'seal' || target === 'wax_seal' || target === 'wax-seal') {
      if (current.wax_seal_url) {
        await deleteMediaFile(current.wax_seal_url);
      }
      await updateSiteSettings({ wax_seal_url: null });

      return NextResponse.json(
        {
          success: true,
          wax_seal_url: null,
          message: 'Đã gỡ bỏ con dấu sáp, quay về mặc định!',
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        }
      );
    } else if (target === 'bg' || target === 'background') {
      if (current.event_bg_url) {
        await deleteMediaFile(current.event_bg_url);
      }
      await updateSiteSettings({ event_bg_url: null });

      return NextResponse.json(
        {
          success: true,
          event_bg_url: null,
          message: 'Đã gỡ bỏ ảnh nền thiệp, quay về nền mặc định!',
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        }
      );
    } else {
      if (current.event_logo_url) {
        await deleteMediaFile(current.event_logo_url);
      }
      await updateSiteSettings({ event_logo_url: null });

      return NextResponse.json(
        {
          success: true,
          event_logo_url: null,
          message: 'Đã gỡ bỏ logo sự kiện!',
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ', details: (err as Error).message },
      { status: 500 }
    );
  }
}
