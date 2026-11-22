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
  // Lớp 4 (Nắp phong bì): z-40 khi đóng -> chuyển sang z-15 ngay ở mốc nửa hành trình lật mở (~440ms)
  const [isFlapBehind, setIsFlapBehind] = useState(false);
  const sealSrc = waxSealUrl || '/images/wax-seal-combined.png';
  const showLogoSrc = logoUrl || '/images/logo-tichtichtinhtang.png';

  useEffect(() => {
    if (stage === 'opening') {
      // Nhịp 2: Nắp lật từ 0.15s -> 0.75s (0.6s). Ở mốc nửa hành trình (90 độ, ~440ms), hạ z-index ra sau tờ thư
      const timer = setTimeout(() => {
        setIsFlapBehind(true);
      }, 440);
      return () => clearTimeout(timer);
    } else {
      setIsFlapBehind(false);
    }
  }, [stage]);

  const handleEnvelopeClick = () => {
    if (stage === 'closed') {
      onOpen();
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center px-4 select-none relative z-30 overflow-hidden">
      <div className="w-full max-w-[420px] flex flex-col items-center justify-center my-auto space-y-4 sm:space-y-6">
        {/* ========================================================
            TIÊU ĐỀ ĐẦU TRANG: "BẠN NHẬN ĐƯỢC MỘT LÁ THƯ TỪ"
            Nhịp 1 (0s -> 0.25s): scale nhẹ và mờ dần khi chạm mở
           ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={
            stage === 'opening'
              ? { opacity: 0, y: -15, scale: 0.96, transition: { duration: 0.25, ease: 'easeOut' } }
              : { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
          }
          className="w-full text-center shrink-0"
        >
          <p className="font-serif-title text-sm sm:text-base md:text-lg font-bold tracking-[0.2em] sm:tracking-[0.25em] text-[#4A5835] uppercase select-none">
            {config.envelopeGreeting || 'BẠN NHẬN ĐƯỢC MỘT LÁ THƯ TỪ'}
          </p>
        </motion.div>

        {/* ========================================================
            KHUNG PHONG BÌ 3D CHUẨN 5 LỚP (Tỷ lệ w-[320px] sm:w-[380px] aspect-[4/2.7])
            Nhịp 3 (0.65s -> 1.35s): Thân phong bì trượt nhẹ xuống 70px và mờ dần
           ======================================================== */}
        <motion.div
          className="relative w-[320px] sm:w-[380px] max-w-[calc(100vw-32px)] aspect-[4/2.7] [perspective:1200px] flex items-center justify-center cursor-pointer shrink-0 will-change-transform"
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={
            stage === 'opening'
              ? {
                  y: [0, 0, 70],
                  opacity: [1, 1, 0],
                  transition: {
                    duration: 1.35,
                    times: [0, 0.48, 1], // Giữ nguyên đến ~0.65s rồi trượt xuống 70px và mờ dần
                    ease: [0.4, 0, 0.2, 1],
                  },
                }
              : { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] } }
          }
          onClick={handleEnvelopeClick}
        >
          {/* Vỏ bao 3D duy trì không gian chiều sâu */}
          <div
            className="relative w-full h-full rounded-2xl [perspective:1200px]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* ----------------------------------------------------
                LỚP 1 (z-10): MẶT SAU LÒNG PHONG BÌ
                Màu đậm hơn mặt ngoài một tông nhẹ tạo chiều sâu bóng đổ
               ---------------------------------------------------- */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden shadow-inner pointer-events-none"
              style={{
                zIndex: 10,
                backgroundColor: '#EAA0B0',
                backgroundImage: 'linear-gradient(180deg, #DE8B9D 0%, #EAA0B0 35%, #F4B8C5 100%)',
                boxShadow: 'inset 0 3px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              {/* Bóng đổ từ nắp trên hắt sâu vào trong lòng phong bì */}
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/20 via-black/5 to-transparent pointer-events-none" />
            </div>

            {/* ----------------------------------------------------
                LỚP 2 (z-20): TỜ THƯ NẰM LỌT BÊN TRONG LÒNG PHONG BÌ
                Nhịp 3 (0.60s -> 1.30s): Trượt cao lên khỏi miệng (y: 0 -> -110, scale: 0.95 -> 1.04)
               ---------------------------------------------------- */}
            <motion.div
              className="absolute inset-x-3.5 sm:inset-x-4 top-2.5 sm:top-3 h-[90%] bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5EFE0] rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center text-center border border-[#D5E5C9] overflow-hidden will-change-transform"
              style={{
                zIndex: 20,
                boxShadow:
                  stage === 'opening'
                    ? '0 25px 40px -10px rgba(0, 0, 0, 0.28), 0 2px 5px rgba(0,0,0,0.1)'
                    : '0 4px 12px rgba(0, 0, 0, 0.08)',
              }}
              initial={{ y: 0, scale: 0.95, opacity: 1 }}
              animate={
                stage === 'opening'
                  ? {
                      y: [0, 0, -110],
                      scale: [0.95, 0.95, 1.04],
                      transition: {
                        duration: 1.3,
                        times: [0, 0.45, 1], // Nhịp 3: bắt đầu trượt từ 0.60s đến 1.30s
                        ease: [0.22, 1, 0.36, 1],
                      },
                    }
                  : { y: 0, scale: 0.95, opacity: 1 }
              }
            >
              {/* Viền chỉ thanh nhã bao quanh tờ thư */}
              <div className="absolute inset-1.5 border border-[#61733F]/25 rounded-lg pointer-events-none" />

              {/* Logo The Light nhỏ trang trọng */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center mb-1 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-the-light.png"
                  alt="The Light"
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>

              {/* Dòng tiêu đề hé lộ khi nắp lật mở */}
              <p className="font-serif-title text-[11px] sm:text-xs font-semibold text-[#006C3A] tracking-wider uppercase">
                THƯ MỜI
              </p>
              <p className="font-serif-title text-base sm:text-lg font-bold text-[#2D4A22] truncate max-w-[240px] mt-0.5 tracking-normal">
                {guest.full_name}
              </p>
              <p className="font-sans-ui text-xs text-[#61733F] italic mt-0.5 line-clamp-1 tracking-normal">
                {config.eventName}
              </p>
            </motion.div>

            {/* ----------------------------------------------------
                LỚP 3 (z-30): TÚI MẶT TRƯỚC PHONG BÌ
                Gồm vạt trái, vạt phải và vạt đáy với viền sáng 1px & bóng đổ mềm
               ---------------------------------------------------- */}
            <div
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 30 }}
            >
              {/* Nền túi phong bì ren trắng nguyên bản */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/envelope-pocket.png"
                alt="Thân phong bì"
                className="w-full h-full object-fill pointer-events-none select-none drop-shadow-[0_8px_16px_rgba(180,120,135,0.2)]"
              />

              {/* Các đường nếp gấp tam giác hai bên & nếp gấp đáy với viền sáng 1px */}
              <svg
                viewBox="0 0 1492 1080"
                className="absolute inset-0 w-full h-full pointer-events-none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Nếp gấp vạt tam giác trái */}
                <path
                  d="M 8 6 L 746 595 L 8 1070 Z"
                  fill="rgba(255, 255, 255, 0.03)"
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth="1.5"
                />
                {/* Nếp gấp vạt tam giác phải */}
                <path
                  d="M 1484 6 L 746 595 L 1484 1070 Z"
                  fill="rgba(255, 255, 255, 0.03)"
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth="1.5"
                />
                {/* Nếp gấp vạt đáy phía trước với bóng đổ nhẹ */}
                <path
                  d="M 8 1074 L 746 545 L 1484 1074 Z"
                  fill="rgba(250, 213, 220, 0.12)"
                  stroke="rgba(255, 255, 255, 0.65)"
                  strokeWidth="1.5"
                  filter="drop-shadow(0 -3px 5px rgba(0, 0, 0, 0.06))"
                />
              </svg>
            </div>

            {/* ----------------------------------------------------
                LỚP 4 (Nắp phong bì lật mở 3D thật):
                z-40 khi đóng -> chuyển sang z-15 ở mốc 90 độ (~440ms)
                Nhịp 2 (0.15s -> 0.75s): rotateX(0deg -> -180deg)
               ---------------------------------------------------- */}
            <motion.div
              className="absolute inset-x-0 top-0 w-full h-full pointer-events-none will-change-transform"
              style={{
                transformOrigin: 'top center',
                transformStyle: 'preserve-3d',
                zIndex: isFlapBehind ? 15 : 40,
              }}
              initial={{ rotateX: 0 }}
              animate={
                stage === 'opening'
                  ? { rotateX: -180 }
                  : { rotateX: 0 }
              }
              transition={
                stage === 'opening'
                  ? {
                      duration: 0.6,
                      delay: 0.15,
                      ease: [0.4, 0, 0.2, 1], // Đường cong chuẩn mượt của Nhịp 2
                    }
                  : { duration: 0.3 }
              }
            >
              {/* Mặt trước nắp phong bì: Họa tiết ren trắng nguyên bản */}
              <div
                className="absolute inset-0 w-full h-full"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/envelope-flap.png"
                  alt="Nắp phong bì"
                  className="w-full h-full object-fill pointer-events-none select-none"
                />
              </div>

              {/* Mặt sau nắp khi lật ngược 180 độ: Lớp giấy hồng mềm mại không đè tờ thư */}
              <div
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor: '#FDD5DC',
                    backgroundImage: 'linear-gradient(180deg, #F8CAD4 0%, #FEE5EB 50%, #FAF0F2 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 61.11%)',
                    boxShadow: 'inset 0 3px 6px rgba(0, 0, 0, 0.05)',
                  }}
                />
              </div>
            </motion.div>

            {/* ----------------------------------------------------
                LỚP 5 (z-50): CON DẤU SÁP NGỌC TRAI THE LIGHT
                Nhịp 1 (0s -> 0.25s): scale 1.08 -> 0.85, opacity 0 khi chạm mở
               ---------------------------------------------------- */}
            <div
              className="absolute left-1/2 top-[61%] -translate-x-1/2 -translate-y-1/2 w-[34%] aspect-[1466/1430] pointer-events-auto"
              style={{ zIndex: 50 }}
            >
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnvelopeClick();
                }}
                disabled={stage !== 'closed'}
                aria-label="Chạm để mở thiệp mời"
                className="relative w-full h-full flex items-center justify-center cursor-pointer active:scale-95 hover:scale-105 transition-transform duration-200 focus:outline-none"
                animate={
                  stage === 'opening'
                    ? {
                        scale: [1, 1.08, 0.85],
                        opacity: [1, 0.85, 0],
                        y: [0, -6, 10],
                      }
                    : { scale: [1, 1.035, 1] }
                }
                transition={
                  stage === 'opening'
                    ? {
                        duration: 0.25,
                        ease: 'easeOut', // Nhịp 1: 0s -> 0.25s
                      }
                    : {
                        duration: 2.6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }
                }
              >
                {/* Con dấu sáp ngọc trai The Light */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sealSrc}
                  alt="Con dấu sáp The Light"
                  className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,108,58,0.25)] select-none pointer-events-none"
                />

                {/* Vòng hào quang sáng nhẹ xung quanh con dấu mời chạm */}
                {stage === 'closed' && (
                  <div className="absolute -inset-2 rounded-full border border-white/60 animate-ping opacity-25 pointer-events-none" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ========================================================
            LOGO SỰ KIỆN: TỊCH TỊCH TÌNH TANG (PHÍA DƯỚI PHONG BÌ)
            Nhịp 1 (0s -> 0.25s): Mờ dần khi bắt đầu mở thư
           ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={
            stage === 'opening'
              ? { opacity: 0, y: 15, transition: { duration: 0.25, ease: 'easeOut' } }
              : { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] } }
          }
          className="w-full flex flex-col items-center justify-center shrink-0"
        >
          <div className="w-[54%] sm:w-[48%] max-w-[200px] sm:max-w-[240px] aspect-square flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={showLogoSrc}
              alt={config.eventName || 'Tịch Tịch Tình Tang'}
              className="w-full h-full object-contain drop-shadow-sm select-none pointer-events-none"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
