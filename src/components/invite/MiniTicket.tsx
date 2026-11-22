'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Sparkles, Camera, Edit3 } from 'lucide-react';
import type { GuestRecord } from '@/types/guest';
import type { EventConfig } from '@/config/event';
import { parseGuestContact } from '@/lib/guest-contact';

interface MiniTicketProps {
  guest: GuestRecord;
  config: EventConfig;
  logoUrl?: string | null;
  onEdit: () => void;
}

export function MiniTicket({ guest, config, logoUrl, onEdit }: MiniTicketProps) {
  const logoSrc = logoUrl || '/images/logo-tichtichtinhtang.png';
  const displayTime = `${config.startTime || '18:30'} • ${config.eventDateLabel || '05/12/2026'}`;
  const { note } = parseGuestContact(guest);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-sm sm:max-w-md mx-auto relative font-sans-ui"
    >
      {/* Thẻ vé kỷ niệm */}
      <div className="relative bg-[#FFFDF9] rounded-2xl border border-[#C8E6C9] shadow-[0_20px_50px_-15px_rgba(0,108,58,0.2)] overflow-hidden">
        {/* Viền đôi trang trí nhẹ phía trong */}
        <div className="absolute inset-2 border border-[#C8E6C9]/60 rounded-xl pointer-events-none" />

        {/* Khuyết tròn xé vé bên trái */}
        <div
          className="absolute -left-3.5 top-[58%] -translate-y-1/2 w-7 h-7 rounded-full bg-[#F7F5EE] border border-[#C8E6C9] shadow-inner z-20"
          aria-hidden="true"
        />
        {/* Khuyết tròn xé vé bên phải */}
        <div
          className="absolute -right-3.5 top-[58%] -translate-y-1/2 w-7 h-7 rounded-full bg-[#F7F5EE] border border-[#C8E6C9] shadow-inner z-20"
          aria-hidden="true"
        />

        {/* PHẦN TRÊN VÉ: Header, Logo, Tên sự kiện & Tên khách mời */}
        <div className="p-6 sm:p-7 text-center space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E1EEDD] border border-[#C8E6C9] text-[10px] sm:text-xs uppercase tracking-widest text-[#006C3A] font-bold">
            <Sparkles className="w-3 h-3 text-[#006C3A]" />
            <span>Vé Kỷ Niệm Tham Dự</span>
            <Sparkles className="w-3 h-3 text-[#006C3A]" />
          </div>

          {/* Logo sự kiện */}
          <div className="w-20 h-16 mx-auto flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt="Logo sự kiện"
              className="w-full h-full object-contain drop-shadow-xs"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="space-y-1">
            <h4 className="font-serif-title text-lg sm:text-xl font-bold text-[#006C3A] text-balance">
              {config.eventName}
            </h4>
            <p className="text-[11px] text-[#61733F] italic">
              &ldquo;{config.slogan}&rdquo;
            </p>
          </div>

          <div className="pt-2 border-t border-[#C8E6C9]/60">
            <p className="text-[11px] uppercase tracking-wider text-[#61733F] font-semibold">
              Kính gửi Quý Thầy/Cô & Khách quý
            </p>
            <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#006C3A] pt-0.5 leading-relaxed overflow-visible">
              {guest.full_name}
            </h3>
            <span className="inline-block mt-1 text-xs text-[#006C3A] font-semibold bg-[#E1EEDD] px-3 py-0.5 rounded-full border border-[#C8E6C9]">
              Xác nhận tham dự: {guest.attendees_count > 0 ? `${guest.attendees_count} người` : 'Có tham gia'}
            </span>
          </div>
        </div>

        {/* ĐƯỜNG XÉ VÉ (Dashed Tear Line nối giữa 2 khuyết tròn) */}
        <div className="relative px-5 py-1 z-10">
          <div className="border-t-2 border-dashed border-[#C8E6C9]" />
        </div>

        {/* PHẦN DƯỚI VÉ: Thời gian, Địa điểm & Lời nhắn */}
        <div className="p-6 pt-4 text-center space-y-3 relative z-10 bg-[#FFFDF9]/90">
          <div className="space-y-1.5 text-xs text-[#3E3836]">
            <div className="flex items-center justify-center gap-1.5 font-semibold text-[#006C3A]">
              <Calendar className="w-3.5 h-3.5 text-[#006C3A]" />
              <span>{displayTime}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#61733F] max-w-xs mx-auto">
              <MapPin className="w-3.5 h-3.5 text-[#006C3A] shrink-0" />
              <span>
                {config.venueHall ? `${config.venueHall} — ` : ''}{config.venueName} ({config.venueAddress})
              </span>
            </div>
          </div>

          {/* Lời nhắn của khách (CHỈ hiển thị khi có note thực tế, tuyệt đối KHÔNG hiện phone/email, ẩn hoàn toàn nếu rỗng) */}
          {Boolean(note) && (
            <div className="bg-[#E1EEDD]/60 p-2.5 rounded-xl border border-[#C8E6C9] text-xs">
              <span className="text-[10px] uppercase font-bold text-[#006C3A] block">
                Đôi lời gửi gắm đến BTC:
              </span>
              <p className="font-handwriting text-base text-[#006C3A] italic leading-relaxed">
                &ldquo;{note}&rdquo;
              </p>
            </div>
          )}

          {/* Gợi ý chụp màn hình */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-[#61733F] italic">
            <Camera className="w-3.5 h-3.5 text-[#006C3A]" />
            <span>Chụp màn hình để lưu giữ tấm vé kỷ niệm này</span>
          </div>
        </div>
      </div>

      {/* Nút chỉnh sửa phản hồi bên dưới thẻ vé */}
      <div className="pt-3 text-center">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006C3A] hover:underline cursor-pointer min-h-[44px] px-3 py-1.5"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Chỉnh sửa thông tin xác nhận</span>
        </button>
      </div>
    </motion.div>
  );
}
