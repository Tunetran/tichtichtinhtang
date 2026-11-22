'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Heart,
  RotateCcw,
  Users,
  Flag,
} from 'lucide-react';
import type { GuestRecord } from '@/types/guest';
import type { EventConfig } from '@/config/event';
import { EVENT_CONFIG } from '@/config/event';
import { RsvpSection } from './RsvpSection';
import { EventCountdown } from './EventCountdown';
import { AddToCalendarButton } from './AddToCalendarButton';
import { useTapHearts, HeartBurstRenderer, TapHeartButton } from './TapHeartBurst';

interface LetterContentProps {
  guest: GuestRecord;
  config?: EventConfig;
  onRsvpUpdated: (updated: GuestRecord) => void;
  logoUrl?: string | null;
  isOpened?: boolean;
  onCloseEnvelope?: () => void;
}

/**
 * Đường phân cách cành tre & hoa sen thanh nhã giữa các phần
 */
function SectionDivider() {
  return (
    <div className="flex items-center justify-center my-8 sm:my-10 px-4" aria-hidden="true">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C8E6C9] to-transparent" />
      <div className="px-3 flex items-center gap-1.5 text-[#006C3A]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/lotus-petal.png"
          alt=""
          className="w-4 h-4 object-contain opacity-75"
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
}: LetterContentProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { hearts, spawnHearts } = useTapHearts();

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(config.venueAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch {}
  };

  const salutation = config.letterSalutation || 'Kính gửi';
  const paragraphs = config.generalInvitationText || EVENT_CONFIG.generalInvitationText;

  return (
    <article className="w-full max-w-[540px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10 sm:space-y-12 text-[#3E3836] pb-safe pt-safe font-sans-ui relative">
      {/* Renderer cho hiệu ứng tim/cánh sen bay Tap-to-Heart */}
      <HeartBurstRenderer hearts={hearts} />

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
            className="w-full h-auto object-contain drop-shadow-md"
          />
        </div>

        <div className="space-y-1">
          <p className="font-serif text-xs sm:text-sm text-[#006C3A] font-semibold tracking-widest uppercase">
            {config.invitationBadge || 'Thư Mời Tham Dự'}
          </p>
          <p className="text-sm sm:text-base text-[#61733F] italic max-w-md mx-auto leading-relaxed text-balance px-2">
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
          <p className="text-xs uppercase tracking-widest text-[#61733F] font-semibold font-sans-ui">
            {config.dedicationBadge || 'Trân trọng kính mời'}
          </p>
          <h2 className="font-serif-title text-2xl sm:text-3xl text-[#006C3A] font-bold mt-1 leading-snug">
            {salutation} {guest.full_name},
          </h2>
        </div>

        {/* Lời ngỏ trang trọng (Chữ hoa Serif theo đúng thiết kế Page 2) */}
        <div className="space-y-3.5 text-base sm:text-lg text-[#006C3A] font-serif tracking-wide leading-relaxed relative z-10 font-medium">
          {paragraphs.map((p, idx) => (
            <p key={idx} className="uppercase text-justify text-balance">
              {p}
            </p>
          ))}
        </div>

        {/* Lời nhắn riêng gửi cá nhân (nếu có) */}
        {guest.custom_message && (
          <div className="mt-4 p-4 rounded-2xl bg-white/80 border border-[#C8E6C9] space-y-1.5 shadow-2xs relative z-10">
            <p className="text-xs font-bold uppercase tracking-wider text-[#006C3A] flex items-center gap-1.5 font-sans-ui">
              <span>Lời nhắn riêng gửi đến bạn:</span>
            </p>
            <p className="leading-relaxed text-[#3E3836] italic text-base sm:text-lg font-handwriting">
              &ldquo;{guest.custom_message}&rdquo;
            </p>
          </div>
        )}

        {/* Chú chim sẻ nhỏ đậu ở góc dưới bên phải thiệp */}
        <div className="absolute bottom-2 right-2 w-14 h-14 sm:w-16 sm:h-16 pointer-events-none select-none z-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/sparrow-perched.png"
            alt="Chim sẻ"
            className="w-full h-full object-contain drop-shadow-sm"
          />
        </div>

        {/* Nút Thả tim nhẹ ở cuối lời mời */}
        <div className="pt-2 flex justify-center relative z-10">
          <TapHeartButton onTap={(e) => spawnHearts(e.clientX, e.clientY)} />
        </div>
      </section>

      {/* Đường phân cách */}
      <SectionDivider />

      {/* ========================================================
          3. KHỐI LỊCH DIỄN, THỜI GIAN & ĐỊA ĐIỂM (Page 3)
         ======================================================== */}
      <section className="relative bg-[#FFFDF9]/95 backdrop-blur-xs rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,108,58,0.18)] border border-[#C8E6C9] p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Câu thơ đề dân gian */}
        <div className="text-center space-y-1 border-b border-[#C8E6C9]/60 pb-3">
          <p className="font-serif text-sm sm:text-base text-[#006C3A] font-semibold tracking-wider">
            TÍCH XƯA KỂ LẠI CHUYỆN TÌNH
          </p>
          <p className="font-serif text-sm sm:text-base text-[#006C3A] font-semibold tracking-wider">
            TÍCH NÀO KỂ LẠI CHUYỆN TÌNH ĐÂY TA?
          </p>
        </div>

        {/* Bảng Lịch Tháng 12/2026 (Chính xác theo thiết kế Page 3) */}
        <div className="relative mx-auto rounded-xl overflow-hidden border border-[#F8B4C4] shadow-sm bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/calendar-dec-2026.jpg"
            alt="Lịch diễn Tháng 12/2026"
            className="w-full h-auto object-contain block"
          />

          {/* Chú chim sẻ bay ở góc trên bên phải lịch */}
          <div className="absolute top-1 right-2 w-10 h-10 sm:w-12 sm:h-12 pointer-events-none select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/sparrow-perched.png"
              alt=""
              className="w-full h-full object-contain -scale-x-100 drop-shadow-xs"
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
            <p className="text-xs sm:text-sm text-[#61733F] font-serif italic">
              Sự kiện diễn ra vào
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#006C3A] tracking-tight">
              05.12.2026
            </h3>
            <div className="h-px bg-[#006C3A]/30 w-3/4 mx-auto sm:mx-0 my-1.5" />
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#006C3A]">
              18:30 - 19:30
            </p>
            <p className="text-[11px] text-[#61733F] pt-0.5">
              Đón khách: <strong className="text-[#3E3836] font-semibold">{config.checkinTime}</strong>
            </p>
          </div>

          {/* Cột phải: Địa điểm */}
          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-block px-3 py-1 rounded-md bg-[#006C3A] text-white font-serif text-xs sm:text-sm font-bold tracking-wider">
              {config.venueHall || 'HỘI TRƯỜNG B'}
            </span>
            <p className="font-serif text-base sm:text-lg font-bold text-[#006C3A] leading-snug">
              {config.venueName}
            </p>
            <p className="text-xs text-[#3E3836] leading-relaxed">
              {config.venueAddress}
            </p>

            {/* Link chỉ đường Google Maps */}
            <div className="pt-1">
              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-serif text-sm font-bold text-[#006C3A] underline underline-offset-4 hover:text-[#016748] transition-colors"
              >
                <span>ĐỊA ĐIỂM: TẠI ĐÂY</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-[10px] text-[#61733F] italic mt-0.5">
                *click vào đây để xem định vị
              </p>
            </div>
          </div>
        </div>

        {/* Nút thêm vào lịch & sao chép địa chỉ */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#C8E6C9]/40">
          <AddToCalendarButton config={config} />
          <button
            type="button"
            onClick={handleCopyAddress}
            className="inline-flex items-center gap-1.5 text-xs text-[#61733F] hover:text-[#006C3A] bg-white border border-[#C8E6C9] px-3 py-2 rounded-xl transition-all min-h-[40px] cursor-pointer"
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
      </section>

      {/* Đường phân cách */}
      <SectionDivider />

      {/* ========================================================
          4. KHỐI DRESSCODE (Page 4)
         ======================================================== */}
      <section className="space-y-5 text-center">
        {/* Huy hiệu DRESSCODE */}
        <div className="flex justify-center">
          <div className="px-6 py-2 rounded-full bg-[#FCEBE6] border border-[#F8C6D2] shadow-xs">
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold tracking-[0.2em] text-[#006C3A] uppercase">
              DRESSCODE
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#61733F] max-w-sm mx-auto leading-relaxed">
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
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-serif text-[11px] sm:text-xs font-bold text-[#3E3836] tracking-wider uppercase">
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
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-serif text-[11px] sm:text-xs font-bold text-[#3E3836] tracking-wider uppercase">
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
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-serif text-[11px] sm:text-xs font-bold text-[#3E3836] tracking-wider uppercase leading-tight">
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
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold tracking-[0.18em] text-[#006C3A] uppercase">
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
              <p className="font-serif text-xs sm:text-sm font-bold text-[#3E3836] tracking-wider uppercase">
                CHECK-IN
              </p>
              <p className="font-serif text-xs sm:text-sm text-[#006C3A] font-semibold tabular-nums">
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
              <p className="font-serif text-xs sm:text-sm font-bold text-[#3E3836] tracking-wider uppercase">
                BẮT ĐẦU SỰ KIỆN
              </p>
              <p className="font-serif text-xs sm:text-sm text-[#006C3A] font-semibold tabular-nums">
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
              <p className="font-serif text-xs sm:text-sm font-bold text-[#3E3836] tracking-wider uppercase">
                KẾT THÚC SỰ KIỆN
              </p>
              <p className="font-serif text-xs sm:text-sm text-[#006C3A] font-semibold tabular-nums">
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
        onRsvpSuccess={onRsvpUpdated}
        logoUrl={logoUrl}
      />

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
            className="w-full h-full object-contain drop-shadow-sm"
          />
        </div>

        {/* Thẻ Thư Tri Ân Gửi Quý Thầy/Cô (Page 6) */}
        <div className="relative bg-[#FFF4E5]/95 backdrop-blur-xs rounded-3xl p-6 sm:p-9 shadow-[0_15px_35px_-8px_rgba(0,108,58,0.12)] border border-[#FAD8C0] space-y-4 text-justify font-serif leading-relaxed text-[#3E3836]">
          <p className="text-sm sm:text-base leading-relaxed uppercase">
            THE LIGHT XIN CHÂN THÀNH CẢM ƠN QUÝ THẦY CÔ ĐÃ DÀNH THỜI GIAN QUÝ BÁU, GÁC LẠI
            NHỮNG BẬN RỘN ĐỂ ĐẾN THAM DỰ SỰ KIỆN CỦA CHÚNG EM. SỰ HIỆN DIỆN CỦA QUÝ THẦY CÔ KHÔNG
            CHỈ LÀ NIỀM VINH DỰ MÀ CÒN LÀ NGUỒN ĐỘNG VIÊN LỚN LAO, TIẾP THÊM CHO CẢ ĐOÀN SỰ TỰ
            TIN VÀ CẢM HỨNG ĐỂ MANG ĐẾN MỘT BUỔI DIỄN TRỌN VẸN NHẤT. KÍNH CHÚC QUÝ THẦY CÔ THẬT
            NHIỀU SỨC KHỎE, HẠNH PHÚC VÀ LUÔN THÀNH CÔNG TRÊN CON ĐƯỜNG GIEO MẦM TRI THỨC.
          </p>
          <p className="text-right font-serif text-base sm:text-lg font-bold text-[#006C3A]">
            TRÂN TRỌNG CẢM ƠN! 🎋
          </p>
        </div>

        {/* Nút Gấp lại phong bì */}
        {onCloseEnvelope && (
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={onCloseEnvelope}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#C8E6C9] bg-white/90 hover:bg-[#E1EEDD] hover:border-[#006C3A] text-[#61733F] hover:text-[#006C3A] transition-all duration-200 text-xs sm:text-sm font-semibold shadow-2xs active:scale-[0.97] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#006C3A]" />
              <span>Gấp lại phong bì thư</span>
            </button>
          </div>
        )}

        {/* Bản quyền sự kiện */}
        <footer className="pt-4 text-xs text-[#61733F]/80 space-y-1">
          <p>© {new Date().getFullYear()} Tịch Tịch Tình Tang — {config.hostName}</p>
          <p className="text-[11px]">Trường Đại học Gia Định • TP. Hồ Chí Minh</p>
        </footer>
      </section>
    </article>
  );
}
