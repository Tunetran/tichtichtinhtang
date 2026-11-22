'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Users,
  Flag,
} from 'lucide-react';
import type { GuestRecord } from '@/types/guest';
import type { EventConfig } from '@/config/event';
import { EVENT_CONFIG } from '@/config/event';
import { parseGuestContact } from '@/lib/guest-contact';
import { RsvpSection } from './RsvpSection';
import { GuestWishesSection } from './GuestWishesSection';
import { EventCountdown } from './EventCountdown';
import { AddToCalendarButton } from './AddToCalendarButton';
import { OrganizerContactModal } from './OrganizerContactModal';
import type { OrganizerContact } from '@/lib/site-settings';

interface LetterContentProps {
  guest: GuestRecord;
  config?: EventConfig;
  onRsvpUpdated: (updated: GuestRecord) => void;
  logoUrl?: string | null;
  isOpened?: boolean;
  onCloseEnvelope?: () => void;
  organizerContact?: OrganizerContact | null;
}

/**
 * Đường phân cách cành tre & hoa sen thanh nhã giữa các phần
 */
function SectionDivider() {
  return (
    <div className="flex items-center justify-center my-6 sm:my-8 px-4" aria-hidden="true">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C8E6C9] to-transparent" />
      <div className="px-3 flex items-center gap-1.5 text-[#006C3A]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/lotus-petal.png"
          alt=""
          className="w-4 h-4 object-contain opacity-75 bg-transparent border-0 shadow-none pointer-events-none"
        />
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C8E6C9] to-transparent" />
    </div>
  );
}

