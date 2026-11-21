'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Music,
  Shirt,
  Volume2,
  Eye,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Palette,
  FileText,
  Image as ImageIcon,
  Sliders,
  Upload,
} from 'lucide-react';
import type { EventConfig, ThemeName, DresscodeColor, TimelineItem, GalleryPhoto } from '@/config/event';

interface EventSettingsTabProps {
  onSaved?: () => void;
}

export function EventSettingsTab({ onSaved }: EventSettingsTabProps) {
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Trạng thái upload ảnh lên Supabase
  const [isUploadingOg, setIsUploadingOg] = useState(false);
  const [uploadingGalleryIndex, setUploadingGalleryIndex] = useState<number | null>(null);
  const [isUploadingNewPhotos, setIsUploadingNewPhotos] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    let mounted = true;
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.config) {
            setConfig(data.config);
          }
        }
      } catch {
        // Fallback
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể lưu cấu hình');
      }

      setConfig(data.config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      if (onSaved) onSaved();
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Bạn có chắc muốn đặt lại toàn bộ cài đặt về bản gốc mặc định? Thao tác này sẽ ghi đè các tùy chỉnh hiện tại.')) {
      return;
    }

    setIsResetting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/settings', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.config) {
        setConfig(data.config);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      setErrorMessage('Không thể đặt lại cấu hình.');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading || !config) {
    return (
      <div className="bg-bg-surface border border-border rounded-2xl p-12 text-center space-y-3">
        <Loader2 className="w-7 h-7 animate-spin text-accent mx-auto" />
        <p className="text-xs text-text-muted">Đang tải cài đặt sự kiện...</p>
      </div>
    );
  }

  // Helpers for array modifications
  const updateParagraph = (index: number, text: string) => {
    const list = [...config.generalInvitationText];
    list[index] = text;
    setConfig({ ...config, generalInvitationText: list });
  };

  const addParagraph = () => {
    setConfig({
      ...config,
      generalInvitationText: [...config.generalInvitationText, 'Đoạn văn lời ngỏ mới...'],
    });
  };

  const removeParagraph = (index: number) => {
    if (config.generalInvitationText.length <= 1) return;
    const list = config.generalInvitationText.filter((_, i) => i !== index);
    setConfig({ ...config, generalInvitationText: list });
  };

  const updateTimelineItem = (index: number, key: keyof TimelineItem, val: string) => {
    const list = [...config.timeline];
    list[index] = { ...list[index], [key]: val };
    setConfig({ ...config, timeline: list });
  };

  const addTimelineItem = () => {
    setConfig({
      ...config,
      timeline: [
        ...config.timeline,
        { time: '20:30', title: 'Tiết mục mới', description: 'Mô tả chi tiết tiết mục' },
      ],
    });
  };

  const removeTimelineItem = (index: number) => {
    if (config.timeline.length <= 1) return;
    const list = config.timeline.filter((_, i) => i !== index);
    setConfig({ ...config, timeline: list });
  };

  const updateDressColor = (index: number, key: keyof DresscodeColor, val: string) => {
    const list = [...config.dresscodeColors];
    list[index] = { ...list[index], [key]: val };
    setConfig({ ...config, dresscodeColors: list });
  };

  const addDressColor = () => {
    setConfig({
      ...config,
      dresscodeColors: [...config.dresscodeColors, { name: 'Màu mới', hex: '#D4AF37' }],
    });
  };

  const removeDressColor = (index: number) => {
    if (config.dresscodeColors.length <= 1) return;
    const list = config.dresscodeColors.filter((_, i) => i !== index);
    setConfig({ ...config, dresscodeColors: list });
  };

  const updateGalleryPhoto = (index: number, key: keyof GalleryPhoto, val: string) => {
    const list = [...(config.gallery || [])];
    list[index] = { ...list[index], [key]: val };
    setConfig({ ...config, gallery: list });
  };

  const addGalleryPhoto = () => {
    setConfig({
      ...config,
      gallery: [
        ...(config.gallery || []),
        {
          src: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
          alt: 'Khoảnh khắc mới',
          caption: 'Kỷ niệm khó phai',
        },
      ],
    });
  };

  // Hàm xóa tệp đã tải lên khỏi Supabase Storage
  const deleteUploadedFile = async (url: string | null | undefined) => {
    if (!url) return;
    try {
      await fetch('/api/admin/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
    } catch {
      // Bỏ qua lỗi mạng, cơ chế đối soát server-side khi bấm Lưu sẽ dọn dẹp tiếp
    }
  };

  const removeGalleryPhoto = (index: number) => {
    const photoToRemove = config.gallery?.[index];
    const list = (config.gallery || []).filter((_, i) => i !== index);
    setConfig({ ...config, gallery: list });
    if (photoToRemove?.src) {
      deleteUploadedFile(photoToRemove.src);
    }
  };

  // Hàm gọi API upload tệp ảnh/nhạc lên Supabase Storage
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Lỗi khi tải tệp lên');
    }
    return data.url;
  };

  // Upload ảnh bìa OG Image (tự động xóa ảnh bìa cũ trên Supabase)
  const handleUploadOgImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const oldOgSrc = config.ogImage;
    setIsUploadingOg(true);
    setErrorMessage(null);
    try {
      const url = await uploadFile(file);
      setConfig({ ...config, ogImage: url });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (oldOgSrc && oldOgSrc !== url) {
        deleteUploadedFile(oldOgSrc);
      }
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsUploadingOg(false);
      e.target.value = '';
    }
  };

  // Upload nhiều ảnh cùng lúc vào thư viện Gallery
  const handleUploadMultipleGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingNewPhotos(true);
    setErrorMessage(null);
    try {
      const newPhotos: GalleryPhoto[] = [];
      for (const file of files) {
        const url = await uploadFile(file);
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        newPhotos.push({
          src: url,
          alt: cleanName || 'Khoảnh khắc mới',
          caption: cleanName || 'Khoảnh khắc đáng nhớ',
        });
      }
      setConfig({
        ...config,
        gallery: [...(config.gallery || []), ...newPhotos],
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsUploadingNewPhotos(false);
      e.target.value = '';
    }
  };

  // Upload ảnh thay thế cho một ảnh cụ thể trong Gallery (tự động xóa ảnh cũ trên Supabase)
  const handleReplacePhoto = async (index: number, file: File) => {
    const oldPhotoSrc = config.gallery?.[index]?.src;
    setUploadingGalleryIndex(index);
    setErrorMessage(null);
    try {
      const url = await uploadFile(file);
      updateGalleryPhoto(index, 'src', url);
      if (oldPhotoSrc && oldPhotoSrc !== url) {
        deleteUploadedFile(oldPhotoSrc);
      }
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setUploadingGalleryIndex(null);
    }
  };

  // Upload tệp nhạc nền MP3 lên Supabase Storage (tự động xóa nhạc nền cũ trên Supabase)
  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const oldAudioSrc = config.audio?.src;
    setIsUploadingAudio(true);
    setErrorMessage(null);
    try {
      const url = await uploadFile(file);
      setConfig({
        ...config,
        audio: { ...config.audio, src: url },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (oldAudioSrc && oldAudioSrc !== url) {
        deleteUploadedFile(oldAudioSrc);
      }
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsUploadingAudio(false);
      e.target.value = '';
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Thanh tác vụ đầu form */}
      <div className="bg-bg-surface p-4 sm:p-5 rounded-2xl border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="font-serif text-lg font-bold text-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <span>Tùy Chỉnh Nội Dung & Câu Từ Sự Kiện</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Mọi thay đổi sẽ lập tức hiển thị trên thiệp mời của tất cả khách mời
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting || isSaving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-bg hover:bg-rose-50 text-text-muted hover:text-rose-600 text-xs font-medium transition-all"
            title="Khôi phục nội dung gốc ban đầu"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Đặt lại mặc định</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-fg text-xs font-semibold shadow-md hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu tất cả thay đổi</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Đã lưu thành công! Toàn bộ nội dung thiệp mời đã được cập nhật mới.</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Nhận diện & Chủ đề giao diện */}
      <div className="bg-bg-surface p-5 sm:p-6 rounded-2xl border border-border space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/70 pb-3">
          <Palette className="w-4 h-4 text-accent" />
          <h3 className="font-serif text-base font-semibold text-text">
            1. Chủ Đề Giao Diện & Tiêu Đề
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {[
            {
              id: 'candlelight' as ThemeName,
              name: 'Ánh Nến Lãng Mạn (Candlelight)',
              desc: 'Tông đỏ rượu Bordeaux, phong bì nhung đỏ, sáp vàng kim ấm áp',
              bgClass: 'bg-[#FAF6F0] border-[#7A1835]',
            },
            {
              id: 'vintage' as ThemeName,
              name: 'Cổ Điển Thơ Mộng (Vintage)',
              desc: 'Tông hoa hồng gai, phong cách polaroid hoài niệm',
              bgClass: 'bg-[#FDFBF7] border-[#B56576]',
            },
            {
              id: 'starlight' as ThemeName,
              name: 'Đêm Sao Huyền Ảo (Starlight)',
              desc: 'Tông xanh đêm sao huyền bí, phong bì bóng đêm dát vàng',
              bgClass: 'bg-[#0F172A] border-[#E2C275]',
            },
          ].map((themeOpt) => {
            const isSelected = config.theme === themeOpt.id;
            return (
              <div
                key={themeOpt.id}
                onClick={() => setConfig({ ...config, theme: themeOpt.id })}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                    ? 'border-accent bg-accent/5 ring-2 ring-accent/30'
                    : 'border-border hover:border-accent/40 bg-bg/50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">{themeOpt.name}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-accent" />}
                </div>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  {themeOpt.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Tên sự kiện / Tiêu đề đêm nhạc *
            </label>
            <input
              type="text"
              required
              value={config.eventName}
              onChange={(e) => setConfig({ ...config, eventName: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Slogan / Câu đề từ chủ đề *
            </label>
            <input
              type="text"
              required
              value={config.slogan}
              onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Tên người chủ trì / Ban tổ chức (Host) *
            </label>
            <input
              type="text"
              required
              value={config.hostName}
              onChange={(e) => setConfig({ ...config, hostName: e.target.value })}
              placeholder="Ví dụ: Minh Trí & Phương Anh"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Thời gian đếm ngược (ISO 8601)
            </label>
            <input
              type="text"
              value={config.eventDateIso || ''}
              onChange={(e) => setConfig({ ...config, eventDateIso: e.target.value })}
              placeholder="Ví dụ: 2026-02-14T19:30:00+07:00"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Nhãn / Lời mở đầu thư mời
            </label>
            <input
              type="text"
              value={config.invitationBadge || ''}
              onChange={(e) => setConfig({ ...config, invitationBadge: e.target.value })}
              placeholder="Ví dụ: Thư Mời Tham Dự, Thiệp Mời, Save The Date"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Dòng đề tặng khách mời (Badge đầu thư)
            </label>
            <input
              type="text"
              value={config.dedicationBadge || ''}
              onChange={(e) => setConfig({ ...config, dedicationBadge: e.target.value })}
              placeholder="Ví dụ: Dành tặng người bạn quý, Kính gửi Quý khách,..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-medium text-text">
                Ảnh bìa chia sẻ mạng xã hội (OG Image Preview) *
              </label>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-accent/30 bg-accent/10 hover:bg-accent/20 text-xs font-semibold text-accent cursor-pointer transition-all self-start sm:self-auto active:scale-[0.98]">
                {isUploadingOg ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-accent" />
                )}
                <span>{isUploadingOg ? 'Đang tải lên Supabase...' : 'Tải ảnh bìa từ máy lên Supabase'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingOg}
                  onChange={handleUploadOgImage}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="w-24 h-14 rounded-lg overflow-hidden border border-border bg-bg shrink-0 relative flex items-center justify-center shadow-2xs">
                {config.ogImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={config.ogImage}
                    alt="Ảnh bìa xem trước"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <ImageIcon className="w-5 h-5 text-text-muted" />
                )}
              </div>
              <div className="flex-1 w-full space-y-1">
                <input
                  type="text"
                  required
                  value={config.ogImage || ''}
                  onChange={(e) => setConfig({ ...config, ogImage: e.target.value })}
                  placeholder="Ví dụ: /images/cover.jpg hoặc URL ảnh Supabase..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text font-mono"
                />
                <p className="text-[11px] text-text-muted">
                  Ảnh hiển thị xem trước (thumbnail) khi gửi link qua Zalo, Facebook, Messenger, iMessage. Khuyến nghị tỷ lệ 1200x630px.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Thời gian & Địa điểm */}
      <div className="bg-bg-surface p-5 sm:p-6 rounded-2xl border border-border space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/70 pb-3">
          <Calendar className="w-4 h-4 text-accent" />
          <h3 className="font-serif text-base font-semibold text-text">
            2. Thời Gian & Địa Điểm Tổ Chức
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Dòng hiển thị ngày tháng *
            </label>
            <input
              type="text"
              required
              value={config.eventDateLabel}
              onChange={(e) => setConfig({ ...config, eventDateLabel: e.target.value })}
              placeholder="Thứ Bảy, ngày 14 tháng 02 năm 2026"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Giờ đón khách (Check-in) *
            </label>
            <input
              type="text"
              required
              value={config.checkinTime}
              onChange={(e) => setConfig({ ...config, checkinTime: e.target.value })}
              placeholder="19:00"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Giờ bắt đầu chính thức *
            </label>
            <input
              type="text"
              required
              value={config.startTime}
              onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
              placeholder="19:30"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Tên địa điểm (Lounge / Khán phòng) *
            </label>
            <input
              type="text"
              required
              value={config.venueName}
              onChange={(e) => setConfig({ ...config, venueName: e.target.value })}
              placeholder="The Muse Acoustic Lounge"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-medium text-text">
              Địa chỉ chi tiết *
            </label>
            <input
              type="text"
              required
              value={config.venueAddress}
              onChange={(e) => setConfig({ ...config, venueAddress: e.target.value })}
              placeholder="Tầng 3, 128 Phan Kế Bính, Ba Đình, Hà Nội"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-3">
            <label className="block text-xs font-medium text-text">
              Đường dẫn Google Maps *
            </label>
            <input
              type="text"
              required
              value={config.googleMapsUrl}
              onChange={(e) => setConfig({ ...config, googleMapsUrl: e.target.value })}
              placeholder="https://maps.google.com/?q=..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. Lời ngỏ & Câu từ thiệp mời */}
      <div className="bg-bg-surface p-5 sm:p-6 rounded-2xl border border-border space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/70 pb-3">
          <FileText className="w-4 h-4 text-accent" />
          <h3 className="font-serif text-base font-semibold text-text">
            3. Câu Từ Thiệp Mời & Lời Ngỏ Chân Thành
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Lời đề trên phong bì
            </label>
            <input
              type="text"
              value={config.envelopeGreeting}
              onChange={(e) => setConfig({ ...config, envelopeGreeting: e.target.value })}
              placeholder="Trân trọng kính mời"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Lời nhắc mở dấu sáp
            </label>
            <input
              type="text"
              value={config.sealHintText}
              onChange={(e) => setConfig({ ...config, sealHintText: e.target.value })}
              placeholder="Chạm vào dấu sáp để mở thiệp"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Lời chào đầu thư
            </label>
            <input
              type="text"
              value={config.letterSalutation}
              onChange={(e) => setConfig({ ...config, letterSalutation: e.target.value })}
              placeholder="Thân gửi"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>
        </div>

        {/* Danh sách các đoạn văn lời ngỏ chung */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-text">
              Các đoạn văn lời ngỏ chung ({config.generalInvitationText.length} đoạn)
            </label>
            <button
              type="button"
              onClick={addParagraph}
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm đoạn văn</span>
            </button>
          </div>

          {config.generalInvitationText.map((paragraph, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <span className="text-xs font-mono text-text-muted pt-2.5 select-none">
                #{idx + 1}
              </span>
              <textarea
                rows={2}
                value={paragraph}
                onChange={(e) => updateParagraph(idx, e.target.value)}
                className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text resize-none"
              />
              {config.generalInvitationText.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeParagraph(idx)}
                  className="p-2 text-text-muted hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Xóa đoạn văn này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Tiêu đề khối RSVP
            </label>
            <input
              type="text"
              value={config.rsvpHeading}
              onChange={(e) => setConfig({ ...config, rsvpHeading: e.target.value })}
              placeholder="Xác Nhận Tham Dự"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Phụ đề khối RSVP
            </label>
            <input
              type="text"
              value={config.rsvpSubheading || ''}
              onChange={(e) => setConfig({ ...config, rsvpSubheading: e.target.value })}
              placeholder="Sự hiện diện của bạn là niềm vinh hạnh lớn của chúng mình"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-medium text-text">
              Lời tri ân chân trang
            </label>
            <input
              type="text"
              value={config.footerThankYou}
              onChange={(e) => setConfig({ ...config, footerThankYou: e.target.value })}
              placeholder="Rất mong được gặp bạn trong đêm nhạc ấm áp này"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>
        </div>
      </div>

      {/* 4. Lịch trình chương trình (Timeline) */}
      <div className="bg-bg-surface p-5 sm:p-6 rounded-2xl border border-border space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <h3 className="font-serif text-base font-semibold text-text">
              4. Lịch Trình Đêm Nhạc (Timeline)
            </h3>
          </div>
          <button
            type="button"
            onClick={addTimelineItem}
            className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm mốc lịch trình</span>
          </button>
        </div>

        <div className="space-y-3 pt-1">
          {config.timeline.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-border bg-bg/60 flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <div className="w-24 shrink-0 space-y-1">
                <label className="text-[10px] text-text-muted uppercase font-bold block">
                  Thời gian
                </label>
                <input
                  type="text"
                  value={item.time}
                  onChange={(e) => updateTimelineItem(idx, 'time', e.target.value)}
                  placeholder="19:00"
                  className="w-full px-2.5 py-1.5 text-xs font-bold text-accent rounded-lg bg-bg-surface border border-border focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex-1 space-y-1 w-full">
                <label className="text-[10px] text-text-muted uppercase font-bold block">
                  Tiêu đề mốc
                </label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateTimelineItem(idx, 'title', e.target.value)}
                  placeholder="Đón khách & Check-in"
                  className="w-full px-2.5 py-1.5 text-xs font-semibold text-text rounded-lg bg-bg-surface border border-border focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex-[1.5] space-y-1 w-full">
                <label className="text-[10px] text-text-muted uppercase font-bold block">
                  Mô tả chi tiết
                </label>
                <input
                  type="text"
                  value={item.description || ''}
                  onChange={(e) => updateTimelineItem(idx, 'description', e.target.value)}
                  placeholder="Thưởng thức đồ uống nhẹ..."
                  className="w-full px-2.5 py-1.5 text-xs text-text-muted rounded-lg bg-bg-surface border border-border focus:ring-1 focus:ring-accent"
                />
              </div>

              {config.timeline.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTimelineItem(idx)}
                  className="p-1.5 text-text-muted hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors self-end sm:self-center mt-2 sm:mt-0"
                  title="Xóa mốc này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Dress code & Bảng màu */}
      <div className="bg-bg-surface p-5 sm:p-6 rounded-2xl border border-border space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <div className="flex items-center gap-2">
            <Shirt className="w-4 h-4 text-accent" />
            <h3 className="font-serif text-base font-semibold text-text">
              5. Trang Phục (Dress Code) & Bảng Màu Gợi Ý
            </h3>
          </div>
          <button
            type="button"
            onClick={addDressColor}
            className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm màu sắc</span>
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text">
            Mô tả quy định trang phục
          </label>
          <input
            type="text"
            value={config.dresscodeDescription}
            onChange={(e) => setConfig({ ...config, dresscodeDescription: e.target.value })}
            placeholder="Trang phục lịch thiệp, thanh nhã (khuyến khích theo bảng màu bên dưới)"
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
          />
        </div>

        {/* Danh sách màu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {config.dresscodeColors.map((color, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-border bg-bg/60 flex items-center gap-3"
            >
              <input
                type="color"
                value={color.hex}
                onChange={(e) => updateDressColor(idx, 'hex', e.target.value)}
                className="w-8 h-8 rounded-lg border border-black/20 cursor-pointer shrink-0 p-0 bg-transparent"
              />

              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={color.name}
                  onChange={(e) => updateDressColor(idx, 'name', e.target.value)}
                  placeholder="Tên màu (Ví dụ: Đỏ rượu)"
                  className="w-full px-2.5 py-1 text-xs font-medium text-text rounded-lg bg-bg-surface border border-border"
                />
              </div>

              <div className="w-20">
                <input
                  type="text"
                  value={color.hex}
                  onChange={(e) => updateDressColor(idx, 'hex', e.target.value)}
                  placeholder="#7A1835"
                  className="w-full px-2 py-1 text-[11px] font-mono text-text-muted rounded-lg bg-bg-surface border border-border text-center"
                />
              </div>

              {config.dresscodeColors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDressColor(idx)}
                  className="p-1.5 text-text-muted hover:text-rose-500 rounded-lg hover:bg-rose-50"
                  title="Xóa màu"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6. Âm nhạc & Kênh liên hệ */}
      <div className="bg-bg-surface p-5 sm:p-6 rounded-2xl border border-border space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/70 pb-3">
          <Volume2 className="w-4 h-4 text-accent" />
          <h3 className="font-serif text-base font-semibold text-text">
            6. Âm Nhạc Nền & Thông Tin Liên Hệ
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-medium text-text">
                Đường dẫn tệp nhạc nền MP3 *
              </label>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-accent/30 bg-accent/10 hover:bg-accent/20 text-xs font-semibold text-accent cursor-pointer transition-all self-start sm:self-auto active:scale-[0.98]">
                {isUploadingAudio ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-accent" />
                )}
                <span>{isUploadingAudio ? 'Đang tải MP3 lên Supabase...' : 'Tải file MP3 lên Supabase'}</span>
                <input
                  type="file"
                  accept="audio/mp3,audio/*,.mp3,.wav,.ogg,.m4a"
                  disabled={isUploadingAudio}
                  onChange={handleUploadAudio}
                  className="hidden"
                />
              </label>
            </div>

            <input
              type="text"
              required
              value={config.audio.src}
              onChange={(e) =>
                setConfig({
                  ...config,
                  audio: { ...config.audio, src: e.target.value },
                })
              }
              placeholder="/music/bg-love.mp3 hoặc URL âm thanh Supabase..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text font-mono"
            />

            {/* Khung nghe thử nhạc trực tiếp */}
            {config.audio.src && (
              <div className="p-3 bg-bg/70 rounded-xl border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-[11px] text-text-muted flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-accent" />
                  <span>Nghe thử nhạc nền:</span>
                </span>
                <audio
                  controls
                  key={config.audio.src}
                  src={config.audio.src}
                  className="w-full sm:w-72 h-8 max-h-8 rounded"
                  preload="none"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Âm lượng khởi động ({Math.round((config.audio.defaultVolume || 0.4) * 100)}%)
            </label>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={config.audio.defaultVolume || 0.4}
              onChange={(e) =>
                setConfig({
                  ...config,
                  audio: { ...config.audio, defaultVolume: parseFloat(e.target.value) },
                })
              }
              className="w-full mt-2 accent-accent cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Nhãn kênh liên hệ BTC *
            </label>
            <input
              type="text"
              required
              value={config.contactLabel}
              onChange={(e) => setConfig({ ...config, contactLabel: e.target.value })}
              placeholder="Ban Tổ Chức (Hotline / Zalo)"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text">
              Đường dẫn liên hệ Zalo / Hotline *
            </label>
            <input
              type="text"
              required
              value={config.contactUrl}
              onChange={(e) => setConfig({ ...config, contactUrl: e.target.value })}
              placeholder="https://zalo.me/0987654321 hoặc tel:0987654321"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text font-mono"
            />
          </div>
        </div>
      </div>

      {/* 7. Tùy Chọn Hiển Thị & Ảnh Đơn Vị Đồng Hành / Nhà Tài Trợ */}
      <div className="bg-bg-surface p-5 sm:p-6 rounded-2xl border border-border space-y-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/70 pb-3">
          <Sliders className="w-4 h-4 text-accent" />
          <h3 className="font-serif text-base font-semibold text-text">
            7. Bật/Tắt Tính Năng & Ảnh Đơn Vị Đồng Hành / Nhà Tài Trợ
          </h3>
        </div>

        {/* Bật / Tắt module */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-text uppercase tracking-wider">
            Cấu hình hiển thị module
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Countdown toggle */}
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-bg/60 cursor-pointer hover:border-accent/40 transition-colors">
              <input
                type="checkbox"
                checked={config.showCountdown !== false}
                onChange={(e) => setConfig({ ...config, showCountdown: e.target.checked })}
                className="w-4 h-4 accent-accent rounded cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold block text-text">Đồng hồ đếm ngược</span>
                <span className="text-[11px] text-text-muted">Hiện bộ đếm thời gian tới giờ diễn</span>
              </div>
            </label>

            {/* Gallery toggle */}
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-bg/60 cursor-pointer hover:border-accent/40 transition-colors">
              <input
                type="checkbox"
                checked={config.showGallery !== false}
                onChange={(e) => setConfig({ ...config, showGallery: e.target.checked })}
                className="w-4 h-4 accent-accent rounded cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold block text-text">Khối đơn vị đồng hành</span>
                <span className="text-[11px] text-text-muted">Hiện logo nhà tài trợ / đơn vị đồng hành trên thiệp mời</span>
              </div>
            </label>

            {/* Song request toggle */}
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-bg/60 cursor-pointer hover:border-accent/40 transition-colors">
              <input
                type="checkbox"
                checked={config.showSongRequest !== false}
                onChange={(e) => setConfig({ ...config, showSongRequest: e.target.checked })}
                className="w-4 h-4 accent-accent rounded cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold block text-text">Yêu cầu bài hát</span>
                <span className="text-[11px] text-text-muted">Cho phép khách đề xuất ca khúc ở RSVP</span>
              </div>
            </label>
          </div>
        </div>

        {/* Quản lý danh sách ảnh gallery */}
        <div className="space-y-4 pt-2 border-t border-border/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-accent" />
              <label className="text-xs font-semibold text-text">
                Ảnh Đơn Vị Đồng Hành / Nhà Tài Trợ ({(config.gallery || []).length} logo)
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-fg text-xs font-semibold cursor-pointer shadow-sm hover:opacity-95 transition-all active:scale-[0.98]">
                {isUploadingNewPhotos ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{isUploadingNewPhotos ? 'Đang tải lên Supabase...' : 'Tải logo từ máy lên Supabase'}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isUploadingNewPhotos}
                  onChange={handleUploadMultipleGallery}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={addGalleryPhoto}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-bg-surface hover:border-accent text-xs text-text font-medium cursor-pointer transition-all active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5 text-accent" />
                <span>Thêm qua link URL</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-text-muted">
            Tải logo nhà tài trợ trực tiếp từ máy tính lên Supabase Storage hoặc nhập đường dẫn ảnh có sẵn. Ảnh sau khi tải lên sẽ có link public vĩnh viễn trên Supabase.
          </p>

          <div className="space-y-3">
            {(config.gallery || []).map((photo, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-border bg-bg/60 flex flex-col sm:flex-row items-start gap-3.5"
              >
                {/* Thumbnail preview & nút thay thế */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-border bg-bg relative flex items-center justify-center shadow-2xs">
                    {photo.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.src}
                        alt={photo.alt || 'Ảnh xem trước'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-text-muted" />
                    )}
                  </div>

                  <label className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent hover:underline cursor-pointer">
                    {uploadingGalleryIndex === idx ? (
                      <Loader2 className="w-3 h-3 animate-spin text-accent" />
                    ) : (
                      <Upload className="w-3 h-3 text-accent" />
                    )}
                    <span>{uploadingGalleryIndex === idx ? 'Đang tải...' : 'Tải ảnh thay'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingGalleryIndex === idx}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleReplacePhoto(idx, file);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-text-muted uppercase font-bold block">
                        Đường dẫn ảnh (URL) *
                      </label>
                      <input
                        type="text"
                        required
                        value={photo.src}
                        onChange={(e) => updateGalleryPhoto(idx, 'src', e.target.value)}
                        placeholder="https://... hoặc /images/..."
                        className="w-full px-2.5 py-1.5 text-xs text-text rounded-lg bg-bg-surface border border-border focus:ring-1 focus:ring-accent font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-text-muted uppercase font-bold block">
                        Tên đơn vị / Alt text *
                      </label>
                      <input
                        type="text"
                        required
                        value={photo.alt}
                        onChange={(e) => updateGalleryPhoto(idx, 'alt', e.target.value)}
                        placeholder="Tên đơn vị đồng hành / nhà tài trợ"
                        className="w-full px-2.5 py-1.5 text-xs text-text rounded-lg bg-bg-surface border border-border focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase font-bold block">
                      Chú thích hiển thị / Hạng mục tài trợ (Caption)
                    </label>
                    <input
                      type="text"
                      value={photo.caption || ''}
                      onChange={(e) => updateGalleryPhoto(idx, 'caption', e.target.value)}
                      placeholder="Nhà tài trợ Kim Cương / Đồng hành..."
                      className="w-full px-2.5 py-1.5 text-xs text-text-muted rounded-lg bg-bg-surface border border-border focus:ring-1 focus:ring-accent italic font-serif"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeGalleryPhoto(idx)}
                  className="p-1.5 text-text-muted hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors self-end sm:self-center mt-1 sm:mt-0"
                  title="Xóa logo này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {(config.gallery || []).length === 0 && (
              <p className="text-xs text-text-muted italic text-center py-4 bg-bg/40 rounded-xl border border-dashed border-border">
                Chưa có logo nào. Bấm &quot;Tải logo từ máy lên Supabase&quot; hoặc &quot;Thêm qua link URL&quot; để bổ sung đơn vị đồng hành.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Nút lưu cuối trang */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-6">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-fg text-sm font-semibold shadow-lg hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang lưu cấu hình...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Lưu toàn bộ thay đổi</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
