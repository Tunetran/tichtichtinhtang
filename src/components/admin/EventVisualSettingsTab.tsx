'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Save,
  Upload,
  Loader2,
  CheckCircle2,
  Sparkles,
  Music,
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  Handshake,
  Plus,
  Trash2,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Phone,
} from 'lucide-react';
import type { EventConfig, SponsorItem } from '@/config/event';
import { EVENT_CONFIG } from '@/config/event';
import type { OrganizerContact } from '@/lib/site-settings';

interface EventVisualSettingsTabProps {
  onSaved?: () => void;
  showToast: (msg: string) => void;
}

export function EventVisualSettingsTab({ onSaved, showToast }: EventVisualSettingsTabProps) {
  const [config, setConfig] = useState<EventConfig>(EVENT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Site settings: logo, bg, seal
  const [logoUrl, setLogoUrl] = useState<string>('/images/logo-tichtichtinhtang.png');
  const [bgUrl, setBgUrl] = useState<string>('/images/bg-bamboo-lotus.png');
  const [waxSealUrl, setWaxSealUrl] = useState<string>('/images/wax-seal-combined.png');
  const [organizerContact, setOrganizerContact] = useState<OrganizerContact>({
    name: '',
    phone: '',
    email: '',
    social_url: '',
    note: '',
  });

  // Invitation text state
  const [invitationText, setInvitationText] = useState<string>('');

  // File upload loaders
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Audio preview state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // File input refs
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const bgInputRef = useRef<HTMLInputElement | null>(null);
  const sealInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const partnerInputRef = useRef<HTMLInputElement | null>(null);

  // New partner state
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerCategory, setNewPartnerCategory] = useState<'sponsor' | 'companion'>('sponsor');
  const [newPartnerUrl, setNewPartnerUrl] = useState('');

  // 1. Tải cài đặt ban đầu từ API
  useEffect(() => {
    let mounted = true;
    async function fetchSettings() {
      try {
        const [configRes, siteRes] = await Promise.all([
          fetch('/api/admin/settings', { cache: 'no-store' }),
          fetch('/api/settings', { cache: 'no-store' }),
        ]);

        if (configRes.ok) {
          const cData = await configRes.json();
          if (mounted && cData.config) {
            setConfig(cData.config);
            if (cData.config.generalInvitationText) {
              const text = Array.isArray(cData.config.generalInvitationText)
                ? cData.config.generalInvitationText.join('\n\n')
                : String(cData.config.generalInvitationText);
              setInvitationText(text);
            } else if (Array.isArray(EVENT_CONFIG.generalInvitationText)) {
              setInvitationText(EVENT_CONFIG.generalInvitationText.join('\n\n'));
            }
          }
        }

        if (siteRes.ok) {
          const sData = await siteRes.json();
          if (mounted) {
            if (sData.event_logo_url) setLogoUrl(sData.event_logo_url);
            if (sData.event_bg_url) setBgUrl(sData.event_bg_url);
            if (sData.wax_seal_url) setWaxSealUrl(sData.wax_seal_url);
            if (sData.organizer_contact) {
              setOrganizerContact({
                name: sData.organizer_contact.name || '',
                phone: sData.organizer_contact.phone || '',
                email: sData.organizer_contact.email || '',
                social_url: sData.organizer_contact.social_url || '',
                note: sData.organizer_contact.note || '',
              });
            }
          }
        }
      } catch {
        // Fallback to defaults
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchSettings();
    return () => {
      mounted = false;
    };
  }, []);

  // Upload helper
  const handleFileUpload = async (
    file: File,
    field: 'logo' | 'bg' | 'seal' | 'audio' | 'partner'
  ) => {
    setUploadingField(field);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi tải tệp lên');
      }

      if (field === 'logo') setLogoUrl(data.url);
      else if (field === 'bg') setBgUrl(data.url);
      else if (field === 'seal') setWaxSealUrl(data.url);
      else if (field === 'audio') {
        setConfig((prev) => ({
          ...prev,
          audio: { ...prev.audio, src: data.url },
        }));
      } else if (field === 'partner') {
        setNewPartnerUrl(data.url);
      }

      showToast('Đã tải tệp lên thành công!');
    } catch (err) {
      showToast((err as Error).message);
    } finally {
      setUploadingField(null);
    }
  };

  // Toggle audio preview
  const handleToggleAudioPreview = () => {
    const audio = audioPreviewRef.current;
    if (!audio) return;
    if (isPlayingAudio) {
      audio.pause();
      setIsPlayingAudio(false);
    } else {
      audio.play().then(() => setIsPlayingAudio(true)).catch(() => {});
    }
  };

  // Thêm đối tác
  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerUrl.trim()) {
      showToast('Vui lòng chọn ảnh logo hoặc dán link');
      return;
    }

    const newItem: SponsorItem = {
      id: `sp-${Date.now()}`,
      name: newPartnerName.trim(),
      logoUrl: newPartnerUrl.trim(),
      category: newPartnerCategory,
    };

    setConfig((prev) => ({
      ...prev,
      sponsors: [...(prev.sponsors || []), newItem],
    }));

    setNewPartnerName('');
    setNewPartnerUrl('');
    showToast('Đã thêm đối tác vào danh sách!');
  };

  // Xóa đối tác
  const handleDeletePartner = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      sponsors: (prev.sponsors || []).filter((s) => s.id !== id),
    }));
    showToast('Đã xóa đối tác khỏi danh sách!');
  };

  // 2. Lưu chung toàn bộ cài đặt
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const [configSave, siteSave] = await Promise.all([
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_logo_url: logoUrl,
            event_bg_url: bgUrl,
            wax_seal_url: waxSealUrl,
            organizer_contact: organizerContact,
          }),
        }),
      ]);

      if (!configSave.ok) {
        const cErr = await configSave.json();
        throw new Error(cErr.error || 'Lỗi khi lưu cấu hình');
      }

      showToast('Đã lưu toàn bộ cài đặt thiệp thành công!');
      if (onSaved) onSaved();
    } catch (err) {
      showToast((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-bg-surface border border-border rounded-2xl p-12 text-center space-y-3 font-sans-ui">
        <Loader2 className="w-8 h-8 animate-spin text-[#006C3A] mx-auto" />
        <p className="text-xs text-text-muted">Đang tải cài đặt thiệp...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans-ui pb-10">
      {/* Audio element ẩn để nghe thử */}
      <audio
        ref={audioPreviewRef}
        src={config.audio?.src || '/music/bg-love.mp3'}
        onEnded={() => setIsPlayingAudio(false)}
      />

      {/* Thanh công cụ lưu ở đầu trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-surface p-4 sm:p-5 rounded-2xl border border-border shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#006C3A]" />
            <span>Cài Đặt Thiệp & Hình Ảnh</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Tùy chỉnh nhận diện, âm nhạc, lịch trình và đối tác đang hiển thị trên thiệp mời.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSaveAll()}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-fg text-xs font-semibold hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm cursor-pointer shrink-0"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Lưu Cài Đặt</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* ========================================================
            THẺ 1: NHẬN DIỆN & HÌNH ẢNH THIỆP
           ======================================================== */}
        <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/70 pb-3">
            <ImageIcon className="w-4 h-4 text-[#006C3A]" />
            <h3 className="font-semibold text-sm text-text">1. Hình Ảnh & Nhận Diện</h3>
          </div>

          {/* 1.1 Logo Đêm Nhạc */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text block">Logo Đêm Nhạc</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border border-border bg-bg flex items-center justify-center p-1 overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="URL logo sự kiện..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text font-mono"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingField === 'logo'}
                    className="px-2.5 py-1 rounded-lg border border-border bg-bg hover:bg-bg-surface text-[11px] font-medium text-text flex items-center gap-1 cursor-pointer"
                  >
                    {uploadingField === 'logo' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>Đổi ảnh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoUrl('/images/logo-tichtichtinhtang.png')}
                    className="text-[11px] text-text-muted hover:text-text cursor-pointer"
                  >
                    Mặc định
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 1.2 Con Dấu Sáp */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <label className="text-xs font-semibold text-text block">Con Dấu Sáp Niêm Phong</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border border-border bg-bg flex items-center justify-center p-1 overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={waxSealUrl} alt="Con dấu sáp" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={waxSealUrl}
                  onChange={(e) => setWaxSealUrl(e.target.value)}
                  placeholder="URL con dấu sáp..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text font-mono"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={sealInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'seal')}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => sealInputRef.current?.click()}
                    disabled={uploadingField === 'seal'}
                    className="px-2.5 py-1 rounded-lg border border-border bg-bg hover:bg-bg-surface text-[11px] font-medium text-text flex items-center gap-1 cursor-pointer"
                  >
                    {uploadingField === 'seal' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>Đổi con dấu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaxSealUrl('/images/wax-seal-combined.png')}
                    className="text-[11px] text-text-muted hover:text-text cursor-pointer"
                  >
                    Mặc định
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 1.3 Hình Nền Thiệp */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <label className="text-xs font-semibold text-text block">Ảnh Nền Thiệp (Hồ sen & Rặng tre)</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border border-border bg-bg flex items-center justify-center overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bgUrl} alt="Ảnh nền" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={bgUrl}
                  onChange={(e) => setBgUrl(e.target.value)}
                  placeholder="URL ảnh nền..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text font-mono"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={bgInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'bg')}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => bgInputRef.current?.click()}
                    disabled={uploadingField === 'bg'}
                    className="px-2.5 py-1 rounded-lg border border-border bg-bg hover:bg-bg-surface text-[11px] font-medium text-text flex items-center gap-1 cursor-pointer"
                  >
                    {uploadingField === 'bg' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>Đổi ảnh nền</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgUrl('/images/bg-bamboo-lotus.png')}
                    className="text-[11px] text-text-muted hover:text-text cursor-pointer"
                  >
                    Mặc định
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            THẺ 2: NHẠC NỀN & ÂM LƯỢNG
           ======================================================== */}
        <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/70 pb-3">
            <Music className="w-4 h-4 text-[#006C3A]" />
            <h3 className="font-semibold text-sm text-text">2. Nhạc Nền Sự Kiện</h3>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-text block">Đường dẫn tệp âm thanh (MP3, WAV, M4A)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={config.audio?.src || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    audio: { ...config.audio, src: e.target.value },
                  })
                }
                placeholder="/music/bg-love.mp3..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text font-mono"
              />
              <input
                type="file"
                ref={audioInputRef}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'audio')}
                accept="audio/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                disabled={uploadingField === 'audio'}
                className="px-3 py-2 rounded-xl border border-border bg-bg hover:bg-bg-surface text-xs font-medium text-text flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {uploadingField === 'audio' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Tải nhạc</span>
              </button>
            </div>

            {/* Trình nghe thử nhạc */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border/80">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleToggleAudioPreview}
                  className="w-8 h-8 rounded-full bg-[#006C3A] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity shrink-0"
                  title={isPlayingAudio ? 'Dừng phát' : 'Nghe thử nhạc'}
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="text-xs">
                  <p className="font-medium text-text">{isPlayingAudio ? 'Đang phát thử...' : 'Nghe thử bài hát'}</p>
                  <p className="text-[11px] text-text-muted truncate max-w-[220px]">
                    {config.audio?.src || 'Chưa có nhạc'}
                  </p>
                </div>
              </div>
            </div>

            {/* Thanh trượt âm lượng */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-text flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-accent" />
                  <span>Âm lượng mặc định</span>
                </span>
                <span className="font-mono font-bold text-[#006C3A]">
                  {Math.round((config.audio?.defaultVolume ?? 0.4) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={config.audio?.defaultVolume ?? 0.4}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    audio: {
                      ...config.audio,
                      defaultVolume: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full accent-[#006C3A] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            THẺ 3: THỜI GIAN & ĐẾM NGƯỢC
           ======================================================== */}
        <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#006C3A]" />
              <h3 className="font-semibold text-sm text-text">3. Thời Gian & Đếm Ngược</h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={config.showCountdown !== false}
                onChange={(e) => setConfig({ ...config, showCountdown: e.target.checked })}
                className="rounded accent-[#006C3A]"
              />
              <span className="font-medium text-text">Hiện đếm ngược</span>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-text block mb-1">Thời gian đếm ngược (Mốc sự kiện ISO)</label>
              <input
                type="text"
                value={config.eventDateIso || ''}
                onChange={(e) => setConfig({ ...config, eventDateIso: e.target.value })}
                placeholder="2026-12-05T18:30:00+07:00"
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text font-mono"
              />
              <p className="text-[11px] text-text-muted mt-1">Định dạng chuẩn: YYYY-MM-DDTHH:mm:ss+07:00</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-text block mb-1">Dòng chữ ngày tổ chức trên thiệp</label>
              <input
                type="text"
                value={config.eventDateLabel || ''}
                onChange={(e) => setConfig({ ...config, eventDateLabel: e.target.value })}
                placeholder="Thứ Bảy, ngày 05 tháng 12 năm 2026"
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Giờ đón khách</label>
                <input
                  type="text"
                  value={config.checkinTime || ''}
                  onChange={(e) => setConfig({ ...config, checkinTime: e.target.value })}
                  placeholder="18:00 - 18:30"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Giờ bắt đầu</label>
                <input
                  type="text"
                  value={config.startTime || ''}
                  onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
                  placeholder="18:30"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            THẺ 4: ĐỊA ĐIỂM TỔ CHỨC
           ======================================================== */}
        <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/70 pb-3">
            <MapPin className="w-4 h-4 text-[#006C3A]" />
            <h3 className="font-semibold text-sm text-text">4. Địa Điểm Tổ Chức</h3>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Tên hội trường</label>
                <input
                  type="text"
                  value={config.venueHall || ''}
                  onChange={(e) => setConfig({ ...config, venueHall: e.target.value })}
                  placeholder="HỘI TRƯỜNG B"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Tên địa điểm / Trường</label>
                <input
                  type="text"
                  value={config.venueName || ''}
                  onChange={(e) => setConfig({ ...config, venueName: e.target.value })}
                  placeholder="Trường Đại học Gia Định"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text block mb-1">Địa chỉ chi tiết</label>
              <input
                type="text"
                value={config.venueAddress || ''}
                onChange={(e) => setConfig({ ...config, venueAddress: e.target.value })}
                placeholder="371 Nguyễn Kiệm, Phường Hạnh Thông, TP. Hồ Chí Minh"
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text block mb-1">Đường dẫn Google Maps (Mở định vị)</label>
              <input
                type="text"
                value={config.googleMapsUrl || ''}
                onChange={(e) => setConfig({ ...config, googleMapsUrl: e.target.value })}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text font-mono"
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            THẺ 5: THÔNG TIN SHOW & THƯ TRI ÂN
           ======================================================== */}
        <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/70 pb-3">
            <Sparkles className="w-4 h-4 text-[#006C3A]" />
            <h3 className="font-semibold text-sm text-text">5. Tên Show, Khung Lời Mời & Tri Ân</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-text block mb-1">Tên đêm nhạc kịch</label>
              <input
                type="text"
                value={config.eventName || ''}
                onChange={(e) => setConfig({ ...config, eventName: e.target.value })}
                placeholder="Tịch Tịch Tình Tang"
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text block mb-1">Câu slogan trích dẫn</label>
              <input
                type="text"
                value={config.slogan || ''}
                onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
                placeholder="Vở ca nhạc kịch dân gian..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text block mb-1">Đơn vị tổ chức / Host chủ trì</label>
              <input
                type="text"
                value={config.hostName || ''}
                onChange={(e) => setConfig({ ...config, hostName: e.target.value })}
                placeholder="The Light"
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
              />
            </div>

            <div className="pt-2 border-t border-border/60 space-y-3">
              <p className="text-xs font-bold text-[#006C3A] uppercase tracking-wider">
                Khung Lời Mời Trang Trọng (Page 2 Trên Thiệp)
              </p>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">
                  Dòng chữ nhỏ phía trên lời mời (dedicationBadge)
                </label>
                <input
                  type="text"
                  value={config.dedicationBadge ?? ''}
                  onChange={(e) => setConfig({ ...config, dedicationBadge: e.target.value })}
                  placeholder="Ví dụ: TRÂN TRỌNG KÍNH MỜI QUÝ THẦY/CÔ"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
                />
                <p className="text-[11px] text-text-muted mt-1">Dòng chữ nhỏ nằm ngay phía trên tên khách mời</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">
                  Lời xưng hô đầu thư (letterSalutation)
                </label>
                <input
                  type="text"
                  value={config.letterSalutation ?? ''}
                  onChange={(e) => setConfig({ ...config, letterSalutation: e.target.value })}
                  placeholder="Ví dụ: Kính gửi, Thân gửi..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
                />
                <p className="text-[11px] text-text-muted mt-1">Sẽ hiển thị dạng: &ldquo;Kính gửi [Tên khách]&rdquo;</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">
                  Nội dung khung lời mời chung (generalInvitationText)
                </label>
                <textarea
                  rows={5}
                  value={invitationText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInvitationText(val);
                    const lines = val
                      .split('\n')
                      .map((l) => l.trim())
                      .filter(Boolean);
                    setConfig((prev) => ({
                      ...prev,
                      generalInvitationText: lines.length > 0 ? lines : (val.trim() ? [val.trim()] : []),
                    }));
                  }}
                  placeholder="Nhập nội dung các đoạn văn lời mời (ấn Enter để xuống dòng tự nhiên)..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text leading-relaxed whitespace-pre-line"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Hỗ trợ xuống dòng tự nhiên. Trên thiệp mời sẽ hiển thị đúng các đoạn văn và dấu ngắt dòng như bạn nhập tại đây.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <label className="text-xs font-semibold text-text block mb-1">Thư tri ân gửi Quý Thầy/Cô (Chân trang thiệp)</label>
              <textarea
                rows={3}
                value={config.footerThankYou || ''}
                onChange={(e) => setConfig({ ...config, footerThankYou: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            THẺ 6: ĐƠN VỊ TÀI TRỢ & ĐƠN VỊ ĐỒNG HÀNH
           ======================================================== */}
        <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/70 pb-3">
            <Handshake className="w-4 h-4 text-[#006C3A]" />
            <h3 className="font-semibold text-sm text-text">6. Đơn Vị Tài Trợ & Đồng Hành</h3>
          </div>

          {/* Danh sách đối tác hiện có */}
          {(config.sponsors || []).length === 0 ? (
            <div className="p-4 text-center rounded-xl border border-dashed border-border bg-bg/50 text-xs text-text-muted">
              Chưa có đối tác nào. Thêm mới ở khung dưới.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
              {(config.sponsors || []).map((sp) => (
                <div
                  key={sp.id}
                  className="relative p-2.5 rounded-xl border border-border bg-bg flex items-center gap-2.5 shadow-2xs group"
                >
                  <div className="w-12 h-12 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 border border-border/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sp.logoUrl} alt={sp.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0 pr-5">
                    <span
                      className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        sp.category === 'sponsor'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {sp.category === 'sponsor' ? 'Tài trợ' : 'Đồng hành'}
                    </span>
                    <p className="text-xs font-semibold text-text truncate mt-0.5">{sp.name || 'Đối tác'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePartner(sp.id)}
                    className="absolute top-2 right-2 text-text-muted hover:text-rose-600 p-0.5 cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Form thêm đối tác */}
          <form onSubmit={handleAddPartner} className="pt-2 border-t border-border/60 space-y-2.5">
            <p className="text-xs font-semibold text-text flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-[#006C3A]" />
              <span>Thêm đối tác mới</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newPartnerName}
                onChange={(e) => setNewPartnerName(e.target.value)}
                placeholder="Tên đơn vị (ACB, The Light...)"
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-bg border border-border text-text"
              />
              <select
                value={newPartnerCategory}
                onChange={(e) => setNewPartnerCategory(e.target.value as 'sponsor' | 'companion')}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-bg border border-border text-text"
              >
                <option value="sponsor">Đơn vị tài trợ</option>
                <option value="companion">Đơn vị đồng hành</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newPartnerUrl}
                onChange={(e) => setNewPartnerUrl(e.target.value)}
                placeholder="URL logo (PNG trong suốt)..."
                className="flex-1 px-2.5 py-1.5 text-xs rounded-xl bg-bg border border-border text-text font-mono"
              />
              <input
                type="file"
                ref={partnerInputRef}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'partner')}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => partnerInputRef.current?.click()}
                disabled={uploadingField === 'partner'}
                className="px-2.5 py-1.5 rounded-xl border border-border bg-bg text-[11px] font-medium text-text flex items-center gap-1 cursor-pointer shrink-0"
              >
                {uploadingField === 'partner' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                <span>Tải ảnh</span>
              </button>
              <button
                type="submit"
                disabled={!newPartnerUrl.trim()}
                className="px-3 py-1.5 rounded-xl bg-primary text-primary-fg text-xs font-semibold disabled:opacity-40 cursor-pointer shrink-0"
              >
                + Thêm
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================
            THẺ 7: THÔNG TIN LIÊN HỆ BAN TỔ CHỨC
           ======================================================== */}
        <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-border/70 pb-3">
            <Phone className="w-4 h-4 text-[#006C3A]" />
            <h3 className="font-semibold text-sm text-text">7. Thông Tin Liên Hệ Ban Tổ Chức</h3>
          </div>
          <p className="text-xs text-text-muted">
            Thông tin liên hệ sẽ hiển thị trong hộp thoại nổi khi khách mời bấm nút &ldquo;Liên hệ Ban Tổ Chức&rdquo; trên thiệp. Bỏ trống các ô nếu không muốn hiển thị mục đó.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Tên BTC / Phụ trách */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text block">
                Tên Ban Tổ Chức / Người phụ trách
              </label>
              <input
                type="text"
                value={organizerContact.name || ''}
                onChange={(e) => setOrganizerContact((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ví dụ: BTC The Light / Đinh Thị Thảo Vy"
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border text-text focus:outline-none focus:ring-1 focus:ring-[#006C3A] font-sans-ui"
              />
            </div>

            {/* 2. Số điện thoại */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text block">
                Số điện thoại liên hệ
              </label>
              <input
                type="text"
                value={organizerContact.phone || ''}
                onChange={(e) => setOrganizerContact((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Ví dụ: 0912 345 678"
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border text-text focus:outline-none focus:ring-1 focus:ring-[#006C3A] font-sans-ui"
              />
            </div>

            {/* 3. Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text block">
                Email liên hệ
              </label>
              <input
                type="email"
                value={organizerContact.email || ''}
                onChange={(e) => setOrganizerContact((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Ví dụ: thelight.btclive@gmail.com"
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border text-text focus:outline-none focus:ring-1 focus:ring-[#006C3A] font-sans-ui"
              />
            </div>

            {/* 4. Link Zalo / Fanpage */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
              <label className="text-xs font-semibold text-text block">
                Link Zalo hoặc Facebook Fanpage (Tùy chọn)
              </label>
              <input
                type="url"
                value={organizerContact.social_url || ''}
                onChange={(e) => setOrganizerContact((prev) => ({ ...prev, social_url: e.target.value }))}
                placeholder="Ví dụ: https://zalo.me/... hoặc https://facebook.com/..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border text-text focus:outline-none focus:ring-1 focus:ring-[#006C3A] font-sans-ui"
              />
            </div>

            {/* 5. Ghi chú hỗ trợ */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-semibold text-text block">
                Ghi chú hỗ trợ ngắn (Tùy chọn)
              </label>
              <textarea
                rows={2}
                value={organizerContact.note || ''}
                onChange={(e) => setOrganizerContact((prev) => ({ ...prev, note: e.target.value }))}
                placeholder="Ví dụ: Hỗ trợ chỉ đường, hướng dẫn gửi xe và đón tiếp khách mời từ 17:30..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border text-text focus:outline-none focus:ring-1 focus:ring-[#006C3A] leading-relaxed resize-y font-sans-ui"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nút lưu cuối trang */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => handleSaveAll()}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-fg text-xs sm:text-sm font-semibold hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang lưu toàn bộ...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Lưu Cài Đặt Thiệp & Hình Ảnh</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
