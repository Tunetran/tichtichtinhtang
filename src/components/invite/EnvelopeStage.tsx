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
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-between py-6 sm:py-8 px-4 min-h-[100dvh] h-[100dvh] overflow-hidden select-none"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)',
      }}
    >
      {/* NỀN PHONG CẢNH HỒ SEN & RẶNG TRE NGUYÊN BẢN (KHÔNG BỊ MỜ HAY BẠC MÀU) */}
      <div className="absolute inset-0 -z-10 pointer-events-none select-none overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/bg-bamboo-lotus.png"
          alt="Nền Tịch Tịch Tình Tang"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* HEADER: Tiêu đề đón nhận thư "BẠN NHẬN ĐƯỢC MỘT LÁ THƯ TỪ" (Chuẩn thiết kế 100%) */}
      <motion.div
        animate={
          stage === 'opening'
            ? { opacity: 0, y: -24 }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[340px] sm:max-w-[420px] pt-1 sm:pt-4 flex justify-center z-10"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/header-text.png"
          alt="BẠN NHẬN ĐƯỢC MỘT LÁ THƯ TỪ"
          className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-xs"
        />
        <h1 className="sr-only">BẠN NHẬN ĐƯỢC MỘT LÁ THƯ TỪ</h1>
      </motion.div>

      {/* PHONG BÌ 3D HỒNG REN TRẮNG & CON DẤU NGỌC TRAI THE LIGHT */}
      <motion.div
        className="relative w-[86%] sm:w-[78%] max-w-[340px] sm:max-w-[380px] aspect-[1492/1080] [perspective:1200px] my-auto flex items-center justify-center"
        animate={
          stage === 'opening'
            ? {
              y: [0, 0, 90],
              opacity: [1, 1, 0],
            }
            : { y: 0, opacity: 1 }
        }
        transition={
          stage === 'opening'
            ? {
              duration: 1.4,
              times: [0, 0.75, 1],
              ease: 'easeInOut',
            }
            : { duration: 0.3 }
        }
      >
        {/* Khung thân phong bì */}
        <div
          className="relative w-full h-full rounded-2xl [perspective:1200px]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Lòng phong bì (Back Panel bên trong phong bì) */}
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
                ? { delay: 0.38, duration: 0.9, ease: [0.22, 1, 0.36, 1] }
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
            <p className="font-serif text-xs sm:text-sm font-semibold text-[#006C3A] tracking-widest uppercase">
              THƯ MỜI
            </p>
            <p className="font-serif-title text-base sm:text-lg font-bold text-[#2D4A22] truncate max-w-[240px] mt-0.5">
              {guest.full_name}
            </p>
            <p className="text-xs text-[#61733F] italic mt-0.5 line-clamp-1">
              {config.eventName}
            </p>
          </motion.div>

          {/* TÚI MẶT TRƯỚC PHONG BÌ (Front Pocket với đường gấp và viền chuẩn) */}
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

            {/* Mặt sau nắp khi lật ngược: Lớp giấy hồng mềm mại */}
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

      {/* FOOTER: Typography Logo "Tịch Tịch Tình Tang" (Chuẩn thiết kế 100%) */}
      <motion.div
        animate={
          stage === 'opening'
            ? { opacity: 0, y: 24 }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[240px] sm:max-w-[280px] pb-2 sm:pb-4 z-10 flex flex-col items-center select-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl || '/images/logo-tichtichtinhtang.png'}
          alt="Tịch Tịch Tình Tang"
          className="w-full h-auto object-contain drop-shadow-md pointer-events-none"
        />
      </motion.div>
    </div>
  );
}
