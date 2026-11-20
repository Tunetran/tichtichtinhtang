'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Shirt, Music, ExternalLink, Copy, Check, Sparkles, Heart } from 'lucide-react';
import type { GuestRecord } from '@/types/guest';
import type { EventConfig } from '@/config/event';
import { EVENT_CONFIG } from '@/config/event';
import { PhotoGallery } from './PhotoGallery';
import { RsvpSection } from './RsvpSection';
import { EventCountdown } from './EventCountdown';
import { AddToCalendarButton } from './AddToCalendarButton';

interface LetterContentProps {
  guest: GuestRecord;
  config?: EventConfig;
  onRsvpUpdated: (updated: GuestRecord) => void;
}

export function LetterContent({ guest, config = EVENT_CONFIG, onRsvpUpdated }: LetterContentProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(config.venueAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch {}
  };

  const salutation = config.letterSalutation || 'Thân gửi';
  const paragraphs = config.generalInvitationText || EVENT_CONFIG.generalInvitationText;

  return (
    <article className="w-full max-w-[480px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 text-text pb-safe pt-safe">
      {/* 1. Header Đêm Nhạc (Hot-stamped Luxury Editorial Style) */}
      <header className="text-center space-y-3.5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto ring-8 ring-primary/5 shadow-sm">
          <Music className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <p className="font-script text-2xl sm:text-3xl text-accent font-semibold tracking-wide">
            {config.invitationBadge || 'Thư Mời Tham Dự'}
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-text leading-snug text-balance">
            {config.eventName}
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-text-muted italic max-w-sm mx-auto leading-relaxed text-balance">
          &ldquo;{config.slogan}&rdquo;
        </p>

        {/* Delicate ornamental hairlines with treble clef */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <span className="h-px w-16 bg-border" />
          <Heart className="w-3.5 h-3.5 text-accent fill-accent" />
          <span className="h-px w-16 bg-border" />
        </div>
      </header>

      {/* 2. Bộ đếm ngược thời gian (Live Countdown) */}
      {config.showCountdown !== false && (
        <EventCountdown targetDateIso={config.eventDateIso} />
      )}

      {/* 3. Lời Ngỏ Cá Nhân (Editorial Letter Card) */}
      <section className="editorial-card rounded-3xl p-6 sm:p-8 space-y-4 leading-relaxed">
        <div className="border-b border-border/60 pb-3">
          <p className="text-[11px] uppercase tracking-widest text-text-muted font-semibold">
            {config.dedicationBadge || 'Dành tặng người bạn quý'}
          </p>
          <h2 className="font-script text-3xl sm:text-4xl text-accent font-bold mt-1">
            {salutation} {guest.full_name},
          </h2>
        </div>

        <div className="space-y-3 text-[15px] text-text/90 leading-relaxed font-sans">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Khối lời nhắn riêng cho khách mời (nếu có) */}
        {guest.custom_message && (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-accent/8 border border-accent/25 space-y-1.5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5 not-italic">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lời nhắn riêng gửi đến bạn:</span>
            </p>
            <p className="leading-relaxed text-text italic text-sm">
              &ldquo;{guest.custom_message}&rdquo;
            </p>
          </div>
        )}
      </section>

      {/* 4. Khối Thông Tin Chính & Địa Điểm */}
      <section className="editorial-card rounded-3xl p-6 sm:p-7 space-y-5">
        <div className="text-center border-b border-border/60 pb-3 space-y-0.5">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-text">
            Thông Tin Đêm Nhạc
          </h3>
          <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">
            Thời Gian & Không Gian
          </p>
        </div>

        <div className="space-y-4 text-sm">
          {/* Thời gian */}
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-accent/10 text-accent shrink-0 mt-0.5">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="space-y-1 flex-1">
              <p className="font-semibold text-text text-sm sm:text-base">
                {config.eventDateLabel}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted font-mono tabular-nums">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  Đón khách: <strong className="text-text">{config.checkinTime}</strong>
                </span>
                <span>•</span>
                <span>
                  Bắt đầu: <strong className="text-text">{config.startTime}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Địa điểm */}
          <div className="flex items-start gap-3.5 pt-3 border-t border-border/50">
            <div className="p-2 rounded-xl bg-accent/10 text-accent shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <p className="font-semibold text-text text-sm sm:text-base">
                  {config.venueName}
                </p>
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                  {config.venueAddress}
                </p>
              </div>

              {/* Nút tác vụ xem map & copy địa chỉ */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={config.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline bg-accent/10 px-3.5 py-2 rounded-xl border border-accent/25 transition-all min-h-[44px] active:scale-[0.98]"
                >
                  <span>Chỉ đường Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text bg-bg border border-border px-3 py-2 rounded-xl transition-all min-h-[44px] active:scale-[0.98]"
                >
                  {copiedAddress ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Đã chép địa chỉ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép địa chỉ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Nút thêm vào lịch */}
          <div className="pt-2 border-t border-border/50">
            <AddToCalendarButton config={config} />
          </div>

          {/* Trang phục (Dress code) */}
          <div className="flex items-start gap-3.5 pt-3 border-t border-border/50">
            <div className="p-2 rounded-xl bg-accent/10 text-accent shrink-0 mt-0.5">
              <Shirt className="w-4 h-4" />
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <p className="font-semibold text-text text-sm">Trang phục gợi ý (Dress code)</p>
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                  {config.dresscodeDescription}
                </p>
              </div>

              {/* Bảng màu mẫu sang trọng */}
              <div className="flex flex-wrap gap-2 pt-1">
                {config.dresscodeColors.map((color) => (
                  <div
                    key={color.name}
                    className="flex items-center gap-2 bg-bg border border-border rounded-full px-3 py-1.5 shadow-2xs"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[11px] font-medium text-text-muted">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Timeline Buổi Diễn (Tabular Nums & Hairline Stem) */}
      <section className="editorial-card rounded-3xl p-6 sm:p-7 space-y-5">
        <div className="text-center border-b border-border/60 pb-3 space-y-0.5">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-text">
            Lịch Trình Đêm Nhạc
          </h3>
          <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">
            Timeline Chương Trình
          </p>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-accent/30">
          {config.timeline.map((item, index) => (
            <div key={index} className="relative">
              {/* Chấm mốc timeline vàng kim */}
              <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-bg-surface bg-accent shadow-sm" />

              <div className="space-y-0.5">
                <span className="inline-block text-xs font-bold font-mono tabular-nums text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                  {item.time}
                </span>
                <p className="font-semibold text-sm text-text mt-1 text-balance">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-text-muted leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Bộ Sưu Tập Ảnh */}
      {config.showGallery !== false && config.gallery && config.gallery.length > 0 && (
        <PhotoGallery gallery={config.gallery} theme={config.theme} />
      )}

      {/* 7. Form Xác Nhận RSVP */}
      <RsvpSection guest={guest} config={config} onRsvpSuccess={onRsvpUpdated} />

      {/* 8. Chân trang & Chữ ký Host */}
      <footer className="text-center pt-8 pb-6 border-t border-border/50 space-y-3">
        <p className="text-xs text-text-muted text-balance italic">
          {config.footerThankYou || 'Rất mong được gặp bạn trong đêm nhạc ấm áp này'}
        </p>
        <p className="font-script text-3xl sm:text-4xl text-accent font-bold">
          {config.hostName}
        </p>
        <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-text-muted/60">
          <span>© {new Date().getFullYear()} {config.eventName}</span>
        </div>
      </footer>
    </article>
  );
}