export function LetterContent({
  guest,
  config = EVENT_CONFIG,
  onRsvpUpdated,
  logoUrl,
  isOpened = false,
  onCloseEnvelope,
  organizerContact,
}: LetterContentProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [latestWish, setLatestWish] = useState<{ id?: string; name: string; message: string } | null>(null);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(config.venueAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch {}
  };

  const handleRsvpSuccess = (updated: GuestRecord) => {
    onRsvpUpdated(updated);
    const contact = parseGuestContact(updated);
    const wishText = (contact.note || updated.song_request || '').trim();
    if (wishText) {
      setLatestWish({
        id: updated.id,
        name: updated.full_name,
        message: wishText,
      });
    }
  };

  const salutation = config.letterSalutation || 'Kính gửi';
  const rawParagraphs: unknown = config.generalInvitationText;
  const paragraphs: string[] =
    Array.isArray(rawParagraphs) && rawParagraphs.length > 0 && rawParagraphs.some((p) => typeof p === 'string' && p.trim())
      ? (rawParagraphs as string[])
      : typeof rawParagraphs === 'string' && (rawParagraphs as string).trim()
      ? (rawParagraphs as string).split('\n').filter(Boolean)
      : EVENT_CONFIG.generalInvitationText;

  return (
    <article className="w-full max-w-[540px] mx-auto px-5 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-10 text-[#3E3836] pb-safe pt-safe font-sans-ui relative">
      {/* ========================================================
          1. HEADER SỰ KIỆN: Logo nghệ thuật Tịch Tịch Tình Tang (Page 2)
         ======================================================== */}
      <header className="text-center space-y-4">
        {/* Logo Tịch Tịch Tình Tang */}
        <div className="w-64 sm:w-72 mx-auto flex items-center justify-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-tichtichtinhtang.png"
            alt="Tịch Tịch Tình Tang"
            className="w-full h-auto object-contain drop-shadow-md pointer-events-none select-none"
          />
        </div>

        <div className="space-y-1">
          <p className="font-serif-title text-xs sm:text-sm text-[#006C3A] font-semibold tracking-normal uppercase">
            {config.invitationBadge || 'Thư Mời Tham Dự'}
          </p>
          <p className="font-sans-ui text-sm sm:text-base text-[#61733F] italic max-w-md mx-auto leading-relaxed text-balance px-2 tracking-normal">
            &ldquo;{config.slogan}&rdquo;
          </p>
        </div>
      </header>

      {/* ========================================================
          2. KHỐI THƯ MỜI: Lời ngỏ trang trọng gửi Thầy/Cô & Khách quý (Page 2)
         ======================================================== */}
      <section className="relative bg-[#EAF4E6]/95 backdrop-blur-xs rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,108,58,0.18)] border border-[#C8E6C9] p-6 sm:p-9 space-y-5 leading-relaxed overflow-hidden">
        {/* Khung viền mỏng phía trong */}
        <div className="absolute inset-2.5 border border-[#006C3A]/20 rounded-2xl pointer-events-none" />

        <div className="border-b border-[#006C3A]/15 pb-3 relative z-10">
          <p className="text-xs uppercase tracking-normal text-[#61733F] font-semibold font-sans-ui">
            {config.dedicationBadge || EVENT_CONFIG.dedicationBadge || 'Trân trọng kính mời Quý Thầy/Cô'}
          </p>
          <h2 className="font-serif-title text-2xl sm:text-3xl text-[#006C3A] font-bold mt-1 leading-snug tracking-normal">
            {salutation} <span className="capitalize">{guest.full_name}</span>,
          </h2>
        </div>

        {/* Lời ngỏ trang trọng (Hiển thị tự nhiên theo đúng nhập liệu từ Admin) */}
        <div className="space-y-3.5 text-base sm:text-lg text-[#006C3A] font-serif tracking-normal leading-relaxed relative z-10 font-medium">
          {paragraphs.map((p, idx) => (
            <p key={idx} className="text-left normal-case tracking-normal leading-relaxed whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>

        {/* Lời nhắn riêng gửi cá nhân (nếu có) */}
        {guest.custom_message && (
          <div className="mt-4 p-4 rounded-2xl bg-white/80 border border-[#C8E6C9] space-y-1.5 shadow-2xs relative z-10">
            <p className="text-xs font-bold uppercase tracking-normal text-[#006C3A] flex items-center gap-1.5 font-sans-ui">
              <span>Lời nhắn riêng gửi đến bạn:</span>
            </p>
            <p className="leading-relaxed text-[#3E3836] italic text-base sm:text-lg font-handwriting">
              &ldquo;{guest.custom_message}&rdquo;
            </p>
          </div>
        )}

        {/* Chú chim sẻ nhỏ đậu ở chân khối lời ngỏ trong bố cục flex chuẩn không đè lên chữ */}
        <div className="flex justify-end pr-2 pt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/sparrow-perched.png"
            alt="Chim sẻ"
            className="w-14 sm:w-16 h-auto object-contain pointer-events-none select-none bg-transparent border-0 shadow-none"
          />
        </div>
      </section>

      {/* Đường phân cách */}
      <SectionDivider />

      {/* ========================================================
          3. KHỐI LỊCH DIỄN, THỜI GIAN & ĐỊA ĐIỂM (Page 3)
         ======================================================== */}
      <section className="relative bg-[#FFFDF9]/95 backdrop-blur-xs rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,108,58,0.18)] border border-[#C8E6C9] p-6 sm:p-8 space-y-6 overflow-visible">
        {/* Câu thơ đề dân gian */}
        <div className="text-center space-y-1 border-b border-[#C8E6C9]/60 pb-3">
          <p className="font-serif-title text-sm sm:text-base text-[#006C3A] font-semibold tracking-normal leading-relaxed">
            TÍCH XƯA KỂ LẠI CHUYỆN TÌNH
          </p>
          <p className="font-serif-title text-sm sm:text-base text-[#006C3A] font-semibold tracking-normal leading-relaxed">
            TÍCH NÀO KỂ LẠI CHUYỆN TÌNH ĐÂY TA?
          </p>
        </div>

        {/* Bảng Lịch Tháng 12/2026: Chú chim sẻ được đặt TÁCH RIÊNG PHÍA TRÊN bằng bố cục chuẩn flex, hoàn toàn KHÔNG DÙNG absolute, không chạm hay che bất kỳ chữ hoặc ngày nào */}
        <div className="pt-2">
          {/* Chú chim sẻ tách riêng ở phía trên bảng lịch */}
          <div className="flex justify-end pr-2 sm:pr-4 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/sparrow-perched.png"
              alt="Chim sẻ"
              className="w-16 sm:w-20 h-auto object-contain -scale-x-100 pointer-events-none select-none bg-transparent border-0 shadow-none"
            />
          </div>

          {/* Khung Bảng Lịch: 100% các ô ngày hiển thị rõ ràng, hoàn toàn thông thoáng */}
          <div className="relative mx-auto rounded-xl overflow-hidden border border-[#F8B4C4] shadow-sm bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/calendar-dec-2026.jpg"
              alt="Lịch diễn Tháng 12/2026"
              className="w-full h-auto object-contain block pointer-events-none select-none"
            />
          </div>
        </div>

        {/* Live Countdown Timer đếm ngược đến 05/12/2026 */}
        {config.showCountdown !== false && (
          <div className="pt-1">
            <EventCountdown targetDateIso={config.eventDateIso} />
          </div>
        )}

        {/* Hai cột thông tin: Thời gian & Địa điểm (Page 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-[#C8E6C9]/60">
          {/* Cột trái: Thời gian */}
          <div className="space-y-1 text-center sm:text-left flex flex-col justify-center sm:border-r sm:border-[#C8E6C9]/60 sm:pr-4">
            <p className="text-xs sm:text-sm text-[#61733F] font-sans-ui italic tracking-normal">
              Sự kiện diễn ra vào
            </p>
            <h3 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-[#006C3A] tracking-normal">
              05.12.2026
            </h3>
            <div className="h-px bg-[#006C3A]/30 w-3/4 mx-auto sm:mx-0 my-1.5" />
            <p className="font-serif-title text-xl sm:text-2xl font-bold text-[#006C3A] tracking-normal">
              18:30 - 19:30
            </p>
            <p className="text-xs text-[#61733F] pt-0.5 font-sans-ui tracking-normal leading-relaxed">
              Đón khách: <strong className="text-[#3E3836] font-semibold">{config.checkinTime}</strong>
            </p>
          </div>

          {/* Cột phải: Địa điểm */}
          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-block px-3 py-1 rounded-md bg-[#006C3A] text-white font-sans-ui text-xs sm:text-sm font-bold tracking-normal">
              {config.venueHall || 'HỘI TRƯỜNG B'}
            </span>
            <p className="font-serif-title text-base sm:text-lg font-bold text-[#006C3A] leading-snug tracking-normal">
              {config.venueName}
            </p>
            <p className="font-sans-ui text-xs sm:text-sm text-[#3E3836] leading-relaxed tracking-normal">
              {config.venueAddress}
            </p>

            {/* Link chỉ đường Google Maps */}
            <div className="pt-1">
              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-sans-ui text-sm font-bold text-[#006C3A] underline underline-offset-4 hover:text-[#016748] transition-colors tracking-normal"
              >
                <span>ĐỊA ĐIỂM: TẠI ĐÂY</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-[11px] text-[#61733F] italic mt-0.5 font-sans-ui">
                *click vào đây để xem định vị
              </p>
            </div>
          </div>
        </div>

        {/* Nút thêm vào lịch & sao chép địa chỉ */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3 border-t border-[#C8E6C9]/40">
          <AddToCalendarButton config={config} />
          <button
            type="button"
            onClick={handleCopyAddress}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap text-[#61733F] hover:text-[#006C3A] bg-white border border-[#C8E6C9] hover:border-[#006C3A] shadow-xs hover:shadow-sm active:scale-[0.98] transition-all duration-200 min-h-[42px] cursor-pointer font-sans-ui tracking-normal"
          >
            {copiedAddress ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-600 font-semibold">Đã chép địa chỉ</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#61733F] shrink-0" />
                <span>Sao chép địa chỉ</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Đường phân cách */}
      <SectionDivider />

      {/* ========================================================
          4. KHỐI DRESSCODE (Page 4)
         ======================================================== */}
      <section className="space-y-6 text-center">
        {/* Huy hiệu DRESSCODE */}
        <div className="flex justify-center">
          <div className="px-6 py-2 rounded-full bg-[#FCEBE6] border border-[#F8C6D2] shadow-xs">
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold tracking-normal text-[#006C3A] uppercase">
              DRESSCODE
            </h2>
          </div>
        </div>

        <p className="font-sans-ui text-xs sm:text-sm text-[#61733F] max-w-sm mx-auto leading-relaxed tracking-normal">
          {config.dresscodeDescription}
        </p>

        {/* 3 vòng tròn minh họa phong cách trang phục */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 pt-2">
          {/* 1. Đồ lịch sự */}
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-[#C9E6C9] shadow-sm bg-[#E1EEDD] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/dresscode-1-smart.png"
                alt="Đồ lịch sự"
                className="w-full h-full object-cover pointer-events-none select-none"
              />
            </div>
            <p className="font-sans-ui text-[11px] sm:text-xs font-bold text-[#3E3836] tracking-normal uppercase">
              ĐỒ LỊCH SỰ
            </p>
          </div>

          {/* 2. Áo dài */}
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-[#F8B4C4] shadow-sm bg-[#FCE8ED] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/dresscode-2-aodai.png"
                alt="Áo dài"
                className="w-full h-full object-cover pointer-events-none select-none"
              />
            </div>
            <p className="font-sans-ui text-[11px] sm:text-xs font-bold text-[#3E3836] tracking-normal uppercase">
              ÁO DÀI
            </p>
          </div>

          {/* 3. Trang phục truyền thống */}
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-[#FAD8C0] shadow-sm bg-[#FFF0E5] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/dresscode-3-traditional.png"
                alt="Trang phục truyền thống"
                className="w-full h-full object-cover pointer-events-none select-none"
              />
            </div>
            <p className="font-sans-ui text-[11px] sm:text-xs font-bold text-[#3E3836] tracking-normal uppercase leading-tight">
              TRANG PHỤC TRUYỀN THỐNG
            </p>
          </div>
        </div>
      </section>

      {/* Đường phân cách */}
      <SectionDivider />

      {/* ========================================================
          5. KHỐI TIMELINE SỰ KIỆN (Page 4)
         ======================================================== */}
      <section className="space-y-6 text-center">
        {/* Huy hiệu TIMELINE SỰ KIỆN */}
        <div className="flex justify-center">
          <div className="px-6 py-2 rounded-full bg-[#FCEBE6] border border-[#F8C6D2] shadow-xs">
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold tracking-normal text-[#006C3A] uppercase">
              TIMELINE SỰ KIỆN
            </h2>
          </div>
        </div>

        {/* 3 Mốc Thời Gian (3 cột có icon đường nét tối giản chuẩn thiết kế) */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-3">
          {/* Mốc 1: Check-in */}
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-[#3E3836]">
              <MapPin className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.4]" />
            </div>
            <div className="space-y-0.5">
              <p className="font-sans-ui text-xs sm:text-sm font-bold text-[#3E3836] tracking-normal uppercase">
                CHECK-IN
              </p>
              <p className="font-sans-ui text-xs sm:text-sm text-[#006C3A] font-semibold tabular-nums">
                18:00 - 18:30
              </p>
            </div>
          </div>

          {/* Mốc 2: Bắt đầu sự kiện */}
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-[#3E3836]">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.4]" />
            </div>
            <div className="space-y-0.5">
              <p className="font-sans-ui text-xs sm:text-sm font-bold text-[#3E3836] tracking-normal uppercase">
                BẮT ĐẦU SỰ KIỆN
              </p>
              <p className="font-sans-ui text-xs sm:text-sm text-[#006C3A] font-semibold tabular-nums">
                18:30 - 19:30
              </p>
            </div>
          </div>

          {/* Mốc 3: Kết thúc sự kiện */}
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-[#3E3836]">
              <Flag className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.4]" />
            </div>
            <div className="space-y-0.5">
              <p className="font-sans-ui text-xs sm:text-sm font-bold text-[#3E3836] tracking-normal uppercase">
                KẾT THÚC SỰ KIỆN
              </p>
              <p className="font-sans-ui text-xs sm:text-sm text-[#006C3A] font-semibold tabular-nums">
                19:30
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Đường phân cách */}
      <SectionDivider />

      {/* ========================================================
          6. KHỐI XÁC NHẬN THAM DỰ - RSVP (Page 5)
         ======================================================== */}
      <RsvpSection
        guest={guest}
        config={config}
        onRsvpSuccess={handleRsvpSuccess}
        logoUrl={logoUrl}
      />

      {/* ========================================================
          KHỐI LỜI CHÚC TỪ KHÁCH MỜI
         ======================================================== */}
      <SectionDivider />
      <GuestWishesSection latestWish={latestWish} />

      {/* ========================================================
          KHỐI ĐƠN VỊ TÀI TRỢ & ĐƠN VỊ ĐỒNG HÀNH (Trang trọng gần cuối thiệp)
         ======================================================== */}
      {(() => {
        const sponsors = (config.sponsors || []).filter((s) => s.category === 'sponsor' && s.logoUrl);
        const companions = (config.sponsors || []).filter((s) => s.category === 'companion' && s.logoUrl);
        const hasPartners = sponsors.length > 0 || companions.length > 0;

        if (!hasPartners) return null;

        return (
          <>
            <SectionDivider />
            <section className="space-y-8 text-center pt-2">
              {/* Nhóm 1: Đơn vị tài trợ (tự ẩn nếu chưa có) */}
              {sponsors.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="px-6 py-2 rounded-full bg-[#FCEBE6] border border-[#F8C6D2] shadow-xs">
                      <h2 className="font-serif-title text-base sm:text-lg font-bold tracking-normal text-[#006C3A] uppercase text-center">
                        ĐƠN VỊ TÀI TRỢ
                      </h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 items-center justify-items-center">
                    {sponsors.map((sp) => (
                      <div key={sp.id} className="flex flex-col items-center justify-center p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sp.logoUrl}
                          alt={sp.name || 'Đơn vị tài trợ'}
                          className="w-auto h-24 sm:h-32 max-w-full object-contain pointer-events-none select-none bg-transparent border-0 shadow-none drop-shadow-sm"
                        />
                        {sp.name && (
                          <span className="font-sans-ui text-xs font-semibold text-[#3E3836] mt-2 text-center">
                            {sp.name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nhóm 2: Đơn vị đồng hành (tự ẩn nếu chưa có) */}
              {companions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="px-6 py-2 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] shadow-xs">
                      <h2 className="font-serif-title text-base sm:text-lg font-bold tracking-normal text-[#006C3A] uppercase text-center">
                        ĐƠN VỊ ĐỒNG HÀNH
                      </h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 items-center justify-items-center">
                    {companions.map((comp) => (
                      <div key={comp.id} className="flex flex-col items-center justify-center p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={comp.logoUrl}
                          alt={comp.name || 'Đơn vị đồng hành'}
                          className="w-auto h-24 sm:h-32 max-w-full object-contain pointer-events-none select-none bg-transparent border-0 shadow-none drop-shadow-sm"
                        />
                        {comp.name && (
                          <span className="font-sans-ui text-xs font-semibold text-[#3E3836] mt-2 text-center">
                            {comp.name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        );
      })()}

      {/* Đường phân cách */}
      <SectionDivider />

      {/* ========================================================
          7. KHỐI LỜI CẢM ƠN & CHÂN TRANG TRI ÂN (Page 6)
         ======================================================== */}
      <section className="space-y-6 text-center">
        {/* Logo The Light cành tre */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-the-light.png"
            alt="The Light"
            className="w-full h-full object-contain drop-shadow-sm pointer-events-none select-none"
          />
        </div>

        {/* Thẻ Thư Tri Ân Gửi Quý Thầy/Cô (Page 6) */}
        <div className="relative bg-[#FFF4E5]/95 backdrop-blur-xs rounded-3xl p-6 sm:p-9 shadow-[0_15px_35px_-8px_rgba(0,108,58,0.12)] border border-[#FAD8C0] space-y-4 text-justify font-serif leading-relaxed text-[#3E3836]">
          <p className="text-sm sm:text-base leading-relaxed uppercase tracking-normal">
            THE LIGHT XIN CHÂN THÀNH CẢM ƠN QUÝ THẦY CÔ ĐÃ DÀNH THỜI GIAN QUÝ BÁU, GÁC LẠI
            NHỮNG BẬN RỘN ĐỂ ĐẾN THAM DỰ SỰ KIỆN CỦA CHÚNG EM. SỰ HIỆN DIỆN CỦA QUÝ THẦY CÔ KHÔNG
            CHỈ LÀ NIỀM VINH DỰ MÀ CÒN LÀ NGUỒN ĐỘNG VIÊN LỚN LAO, TIẾP THÊM CHO CẢ ĐOÀN SỰ TỰ
            TIN VÀ CẢM HỨNG ĐỂ MANG ĐẾN MỘT BUỔI DIỄN TRỌN VẸN NHẤT. KÍNH CHÚC QUÝ THẦY CÔ THẬT
            NHIỀU SỨC KHỎE, HẠNH PHÚC VÀ LUÔN THÀNH CÔNG TRÊN CON ĐƯỜNG GIEO MẦM TRI THỨC.
          </p>
          <p className="text-right font-serif-title text-base sm:text-lg font-bold text-[#006C3A] tracking-normal">
            TRÂN TRỌNG CẢM ƠN! 🎋
          </p>
        </div>

        {/* Nút hành động cuối thư: Liên hệ Ban Tổ Chức & Gấp lại phong bì */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <OrganizerContactModal contact={organizerContact} />
          {onCloseEnvelope && (
            <button
              type="button"
              onClick={onCloseEnvelope}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#C8E6C9] bg-white/90 hover:bg-[#E1EEDD] hover:border-[#006C3A] text-[#61733F] hover:text-[#006C3A] transition-all duration-200 text-xs sm:text-sm font-semibold shadow-2xs active:scale-[0.97] cursor-pointer font-sans-ui tracking-normal"
            >
              <RotateCcw className="w-4 h-4 text-[#006C3A]" />
              <span>Gấp lại phong bì thư</span>
            </button>
          )}
        </div>

        {/* Bản quyền sự kiện */}
        <footer className="pt-4 text-xs text-[#61733F]/80 space-y-1 font-sans-ui tracking-normal">
          <p>© {new Date().getFullYear()} Tịch Tịch Tình Tang — {config.hostName}</p>
          <p className="text-[11px]">Trường Đại học Gia Định • TP. Hồ Chí Minh</p>
        </footer>
      </section>
    </article>
  );
}
