'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import type { GuestRecord } from '@/types/guest';
import type { EventConfig } from '@/config/event';

export type InviteStage = 'closed' | 'opening' | 'reading';

interface EnvelopeStageProps {
  guest: GuestRecord;
  config: EventConfig;
  stage: InviteStage;
  onOpen: () => void;
  logoUrl?: string | null;
  waxSealUrl?: string | null;
}

export function EnvelopeStage({
  guest,
  config,
  stage,
  onOpen,
  logoUrl,
  waxSealUrl,
}: EnvelopeStageProps) {
  const [isFlapBehind, setIsFlapBehind] = useState(false);
  const sealSrc = waxSealUrl || '/images/wax-seal-combined.png';

  // Sau nửa chu kỳ mở nắp (~0.28s của 0.55s), hạ z-index nắp ra sau lá thư đang trượt lên
  useEffect(() => {
    if (stage === 'opening') {
      const timer = setTimeout(() => {
        setIsFlapBehind(true);
      }, 280);
      return () => clearTimeout(timer);
    } else {
      setIsFlapBehind(false);
    }
  }, [stage]);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center py-6 px-4 select-none relative z-30">
      {/* ========================================================
          TIÊU ĐỀ CHÀO MỪNG TRANG TRỌNG (Chữ HTML thật với font chuẩn)
         ======================================================== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={
          stage === 'opening'
            ? { opacity: 0, y: -20, transition: { duration: 0.35, ease: 'easeOut' } }
            : { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
        }
        className="w-full max-w-[420px] text-center mb-5 sm:mb-7 space-y-1.5 z-10"
      >
        {/* Dòng dẫn: Be_Vietnam_Pro (font-sans-ui) */}
        <p className="font-sans-ui text-xs sm:text-sm font-semibold tracking-[0.2em] sm:tracking-[0.25em] text-[#006C3A] uppercase">
          {config.envelopeGreeting || 'BẠN NHẬN ĐƯỢC MỘT LÁ THƯ TỪ'}
        </p>

        {/* Tên show: Playfair_Display (font-serif-title) */}
        <h1 className="font-serif-title text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#006C3A] tracking-tight">
          {config.eventName || 'Tịch Tịch Tình Tang'}
        </h1>

        {/* Câu slogan nghệ thuật */}
        {config.slogan && (
          <p className="font-serif-title text-xs sm:text-sm text-[#61733F] italic leading-relaxed tracking-normal max-w-sm mx-auto px-2 line-clamp-2">
            &ldquo;{config.slogan}&rdquo;
          </p>
        )}
      </motion.div>

      {/* ========================================================
          PHONG BÌ LÁ THƯ 3D CHÍNH GIỮA MÀN HÌNH
         ======================================================== */}
      <motion.div
        className="relative w-[90%] sm:w-[84%] max-w-[360px] sm:max-w-[420px] aspect-[1492/1080] [perspective:1200px] flex items-center justify-center z-10"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={
          stage === 'opening'
            ? {
                y: [0, 0, 70],
                opacity: [1, 1, 0],
                transition: { duration: 1.2, times: [0, 0.7, 1], ease: 'easeInOut' },
              }
            : { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] } }
        }
      >
        {/* Khung thân phong bì vật lý 3D */}
        <div
          className="relative w-full h-full rounded-2xl [perspective:1200px]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Lòng phong bì (Back Panel) */}
          <div
            className="absolute inset-1.5 rounded-2xl z-0"
            style={{ backgroundColor: '#FAD5DC' }}
          />

          {/* TỜ THƯ KẸP BÊN TRONG (Trượt lên cao khi mở phong bì) */}
          <motion.div
            className="absolute inset-x-5 top-3 h-[86%] bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5EFE0] rounded-xl shadow-xl p-4 flex flex-col items-center justify-center text-center border border-[#D5E5C9] overflow-hidden"
            style={{ zIndex: 15 }}
            initial={{ y: 15, scale: 0.92, opacity: 0 }}
            animate={
              stage === 'opening'
                ? { y: -130, scale: 0.98, opacity: 1 }
                : { y: 15, scale: 0.92, opacity: 0 }
            }
            transition={
              stage === 'opening'
                ? { delay: 0.35, duration: 0.85, ease: [0.22, 1, 0.36, 1] }
                : { duration: 0.25 }
            }
          >
            <div className="absolute inset-1.5 border border-[#61733F]/30 rounded-lg pointer-events-none" />
            <div className="w-14 h-14 flex items-center justify-center mb-1 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-the-light.png"
                alt="The Light"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <p className="font-serif-title text-xs sm:text-sm font-semibold text-[#006C3A] tracking-wider uppercase">
              THƯ MỜI
            </p>
            <p className="font-serif-title text-base sm:text-lg font-bold text-[#2D4A22] truncate max-w-[240px] mt-0.5 tracking-normal">
              {guest.full_name}
            </p>
            <p className="font-sans-ui text-xs text-[#61733F] italic mt-0.5 line-clamp-1 tracking-normal">
              {config.eventName}
            </p>
          </motion.div>

          {/* TÚI MẶT TRƯỚC PHONG BÌ (Front Pocket với đường ren và bóng đổ chuẩn) */}
          <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/envelope-pocket.png"
              alt="Thân phong bì"
              className="w-full h-full object-contain pointer-events-none select-none drop-shadow-md"
            />
          </div>

          {/* NẮP PHONG BÌ VIỀN REN TRẮNG 3D (Lật mở 180 độ lên trên) */}
          <motion.div
            className="absolute inset-x-0 top-0 w-full aspect-[1492/1080] pointer-events-none will-change-transform"
            style={{
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
              zIndex: isFlapBehind ? 5 : 35,
            }}
            initial={{ rotateX: 0 }}
            animate={
              stage === 'opening'
                ? { rotateX: -180 }
                : { rotateX: 0 }
            }
            transition={
              stage === 'opening'
                ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
                : { duration: 0.3 }
            }
          >
            {/* Mặt trước nắp: Nắp ren trắng nguyên bản */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/envelope-flap.png"
                alt="Nắp phong bì"
                className="w-full h-full object-contain pointer-events-none select-none"
              />
            </div>

            {/* Mặt sau nắp khi lật ngược 180 độ: Lớp giấy hồng mềm mại */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateX(180deg)',
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: '#FDD5DC',
                  clipPath: 'polygon(0 0, 100% 0, 50% 61.2%)',
                }}
              />
            </div>
          </motion.div>

          {/* CON DẤU SÁP NGỌC TRAI THE LIGHT (Chạm vào để mở lá thư) */}
          <div
            className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 w-[36%] aspect-[1466/1430] pointer-events-auto"
            style={{ zIndex: 40 }}
          >
            <motion.button
              type="button"
              onClick={onOpen}
              disabled={stage !== 'closed'}
              aria-label="Chạm để mở thiệp mời"
              className="relative w-full h-full flex items-center justify-center cursor-pointer active:scale-95 hover:scale-105 transition-transform duration-200 focus:outline-none"
              animate={
                stage === 'opening'
                  ? { scale: [1, 1.15, 0], opacity: [1, 1, 0] }
                  : { scale: [1, 1.04, 1] }
              }
              transition={
                stage === 'opening'
                  ? { duration: 0.35, ease: 'easeOut' }
                  : {
                      duration: 2.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
              }
            >
              {/* Con dấu sáp ngọc trai với logo The Light */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sealSrc}
                alt="Con dấu sáp The Light"
                className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,108,58,0.25)] select-none pointer-events-none"
              />

              {/* Vòng hào quang sáng nhẹ xung quanh con dấu */}
              <div className="absolute -inset-2 rounded-full border border-white/50 animate-ping opacity-25 pointer-events-none" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Gợi ý nhẹ chạm để mở thư */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={
          stage === 'opening'
            ? { opacity: 0, y: 10, transition: { duration: 0.3 } }
            : { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.4 } }
        }
        className="mt-6 text-xs sm:text-sm text-[#006C3A] font-sans-ui font-medium tracking-wide uppercase text-center"
      >
        {config.sealHintText || 'Chạm vào con dấu để mở thiệp'}
      </motion.p>
    </div>
  );
}
