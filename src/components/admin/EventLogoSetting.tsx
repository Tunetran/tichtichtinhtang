'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  ExternalLink,
  Layers,
  Award,
} from 'lucide-react';

interface EventLogoSettingProps {
  onLogoUpdated?: (newLogoUrl: string | null) => void;
  onBgUpdated?: (newBgUrl: string | null) => void;
  onSealUpdated?: (newSealUrl: string | null) => void;
}

export function EventLogoSetting({ onLogoUpdated, onBgUpdated, onSealUpdated }: EventLogoSettingProps) {
  // Logo state
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUrlInput, setLogoUrlInput] = useState<string>('');
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);
  const [isSavingLogo, setIsSavingLogo] = useState<boolean>(false);

  // Background state
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [bgUrlInput, setBgUrlInput] = useState<string>('');
  const [isUploadingBg, setIsUploadingBg] = useState<boolean>(false);
  const [isSavingBg, setIsSavingBg] = useState<boolean>(false);

  // Wax Seal state
  const [waxSealUrl, setWaxSealUrl] = useState<string | null>(null);
  const [waxSealUrlInput, setWaxSealUrlInput] = useState<string>('');
  const [isUploadingSeal, setIsUploadingSeal] = useState<boolean>(false);
  const [isSavingSeal, setIsSavingSeal] = useState<boolean>(false);

  // General loading & notification
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const bgFileInputRef = useRef<HTMLInputElement | null>(null);
  const sealFileInputRef = useRef<HTMLInputElement | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage((current) => (current?.text === text ? null : current));
    }, 4000);
  };

  // 1. Tải cài đặt hiện tại từ API
  useEffect(() => {
    let mounted = true;
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            if (data.event_logo_url) {
              setLogoUrl(data.event_logo_url);
              setLogoUrlInput(data.event_logo_url);
            }
            if (data.event_bg_url) {
              setBgUrl(data.event_bg_url);
              setBgUrlInput(data.event_bg_url);
            }
            if (data.wax_seal_url) {
              setWaxSealUrl(data.wax_seal_url);
              setWaxSealUrlInput(data.wax_seal_url);
            }
          }
        }
      } catch {
        // Bỏ qua lỗi kết nối
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchSettings();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Upload Logo từ máy
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');

      const res = await fetch('/api/settings', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể tải ảnh logo lên');
      }

      const newUrl = data.event_logo_url;
      setLogoUrl(newUrl);
      setLogoUrlInput(newUrl || '');
      showNotification('success', 'Đã tải ảnh lên và cập nhật logo sự kiện thành công!');
      if (onLogoUpdated) onLogoUpdated(newUrl);
    } catch (err) {
      showNotification('error', (err as Error).message);
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = '';
      }
    }
  };

  // 3. Lưu Logo qua URL
  const handleSaveLogoUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = logoUrlInput.trim();

    setIsSavingLogo(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_logo_url: trimmed || null, type: 'logo' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể lưu đường dẫn logo');
      }

      const newUrl = data.event_logo_url;
      setLogoUrl(newUrl);
      setLogoUrlInput(newUrl || '');
      showNotification('success', 'Đã lưu cài đặt logo sự kiện thành công!');
      if (onLogoUpdated) onLogoUpdated(newUrl);
    } catch (err) {
      showNotification('error', (err as Error).message);
    } finally {
      setIsSavingLogo(false);
    }
  };

  // 4. Gỡ Logo hiện tại
  const handleRemoveLogo = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn gỡ bỏ logo sự kiện hiện tại?')) return;

    setIsSavingLogo(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/settings?target=logo', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể gỡ logo');
      }

      setLogoUrl(null);
      setLogoUrlInput('');
      showNotification('success', 'Đã gỡ bỏ logo sự kiện!');
      if (onLogoUpdated) onLogoUpdated(null);
    } catch (err) {
      showNotification('error', (err as Error).message);
    } finally {
      setIsSavingLogo(false);
    }
  };

  // 5. Upload Background từ máy
  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBg(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'bg');

      const res = await fetch('/api/settings', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể tải ảnh nền lên');
      }

      const newUrl = data.event_bg_url;
      setBgUrl(newUrl);
      setBgUrlInput(newUrl || '');
      showNotification('success', 'Đã tải ảnh lên và áp dụng ảnh nền thiệp thành công!');
      if (onBgUpdated) onBgUpdated(newUrl);
    } catch (err) {
      showNotification('error', (err as Error).message);
    } finally {
      setIsUploadingBg(false);
      if (bgFileInputRef.current) {
        bgFileInputRef.current.value = '';
      }
    }
  };

  // 6. Lưu Background qua URL
  const handleSaveBgUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = bgUrlInput.trim();

    setIsSavingBg(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_bg_url: trimmed || null, type: 'bg' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể lưu đường dẫn ảnh nền');
      }

      const newUrl = data.event_bg_url;
      setBgUrl(newUrl);
      setBgUrlInput(newUrl || '');
      showNotification('success', 'Đã lưu cài đặt ảnh nền thiệp thành công!');
      if (onBgUpdated) onBgUpdated(newUrl);
    } catch (err) {
      showNotification('error', (err as Error).message);
    } finally {
      setIsSavingBg(false);
    }
  };

  // 7. Gỡ Background (quay về nền mặc định)
  const handleRemoveBg = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh nền và quay về nền mặc định?')) return;

    setIsSavingBg(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/settings?target=bg', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể xóa ảnh nền');
      }

      setBgUrl(null);
      setBgUrlInput('');
      showNotification('success', 'Đã xóa ảnh nền, thiệp quay về giao diện mặc định!');
      if (onBgUpdated) onBgUpdated(null);
    } catch (err) {
      showNotification('error', (err as Error).message);
    } finally {
      setIsSavingBg(false);
    }
  };

  // 8. Upload Wax Seal từ máy
  const handleSealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSeal(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'seal');

      const res = await fetch('/api/settings', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể tải ảnh con dấu sáp lên');
      }

      const newUrl = data.wax_seal_url;
      setWaxSealUrl(newUrl);
      setWaxSealUrlInput(newUrl || '');
      showNotification('success', 'Đã tải ảnh lên và cập nhật con dấu sáp thành công!');
      if (onSealUpdated) onSealUpdated(newUrl);
    } catch (err) {
      showNotification('error', (err as Error).message);
    } finally {
      setIsUploadingSeal(false);
      if (sealFileInputRef.current) {
        sealFileInputRef.current.value = '';
      }
    }
  };

  // 9. Lưu Wax Seal qua URL
  const handleSaveSealUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = waxSealUrlInput.trim();

    setIsSavingSeal(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wax_seal_url: trimmed || null, type: 'seal' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể lưu đường dẫn con dấu sáp');
      }

      const newUrl = data.wax_seal_url;
      setWaxSealUrl(newUrl);
      setWaxSealUrlInput(newUrl || '');
      showNotification('success', 'Đã lưu cài đặt con dấu sáp thành công!');
      if (onSealUpdated) onSealUpdated(newUrl);
    } catch (err) {
      showNotification('error', (err as Error).message);
    } finally {
      setIsSavingSeal(false);
    }
  };

  // 10. Gỡ Wax Seal (quay về mặc định)
  const handleRemoveSeal = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn gỡ con dấu sáp riêng và quay về con dấu mặc định?')) return;

    setIsSavingSeal(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/settings?target=seal', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể gỡ con dấu sáp');
      }

      setWaxSealUrl(null);
      setWaxSealUrlInput('');
      showNotification('success', 'Đã gỡ bỏ con dấu sáp, quay về con dấu mặc định!');
      if (onSealUpdated) onSealUpdated(null);
    } catch (err) {
      showNotification('error', (err as Error).message);
    } finally {
      setIsSavingSeal(false);
    }
  };

  return (
    <section className="bg-bg-surface p-4 sm:p-5 rounded-2xl border border-border shadow-sm space-y-6">
      {/* Thông báo trạng thái chung */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* KHỐI 1: Cài đặt Logo Sự Kiện */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-text">
                Cài đặt Logo Sự Kiện
              </h2>
              <p className="text-[11px] text-text-muted">
                Logo hiển thị trên thiệp mời của khách. Hỗ trợ định dạng PNG, JPG, WEBP, SVG.
              </p>
            </div>
          </div>

          {logoUrl && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              disabled={isSavingLogo || isUploadingLogo}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors self-start sm:self-auto disabled:opacity-50"
              title="Gỡ bỏ logo hiện tại"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Gỡ logo</span>
            </button>
          )}
        </div>

        {/* Nội dung tương tác Logo */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-border bg-bg p-2 flex items-center justify-center relative overflow-hidden shrink-0 shadow-inner">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-accent" />
              ) : logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="Logo sự kiện hiện tại"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-center text-text-muted p-1">
                  <ImageIcon className="w-6 h-6 mx-auto opacity-40 mb-1" />
                  <span className="text-[10px] block leading-tight">Chưa có logo</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-text block">
                {logoUrl ? 'Ảnh logo hiện hành' : 'Logo mặc định'}
              </span>
              <span className="text-[11px] text-text-muted block">
                {logoUrl ? (
                  <a
                    href={logoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline inline-flex items-center gap-1"
                  >
                    <span>Xem ảnh gốc</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  'Tải ảnh lên hoặc dán URL để áp dụng logo riêng'
                )}
              </span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <label
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-sm select-none ${
                  isUploadingLogo
                    ? 'bg-accent/10 border-accent/40 text-accent opacity-75 pointer-events-none'
                    : 'bg-accent text-primary-fg border-accent hover:opacity-95 active:scale-[0.98]'
                }`}
              >
                {isUploadingLogo ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tải lên Supabase Storage...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Chọn file logo từ máy</span>
                  </>
                )}
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
                  disabled={isUploadingLogo || isSavingLogo}
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>

              <span className="text-[11px] text-text-muted">
                (PNG, JPG, WEBP, SVG tối đa 10MB)
              </span>
            </div>

            <form onSubmit={handleSaveLogoUrl} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={logoUrlInput}
                  onChange={(e) => setLogoUrlInput(e.target.value)}
                  placeholder="Hoặc dán link URL ảnh logo..."
                  disabled={isSavingLogo || isUploadingLogo}
                  className="w-full pl-3.5 pr-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text placeholder:text-text-muted/60 font-mono disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingLogo || isUploadingLogo || logoUrlInput.trim() === (logoUrl || '')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-fg text-xs font-semibold hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-40 shadow-sm shrink-0"
              >
                {isSavingLogo ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu logo</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* KHỐI 2: Cài đặt Ảnh Nền Thiệp Mời */}
      <div className="space-y-4 pt-4 border-t border-border/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-text">
                Cài đặt Ảnh Nền Thiệp Mời
              </h2>
              <p className="text-[11px] text-text-muted">
                Ảnh nền phủ toàn trang thiệp kèm lớp mờ trắng-hồng dịu, làm nổi bật phong bì & lời mời.
              </p>
            </div>
          </div>

          {bgUrl && (
            <button
              type="button"
              onClick={handleRemoveBg}
              disabled={isSavingBg || isUploadingBg}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors self-start sm:self-auto disabled:opacity-50"
              title="Quay về nền mặc định"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa nền (quay về mặc định)</span>
            </button>
          )}
        </div>

        {/* Nội dung tương tác Background */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-border bg-bg p-1.5 flex items-center justify-center relative overflow-hidden shrink-0 shadow-inner">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-accent" />
              ) : bgUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bgUrl}
                  alt="Ảnh nền thiệp hiện tại"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-center text-text-muted p-1">
                  <ImageIcon className="w-6 h-6 mx-auto opacity-40 mb-1" />
                  <span className="text-[10px] block leading-tight">Nền mặc định</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-text block">
                {bgUrl ? 'Ảnh nền thiệp hiện hành' : 'Nền mặc định (Hồng & Trắng tinh khôi)'}
              </span>
              <span className="text-[11px] text-text-muted block">
                {bgUrl ? (
                  <a
                    href={bgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline inline-flex items-center gap-1"
                  >
                    <span>Xem ảnh gốc</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  'Tải ảnh lên hoặc dán URL để đặt nền riêng cho thiệp'
                )}
              </span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <label
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-sm select-none ${
                  isUploadingBg
                    ? 'bg-accent/10 border-accent/40 text-accent opacity-75 pointer-events-none'
                    : 'bg-accent text-primary-fg border-accent hover:opacity-95 active:scale-[0.98]'
                }`}
              >
                {isUploadingBg ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tải lên Supabase Storage...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Chọn file ảnh nền từ máy</span>
                  </>
                )}
                <input
                  ref={bgFileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  disabled={isUploadingBg || isSavingBg}
                  onChange={handleBgUpload}
                  className="hidden"
                />
              </label>

              <span className="text-[11px] text-text-muted">
                (Khuyến nghị ảnh tỷ lệ dọc hoặc ảnh phong cảnh chất lượng cao)
              </span>
            </div>

            <form onSubmit={handleSaveBgUrl} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={bgUrlInput}
                  onChange={(e) => setBgUrlInput(e.target.value)}
                  placeholder="Hoặc dán trực tiếp đường dẫn URL ảnh nền thiệp..."
                  disabled={isSavingBg || isUploadingBg}
                  className="w-full pl-3.5 pr-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text placeholder:text-text-muted/60 font-mono disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingBg || isUploadingBg || bgUrlInput.trim() === (bgUrl || '')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-fg text-xs font-semibold hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-40 shadow-sm shrink-0"
              >
                {isSavingBg ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu ảnh nền</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* KHỐI 3: Cài đặt Ảnh Con Dấu Sáp (Wax Seal) */}
      <div className="space-y-4 pt-4 border-t border-border/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-text">
                Cài đặt Ảnh Con Dấu Sáp (Wax Seal)
              </h2>
              <p className="text-[11px] text-text-muted">
                Con dấu niêm phong phong bì thiệp mời. Hỗ trợ định dạng PNG (nền trong suốt), JPG, WEBP, SVG.
              </p>
            </div>
          </div>

          {waxSealUrl && (
            <button
              type="button"
              onClick={handleRemoveSeal}
              disabled={isSavingSeal || isUploadingSeal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors self-start sm:self-auto disabled:opacity-50"
              title="Quay về con dấu mặc định"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Gỡ con dấu (quay về mặc định)</span>
            </button>
          )}
        </div>

        {/* Nội dung tương tác Wax Seal */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-border bg-bg p-2 flex items-center justify-center relative overflow-hidden shrink-0 shadow-inner">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-accent" />
              ) : waxSealUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={waxSealUrl}
                  alt="Con dấu sáp hiện tại"
                  className="w-full h-full object-contain drop-shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-center text-text-muted p-1">
                  <Award className="w-6 h-6 mx-auto opacity-40 mb-1" />
                  <span className="text-[10px] block leading-tight">Dấu mặc định</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-text block">
                {waxSealUrl ? 'Con dấu sáp hiện hành' : 'Con dấu mặc định (Hoa Ly)'}
              </span>
              <span className="text-[11px] text-text-muted block">
                {waxSealUrl ? (
                  <a
                    href={waxSealUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline inline-flex items-center gap-1"
                  >
                    <span>Xem ảnh gốc</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  'Tải ảnh lên hoặc dán URL để áp dụng con dấu sáp riêng'
                )}
              </span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <label
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-sm select-none ${
                  isUploadingSeal
                    ? 'bg-accent/10 border-accent/40 text-accent opacity-75 pointer-events-none'
                    : 'bg-accent text-primary-fg border-accent hover:opacity-95 active:scale-[0.98]'
                }`}
              >
                {isUploadingSeal ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tải lên Supabase Storage...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Chọn file con dấu từ máy</span>
                  </>
                )}
                <input
                  ref={sealFileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
                  disabled={isUploadingSeal || isSavingSeal}
                  onChange={handleSealUpload}
                  className="hidden"
                />
              </label>

              <span className="text-[11px] text-text-muted">
                (Khuyến nghị ảnh PNG nền trong suốt để đẹp nhất)
              </span>
            </div>

            <form onSubmit={handleSaveSealUrl} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={waxSealUrlInput}
                  onChange={(e) => setWaxSealUrlInput(e.target.value)}
                  placeholder="Hoặc dán trực tiếp đường dẫn URL ảnh con dấu sáp..."
                  disabled={isSavingSeal || isUploadingSeal}
                  className="w-full pl-3.5 pr-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text placeholder:text-text-muted/60 font-mono disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingSeal || isUploadingSeal || waxSealUrlInput.trim() === (waxSealUrl || '')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-fg text-xs font-semibold hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-40 shadow-sm shrink-0"
              >
                {isSavingSeal ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu con dấu</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
