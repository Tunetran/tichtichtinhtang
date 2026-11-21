'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TypeAnimation } from 'react-type-animation';
import { Calendar, Clock, MapPin, Shirt, ExternalLink, Copy, Check, Sparkles, Heart } from 'lucide-react';
import { LilyCorner } from '@/components/LilyCorner';
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
 * Đường phân cách tối giản giữa các phần của thiệp (Hairline gradient + Icon 14px ở giữa)
 */
function SectionDivider({ icon: Icon = Sparkles }: { icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center justify-center my-8 sm:my-10 px-4" aria-hidden="true">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#F3C6D6] to-transparent" />
      <div className="px-3 text-[#D85C8A]">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#F3C6D6] to-transparent" />
    </div>
  );
}

/**
 * Nét vẽ uốn lượn kết thư (Signature Flourish) với đường cong mềm mại và trái tim ở giữa
 */
function SignatureFlourish() {
  return (
    <div className="flex flex-col items-center justify-center my-8 sm:my-10 px-4" aria-hidden="true">
      <svg
        viewBox="0 0 240 36"
        fill="none"
        className="w-48 sm:w-56 h-9 text-[#D85C8A] overflow-visible"
      >
        {/* Đường cong uốn lượn bên trái */}
        <motion.path
          d="M 12 18 C 38 18, 55 6, 82 20 C 96 27, 108 22, 114 16"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Trái tim nhỏ ở chính giữa */}
        <motion.path
          d="M 120 20 C 120 20, 114 14, 114 10 C 114 6.5, 117 4.5, 120 7.5 C 123 4.5, 126 6.5, 126 10 C 126 14, 120 20, 120 20 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.5"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.5, ease: 'backOut' }}
        />
        {/* Đường cong uốn lượn vuốt nhẹ bên phải */}
        <motion.path
          d="M 126 16 C 132 22, 144 27, 158 20 C 185 6, 202 18, 228 18"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    </div>
  );
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
    <article className="w-full max-w-[490px] mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10 sm:space-y-12 text-[#4A3B42] pb-safe pt-safe">
      {/* 1. Header Đêm Nhạc (Hot-stamped Luxury Editorial Style tông Hồng & Trắng) */}
      <header className="text-center space-y-4">
        <LetterHeaderLogo logoUrl={logoUrl} />

        <div className="space-y-1.5">
          <p className="font-handwriting text-2xl sm:text-3xl text-[#5C1F38] font-semibold tracking-wide">
            {config.invitationBadge || 'Thư Mời Tham Dự'}
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight title-pearl-shimmer leading-snug text-balance">
            {config.eventName}
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-[#7D6670] italic max-w-sm mx-auto leading-relaxed text-balance px-2">
          &ldquo;{config.slogan}&rdquo;
        </p>

        {/* Delicate ornamental hairlines with rose heart */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#F3C6D6]" />
          <Heart className="w-3.5 h-3.5 text-[#D85C8A] fill-[#D85C8A]" />
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#F3C6D6]" />
        </div>
      </header>

      {/* 2. Bộ đếm ngược thời gian (Live Countdown) */}
      {config.showCountdown !== false && (
        <div className="my-6">
          <EventCountdown targetDateIso={config.eventDateIso} />
        </div>
      )}

      {/* Đường phân cách */}
      <SectionDivider icon={Heart} />

      {/* 3. Lời Ngỏ Cá Nhân (Editorial Letter Card cao cấp với nền trắng ngà & viền đôi) */}
      <section className="relative bg-[#FFFDFD]/95 backdrop-blur-sm rounded-2xl shadow-[0_20px_60px_-15px_rgba(216,92,138,0.18)] border border-[#F3C6D6]/80 p-6 sm:p-8 sm:p-9 space-y-5 leading-relaxed overflow-hidden">
        {/* Khung viền đôi kiểu thiệp in cao cấp cách mép 12px */}
        <div className="absolute inset-3 border border-[#F3C6D6]/80 rounded-xl pointer-events-none" />

        {/* Họa tiết Hoa Ly nét mảnh ở 2 góc chéo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute top-3.5 left-3.5 w-11 h-11 pointer-events-none select-none z-10"
        >
          <LilyCorner className="w-full h-full object-contain" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute bottom-3.5 right-3.5 w-11 h-11 pointer-events-none select-none rotate-180 z-10"
        >
          <LilyCorner className="w-full h-full object-contain" />
        </motion.div>

        <div className="border-b border-[#F3C6D6]/70 pb-3 relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-[#7D6670] font-semibold">
            {config.dedicationBadge || 'Dành tặng người bạn quý'}
          </p>
          <h2 className="font-handwriting text-3xl sm:text-4xl text-[#5C1F38] font-bold mt-1">
            {salutation} {guest.full_name},
          </h2>
        </div>

        <div className="space-y-3.5 text-[16px] sm:text-[17px] text-[#4A3B42] leading-relaxed font-handwriting relative z-10">
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
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#FFF5F8]/80 border border-[#F3C6D6] space-y-1.5 shadow-2xs font-handwriting relative z-10">
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

      {/* Đường phân cách */}
      <SectionDivider icon={Sparkles} />

      {/* 4. Khối Thông Tin Chính & Địa Điểm */}
      <section className="relative bg-[#FFFDFD]/95 backdrop-blur-sm rounded-2xl shadow-[0_20px_60px_-15px_rgba(216,92,138,0.18)] border border-[#F3C6D6]/80 p-6 sm:p-8 sm:p-9 space-y-6 overflow-hidden">
        {/* Khung viền đôi kiểu thiệp in cao cấp */}
        <div className="absolute inset-3 border border-[#F3C6D6]/80 rounded-xl pointer-events-none" />

        <div className="text-center border-b border-[#F3C6D6]/70 pb-3 space-y-0.5 relative z-10">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#5C1F38]">
            Thông Tin Đêm Nhạc
          </h3>
          <p className="text-[11px] text-[#7D6670] uppercase tracking-wider font-medium">
            Thời Gian & Không Gian
          </p>
        </div>

        <div className="space-y-4 text-sm relative z-10">
          {/* Thời gian */}
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-[#FFF5F8] border border-[#F3C6D6] text-[#D85C8A] shrink-0 mt-0.5 shadow-2xs">
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
          <div className="flex items-start gap-3.5 pt-3.5 border-t border-[#F3C6D6]/50">
            <div className="p-2 rounded-xl bg-[#FFF5F8] border border-[#F3C6D6] text-[#D85C8A] shrink-0 mt-0.5 shadow-2xs">
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D85C8A] hover:underline bg-[#FFF5F8] px-3.5 py-2 rounded-xl border border-[#F3C6D6] transition-all min-h-[44px] active:scale-[0.98] shadow-2xs"
                >
                  <span>Chỉ đường Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7D6670] hover:text-[#4A3B42] bg-white border border-[#F3C6D6] px-3 py-2 rounded-xl transition-all min-h-[44px] active:scale-[0.98] shadow-2xs"
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
          <div className="pt-2 border-t border-[#F3C6D6]/50">
            <AddToCalendarButton config={config} />
          </div>

          {/* Trang phục (Dress code) */}
          <div className="flex items-start gap-3.5 pt-3.5 border-t border-[#F3C6D6]/50">
            <div className="p-2 rounded-xl bg-[#FFF5F8] border border-[#F3C6D6] text-[#D85C8A] shrink-0 mt-0.5 shadow-2xs">
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
                    className="flex items-center gap-2 bg-[#FFF5F8] border border-[#F3C6D6] rounded-full px-3 py-1.5 shadow-2xs"
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

      {/* Đường phân cách */}
      <SectionDivider icon={Sparkles} />

      {/* 5. Timeline Buổi Diễn (Lịch Trình Chương Trình) */}
      <section className="relative bg-[#FFFDFD]/95 backdrop-blur-sm rounded-2xl shadow-[0_20px_60px_-15px_rgba(216,92,138,0.18)] border border-[#F3C6D6]/80 p-6 sm:p-8 sm:p-9 space-y-6 overflow-hidden">
        {/* Khung viền đôi kiểu thiệp in cao cấp */}
        <div className="absolute inset-3 border border-[#F3C6D6]/80 rounded-xl pointer-events-none" />

        <div className="text-center border-b border-[#F3C6D6]/70 pb-3 space-y-0.5 relative z-10">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#5C1F38]">
            Lịch Trình Đêm Nhạc
          </h3>
          <p className="text-[11px] text-[#7D6670] uppercase tracking-wider font-medium">
            Timeline Chương Trình
          </p>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#F3C6D6] relative z-10">
          {config.timeline.map((item, index) => (
            <div key={index} className="relative">
              {/* Chấm mốc timeline hồng cánh sen */}
              <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white bg-[#D85C8A] shadow-xs" />

              <div className="space-y-0.5">
                <span className="inline-block text-xs font-bold font-mono tabular-nums text-[#D85C8A] bg-[#FFF5F8] px-2 py-0.5 rounded border border-[#F3C6D6]">
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

      {/* Đường phân cách */}
      <SectionDivider icon={Heart} />

      {/* 6. Bộ Sưu Tập Ảnh */}
      {config.showGallery !== false && config.gallery && config.gallery.length > 0 && (
        <>
          <PhotoGallery gallery={config.gallery} theme={config.theme} />
          <SectionDivider icon={Sparkles} />
        </>
      )}

      {/* Nét vẽ uốn lượn kết thư (Signature Flourish) trước phần RSVP */}
      <SignatureFlourish />

      {/* 7. Form Xác Nhận RSVP */}
      <RsvpSection guest={guest} config={config} onRsvpSuccess={onRsvpUpdated} />

      {/* 8. Chân trang & Chữ ký Host */}
      <footer className="text-center pt-8 pb-6 border-t border-[#F3C6D6]/60 space-y-3">
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
