'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Sparkles, Camera, Edit3 } from 'lucide-react';
import type { GuestRecord } from '@/types/guest';
import type { EventConfig } from '@/config/event';

interface MiniTicketProps {
  guest: GuestRecord;
  config: EventConfig;
  logoUrl?: string | null;
  onEdit: () => void;
}

export function MiniTicket({ guest, config, logoUrl, onEdit }: MiniTicketProps) {
  const logoSrc = logoUrl || '/images/default-logo.png';
  const displayTime = `${config.startTime || '16:30'} • ${config.eventDateLabel || '30/11/2026'}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-sm sm:max-w-md mx-auto relative font-sans-ui"
    >
      {/* Thẻ vé kỷ niệm */}
      <div className="relative bg-[#FFFDFD] rounded-2xl border border-[#F3C6D6] shadow-[0_20px_50px_-15px_rgba(216,92,138,0.22)] overflow-hidden">
        {/* Viền đôi trang trí nhẹ phía trong */}
        <div className="absolute inset-2 border border-[#F3C6D6]/40 rounded-xl pointer-events-none" />

        {/* Khuyết tròn xé vé bên trái */}
        <div
          className="absolute -left-3.5 top-[58%] -translate-y-1/2 w-7 h-7 rounded-full bg-[#FFF5F8] border border-[#F3C6D6] shadow-inner z-20"
          aria-hidden="true"
        />
        {/* Khuyết tròn xé vé bên phải */}
        <div
          className="absolute -right-3.5 top-[58%] -translate-y-1/2 w-7 h-7 rounded-full bg-[#FFF5F8] border border-[#F3C6D6] shadow-inner z-20"
          aria-hidden="true"
        />

        {/* PHẦN TRÊN VÉ: Header, Logo, Tên sự kiện & Tên khách mời */}
        <div className="p-6 sm:p-7 text-center space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5F8] border border-[#F6C1D3] text-[10px] sm:text-xs uppercase tracking-widest text-[#D85C8A] font-bold">
            <Sparkles className="w-3 h-3 text-[#D85C8A]" />
            <span>Vé Kỷ Niệm Tham Dự</span>
            <Sparkles className="w-3 h-3 text-[#D85C8A]" />
          </div>

          {/* Logo sự kiện */}
          <div className="w-14 h-14 mx-auto flex items-center justify-center shrink-0">
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
            <h4 className="font-serif-title text-base sm:text-lg font-bold text-[#5C1F38] text-balance">
              {config.eventName}
            </h4>
            <p className="text-[11px] text-[#7D6670] italic">
              &ldquo;{config.slogan}&rdquo;
            </p>
          </div>

          <div className="pt-2 border-t border-[#F3C6D6]/40">
            <p className="text-[11px] uppercase tracking-wider text-[#7D6670] font-semibold">
              Kính gửi Quý khách
            </p>
            <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#D85C8A] pt-0.5 leading-relaxed overflow-visible">
              {guest.full_name}
            </h3>
            <span className="inline-block mt-1 text-xs text-[#5C1F38] font-semibold bg-[#FFF5F8] px-2.5 py-0.5 rounded-full border border-[#F3C6D6]">
              Xác nhận tham dự: {guest.attendees_count > 0 ? `${guest.attendees_count} người` : '1 người'}
            </span>
          </div>
        </div>

        {/* ĐƯỜNG XÉ VÉ (Dashed Tear Line nối giữa 2 khuyết tròn) */}
        <div className="relative px-5 py-1 z-10">
          <div className="border-t-2 border-dashed border-[#F3C6D6]" />
        </div>

        {/* PHẦN DƯỚI VÉ: Thời gian, Địa điểm & Lời nhắn */}
        <div className="p-6 pt-4 text-center space-y-3 relative z-10 bg-[#FFFDFD]/80">
          <div className="space-y-1.5 text-xs text-[#4A3B42]">
            <div className="flex items-center justify-center gap-1.5 font-semibold text-[#5C1F38]">
              <Calendar className="w-3.5 h-3.5 text-[#D85C8A]" />
              <span>{displayTime}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7D6670] max-w-xs mx-auto">
              <MapPin className="w-3.5 h-3.5 text-[#D85C8A] shrink-0" />
              <span className="truncate">{config.venueName} — {config.venueAddress}</span>
            </div>
          </div>

          {/* Lời nhắn của khách (nếu có) */}
          {guest.song_request && (
            <div className="bg-[#FFF5F8] p-2.5 rounded-xl border border-[#F3C6D6] text-xs">
              <span className="text-[10px] uppercase font-bold text-[#D85C8A] block">
                Lời nhắn của bạn:
              </span>
              <p className="font-handwriting text-base text-[#5C1F38] italic leading-relaxed">
                &ldquo;{guest.song_request}&rdquo;
              </p>
            </div>
          )}

          {/* Gợi ý chụp màn hình */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-[#7D6670] italic">
            <Camera className="w-3.5 h-3.5 text-[#D85C8A]" />
            <span>Chụp màn hình để lưu giữ tấm vé kỷ niệm của bạn</span>
          </div>
        </div>
      </div>

      {/* Nút chỉnh sửa phản hồi bên dưới thẻ vé */}
      <div className="pt-3 text-center">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D85C8A] hover:underline cursor-pointer min-h-[44px] px-3 py-1.5"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Chỉnh sửa phản hồi</span>
        </button>
      </div>
    </motion.div>
  );
}
