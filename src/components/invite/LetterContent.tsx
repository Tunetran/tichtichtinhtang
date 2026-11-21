'use client';

import { useState } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { Calendar, Clock, MapPin, Shirt, ExternalLink, Copy, Check, Sparkles, Heart } from 'lucide-react';
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
  logoUrl?: string | null;
  isOpened?: boolean;
}

/**
 * Logo sự kiện động ở đầu lá thư mời:
 * Hiển thị trực tiếp ảnh PNG tách nền, không khung viền hay nền trắng, kèm drop-shadow-sm ôm sát hình logo.
 */
function LetterHeaderLogo({ logoUrl }: { logoUrl?: string | null }) {
  const [hasError, setHasError] = useState(false);
  const src = logoUrl || '/images/default-logo.png';

  if (hasError) return null;

  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto flex items-center justify-center shrink-0 bg-transparent border-0 shadow-none p-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Logo sự kiện"
        className="w-full h-full object-contain drop-shadow-sm bg-transparent"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export function LetterContent({
  guest,
  config = EVENT_CONFIG,
  onRsvpUpdated,
  logoUrl,
  isOpened = false,
}: LetterContentProps) {
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
    <article className="w-full max-w-[480px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 text-[#4A3B42] pb-safe pt-safe">
      {/* 1. Header Đêm Nhạc (Hot-stamped Luxury Editorial Style tông Hồng & Trắng) */}
      <header className="text-center space-y-3.5">
        <LetterHeaderLogo logoUrl={logoUrl} />

        <div className="space-y-1">
          <p className="font-handwriting text-2xl sm:text-3xl text-[#5C1F38] font-semibold tracking-wide">
            {config.invitationBadge || 'Thư Mời Tham Dự'}
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#5C1F38] leading-snug text-balance">
            {config.eventName}
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-[#7D6670] italic max-w-sm mx-auto leading-relaxed text-balance">
          &ldquo;{config.slogan}&rdquo;
        </p>

        {/* Delicate ornamental hairlines with rose heart */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <span className="h-px w-16 bg-[#F6C1D3]" />
          <Heart className="w-3.5 h-3.5 text-[#D85C8A] fill-[#D85C8A]" />
          <span className="h-px w-16 bg-[#F6C1D3]" />
        </div>
      </header>

      {/* 2. Bộ đếm ngược thời gian (Live Countdown) */}
      {config.showCountdown !== false && (
        <EventCountdown targetDateIso={config.eventDateIso} />
      )}

      {/* 3. Lời Ngỏ Cá Nhân (Editorial Letter Card) */}
      <section className="editorial-card rounded-3xl p-6 sm:p-8 space-y-4 leading-relaxed bg-white border border-[#F6C1D3] shadow-sm">
        <div className="border-b border-[#F6C1D3]/70 pb-3">
          <p className="text-[11px] uppercase tracking-widest text-[#7D6670] font-semibold">
            {config.dedicationBadge || 'Dành tặng người bạn quý'}
          </p>
          <h2 className="font-handwriting text-3xl sm:text-4xl text-[#5C1F38] font-bold mt-1">
            {salutation} {guest.full_name},
          </h2>
        </div>

        <div className="space-y-3 text-[16px] sm:text-[17px] text-[#4A3B42] leading-relaxed font-handwriting">
          {paragraphs.map((paragraph, index) => (
            <div key={index} className="min-h-[1.5em]">
              {isOpened ? (
                <TypeAnimation
                  sequence={[paragraph]}
                  speed={60}
                  repeat={0}
                  cursor={false}
                  wrapper="p"
                />
              ) : (
                <p>{paragraph}</p>
              )}
            </div>
          ))}
        </div>

        {/* Khối lời nhắn riêng cho khách mời (nếu có) */}
        {guest.custom_message && (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#FFF5F8] border border-[#F6C1D3] space-y-1.5 shadow-2xs font-handwriting">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#D85C8A] flex items-center gap-1.5 not-italic font-sans">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lời nhắn riêng gửi đến bạn:</span>
            </p>
            <div className="leading-relaxed text-[#4A3B42] italic text-[16px]">
              {isOpened ? (
                <TypeAnimation
                  sequence={[`“${guest.custom_message}”`]}
                  speed={60}
                  repeat={0}
                  cursor={false}
                  wrapper="p"
                />
              ) : (
                <p>&ldquo;{guest.custom_message}&rdquo;</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 4. Khối Thông Tin Chính & Địa Điểm */}
      <section className="editorial-card rounded-3xl p-6 sm:p-7 space-y-5 bg-white border border-[#F6C1D3] shadow-sm">
        <div className="text-center border-b border-[#F6C1D3]/70 pb-3 space-y-0.5">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#5C1F38]">
            Thông Tin Đêm Nhạc
          </h3>
          <p className="text-[11px] text-[#7D6670] uppercase tracking-wider font-medium">
            Thời Gian & Không Gian
          </p>
        </div>

        <div className="space-y-4 text-sm">
          {/* Thời gian */}
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-[#FFF5F8] border border-[#F6C1D3] text-[#D85C8A] shrink-0 mt-0.5">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="space-y-1 flex-1">
              <p className="font-semibold text-[#5C1F38] text-sm sm:text-base">
                {config.eventDateLabel}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#7D6670] font-mono tabular-nums">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#D85C8A]" />
                  Đón khách: <strong className="text-[#4A3B42]">{config.checkinTime}</strong>
                </span>
                <span>•</span>
                <span>
                  Bắt đầu: <strong className="text-[#4A3B42]">{config.startTime}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Địa điểm */}
          <div className="flex items-start gap-3.5 pt-3 border-t border-[#F6C1D3]/50">
            <div className="p-2 rounded-xl bg-[#FFF5F8] border border-[#F6C1D3] text-[#D85C8A] shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <p className="font-semibold text-[#5C1F38] text-sm sm:text-base">
                  {config.venueName}
                </p>
                <p className="text-xs text-[#7D6670] mt-0.5 leading-relaxed">
                  {config.venueAddress}
                </p>
              </div>

              {/* Nút tác vụ xem map & copy địa chỉ */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={config.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D85C8A] hover:underline bg-[#FFF5F8] px-3.5 py-2 rounded-xl border border-[#F6C1D3] transition-all min-h-[44px] active:scale-[0.98]"
                >
                  <span>Chỉ đường Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7D6670] hover:text-[#4A3B42] bg-white border border-[#F6C1D3] px-3 py-2 rounded-xl transition-all min-h-[44px] active:scale-[0.98]"
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
          <div className="pt-2 border-t border-[#F6C1D3]/50">
            <AddToCalendarButton config={config} />
          </div>

          {/* Trang phục (Dress code) */}
          <div className="flex items-start gap-3.5 pt-3 border-t border-[#F6C1D3]/50">
            <div className="p-2 rounded-xl bg-[#FFF5F8] border border-[#F6C1D3] text-[#D85C8A] shrink-0 mt-0.5">
              <Shirt className="w-4 h-4" />
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <p className="font-semibold text-[#5C1F38] text-sm">Trang phục gợi ý (Dress code)</p>
                <p className="text-xs text-[#7D6670] mt-0.5 leading-relaxed">
                  {config.dresscodeDescription}
                </p>
              </div>

              {/* Bảng màu mẫu sang trọng */}
              <div className="flex flex-wrap gap-2 pt-1">
                {config.dresscodeColors.map((color) => (
                  <div
                    key={color.name}
                    className="flex items-center gap-2 bg-[#FFF5F8] border border-[#F6C1D3] rounded-full px-3 py-1.5 shadow-2xs"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-xs"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[11px] font-medium text-[#7D6670]">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Timeline Buổi Diễn (Tabular Nums & Hairline Stem) */}
      <section className="editorial-card rounded-3xl p-6 sm:p-7 space-y-5 bg-white border border-[#F6C1D3] shadow-sm">
        <div className="text-center border-b border-[#F6C1D3]/70 pb-3 space-y-0.5">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#5C1F38]">
            Lịch Trình Đêm Nhạc
          </h3>
          <p className="text-[11px] text-[#7D6670] uppercase tracking-wider font-medium">
            Timeline Chương Trình
          </p>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#F6C1D3]">
          {config.timeline.map((item, index) => (
            <div key={index} className="relative">
              {/* Chấm mốc timeline hồng cánh sen */}
              <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white bg-[#D85C8A] shadow-xs" />

              <div className="space-y-0.5">
                <span className="inline-block text-xs font-bold font-mono tabular-nums text-[#D85C8A] bg-[#FFF5F8] px-2 py-0.5 rounded border border-[#F6C1D3]">
                  {item.time}
                </span>
                <p className="font-semibold text-sm text-[#5C1F38] mt-1 text-balance">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-[#7D6670] leading-relaxed">
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
      <footer className="text-center pt-8 pb-6 border-t border-[#F6C1D3]/60 space-y-3">
        <p className="text-xs text-[#7D6670] text-balance italic">
          {config.footerThankYou || 'Rất mong được gặp bạn trong đêm nhạc ấm áp này'}
        </p>
        <p className="font-handwriting text-3xl sm:text-4xl text-[#5C1F38] font-bold">
          {config.hostName}
        </p>
        <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#7D6670]/70">
          <span>© {new Date().getFullYear()} {config.eventName}</span>
        </div>
      </footer>
    </article>
  );
}
