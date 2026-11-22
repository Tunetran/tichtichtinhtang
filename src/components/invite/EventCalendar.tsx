'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

const WEEKDAYS = [
  { short: 'T2', full: 'THỨ HAI' },
  { short: 'T3', full: 'THỨ BA' },
  { short: 'T4', full: 'THỨ TƯ' },
  { short: 'T5', full: 'THỨ NĂM' },
  { short: 'T6', full: 'THỨ SÁU' },
  { short: 'T7', full: 'THỨ BẢY' },
  { short: 'CN', full: 'CHỦ NHẬT' },
];

export function EventCalendar() {
  // Tháng 12/2026:
  // Ngày 01/12/2026 là Thứ Ba (T3).
  // Ô trống đầu tháng: 1 ô (Thứ Hai 30/11)
  // Ngày 31/12/2026 là Thứ Năm (T5).
  // Ô trống cuối tháng: 3 ô (T6, T7, CN)
  // Tổng cộng: 1 + 31 + 3 = 35 ô (5 tuần x 7 ngày)
  const emptyBefore = 1;
  const daysInMonth = 31;
  const emptyAfter = 3;

  return (
    <div className="w-full max-w-[640px] mx-auto rounded-2xl overflow-hidden border border-[#F39BB3] shadow-sm bg-white font-sans-ui select-none">
      {/* 1. Dải tiêu đề Tháng 12 / 2026 */}
      <div className="bg-[#FFF5F8] border-b border-[#F8C5D4] py-2.5 sm:py-3 px-4 flex items-center justify-between">
        <span className="text-xs sm:text-sm font-bold text-[#E15B7E] tracking-widest font-serif-title uppercase">
          THÁNG 12 / 2026
        </span>
        <span className="text-[10px] sm:text-xs font-semibold text-[#006C3A] bg-[#E1EEDD] px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
          Sự Kiện: Thứ Bảy 05.12
        </span>
      </div>

      {/* 2. Thanh tiêu đề các thứ (T2 -> CN / THỨ HAI -> CHỦ NHẬT) */}
      <div className="grid grid-cols-7 bg-[#F78DA7] text-white">
        {WEEKDAYS.map((day, idx) => (
          <div
            key={idx}
            className="py-2.5 sm:py-3 text-center text-[11px] sm:text-xs font-bold tracking-wider font-sans-ui"
          >
            <span className="sm:hidden">{day.short}</span>
            <span className="hidden sm:inline">{day.full}</span>
          </div>
        ))}
      </div>

      {/* 3. Lưới các ngày trong tháng (Lưới 7 cột với viền hồng pastel mảnh #F8C5D4) */}
      <div className="grid grid-cols-7 gap-[1px] bg-[#F8C5D4] p-[1px]">
        {/* Các ô trống đầu tháng (Thứ Hai): nền hồng phấn nhạt #FFE4EC */}
        {Array.from({ length: emptyBefore }).map((_, idx) => (
          <div
            key={`empty-before-${idx}`}
            className="bg-[#FFE4EC] min-h-[54px] sm:min-h-[66px]"
            aria-hidden="true"
          />
        ))}

        {/* Các ngày từ 1 đến 31 */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const isEventDay = day === 5;
          // Cột trong tuần: (emptyBefore + idx) % 7
          // 0: T2, 1: T3, 2: T4, 3: T5, 4: T6, 5: T7, 6: CN
          const dayOfWeekCol = (emptyBefore + idx) % 7;
          const isSaturday = dayOfWeekCol === 5;
          const isSunday = dayOfWeekCol === 6;

          // Ô đặc biệt: Ngày 05/12 (Thứ Bảy)
          if (isEventDay) {
            return (
              <div
                key={day}
                className="relative bg-[#FFF3F6] flex flex-col items-center justify-center min-h-[54px] sm:min-h-[66px] p-1 overflow-hidden"
              >
                {/* Trái tim nổi khối 3D đập nhẹ nhàng ngay chính giữa ô */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                >
                  <Heart className="w-9 h-9 sm:w-11 sm:h-11 text-[#E15B7E] fill-[#E15B7E]/30 drop-shadow-xs" />
                </motion.div>

                {/* Số 5 hiển thị rõ ràng chính giữa ô */}
                <span className="relative z-20 font-serif-title text-base sm:text-lg font-extrabold text-[#D13B63] drop-shadow-2xs">
                  5
                </span>
                <span className="relative z-20 text-[8px] sm:text-[9px] font-bold text-[#006C3A] uppercase tracking-tighter sm:tracking-wider leading-none mt-0.5">
                  Đêm Diễn
                </span>
              </div>
            );
          }

          // Màu số ngày: Thứ 2 - Thứ 6 (#1F2937), Thứ 7 (#E88AA6), Chủ Nhật (#006C3A)
          const numberColor = isSunday
            ? 'text-[#006C3A]'
            : isSaturday
            ? 'text-[#E88AA6]'
            : 'text-[#1F2937]';

          return (
            <div
              key={day}
              className="bg-white hover:bg-[#FFFDF9] transition-colors flex flex-col items-center justify-center min-h-[54px] sm:min-h-[66px] p-1"
            >
              <span className={`text-xs sm:text-sm font-semibold ${numberColor}`}>
                {day}
              </span>
            </div>
          );
        })}

        {/* Các ô trống cuối tháng: nền hồng phấn nhạt #FFE4EC */}
        {Array.from({ length: emptyAfter }).map((_, idx) => (
          <div
            key={`empty-after-${idx}`}
            className="bg-[#FFE4EC] min-h-[54px] sm:min-h-[66px]"
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
