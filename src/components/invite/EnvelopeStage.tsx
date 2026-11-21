'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import type { GuestRecord } from '@/types/guest';
import type { EventConfig } from '@/config/event';
import { LilyFlowerIcon } from '@/components/icons/LilyFlowerIcon';

interface EnvelopeStageProps {
  guest: GuestRecord;
  config: EventConfig;
  isOpened: boolean;
  onOpen: () => void;
  logoUrl?: string | null;
  waxSealUrl?: string | null;
}

/**
 * Biểu tượng Hoa Ly (Lily flower) trên con dấu sáp:
 * Ưu tiên hiển thị ảnh /images/lily-seal.png, nếu chưa có hoặc lỗi sẽ hiển thị component SVG Hoa Ly tinh tế.
 */
function LilySealSymbol() {
  const [hasImgError, setHasImgError] = useState(false);

  if (!hasImgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/images/lily-seal.png"
        alt="Hoa Ly"
        className="w-7 h-7 object-contain drop-shadow-sm relative z-10 select-none pointer-events-none"
        onError={() => setHasImgError(true)}
      />
    );
  }

  return <LilyFlowerIcon className="w-7 h-7 text-white drop-shadow-sm relative z-10" />;
}

/**
 * Logo sự kiện động hiển thị trên lá thư bên trong phong bì:
 * Hiển thị trực tiếp ảnh PNG tách nền, không khung viền hay nền trắng, kèm drop-shadow-sm.
 */
function EnvelopeLetterLogo({ logoUrl }: { logoUrl?: string | null }) {
  const [hasError, setHasError] = useState(false);
  const src = logoUrl || '/images/default-logo.png';

  if (hasError) return null;

  return (
    <div className="w-12 h-12 flex items-center justify-center mb-1 shrink-0 bg-transparent border-0 shadow-none p-0">
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

export function EnvelopeStage({
  guest,
  config,
  isOpened,
  onOpen,
  logoUrl,
  waxSealUrl,
}: EnvelopeStageProps) {
  const [sealImgError, setSealImgError] = useState(false);
  const greeting = config.envelopeGreeting || 'Trân trọng kính mời';
  const hintText = config.sealHintText || 'Chạm vào con dấu hoa ly để mở thiệp';

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center p-4 min-h-[100dvh] h-[100dvh] overflow-hidden bg-[#FFF5F8]/95 transition-opacity duration-700 ease-luxury ${
        isOpened ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      style={{
        paddingTop: 'env(safe-area-inset-top, 16px)',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      }}
    >
      {/* Họa tiết hoa ly mờ trang trí nền phong bì */}
      <div className="absolute top-8 left-8 text-[#F6C1D3]/25 pointer-events-none select-none">
        <LilyFlowerIcon className="w-24 h-24 -rotate-12" />
      </div>
      <div className="absolute bottom-10 right-8 text-[#F6C1D3]/25 pointer-events-none select-none">
        <LilyFlowerIcon className="w-28 h-28 rotate-12" />
      </div>

      {/* Khung phong bì sang trọng tông Hồng & Trắng */}
      <div className="relative w-full max-w-[340px] sm:max-w-[370px] flex flex-col items-center">
        {/* Lời đề tặng trên phong bì */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 text-center space-y-1.5 px-2"
        >
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-[#7D6670] font-semibold">
            <Sparkles className="w-3 h-3 text-[#D85C8A]" />
            <span>{greeting}</span>
            <Sparkles className="w-3 h-3 text-[#D85C8A]" />
          </div>

          <h1 className="font-script text-3xl sm:text-4xl text-[#5C1F38] font-bold px-2 truncate max-w-[330px] drop-shadow-xs">
            {guest.full_name}
          </h1>

          <p className="text-[11px] text-[#7D6670] italic max-w-xs mx-auto truncate">
            {config.eventName}
          </p>
        </motion.div>

        {/* Thân phong bì vật lý 3D màu hồng cánh sen thanh lịch phối viền hồng pastel */}
        <div
          className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[#F6C1D3] shadow-2xl"
          style={{
            backgroundColor: '#D85C8A',
            perspective: '1200px',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Đường viền chỉ trắng & hồng pastel tinh xảo */}
          <div className="absolute inset-1.5 rounded-xl border border-white/40 pointer-events-none z-30" />
          <div className="absolute inset-2.5 rounded-lg border border-[#F6C1D3]/40 pointer-events-none z-30" />

          {/* Nắp phong bì (Flap) 3D */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1/2 z-20 origin-top will-change-transform shadow-md"
            style={{
              backgroundColor: '#C44D78',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            }}
            animate={
              isOpened
                ? {
                    rotateX: -180,
                    opacity: [1, 1, 0.4, 0],
                  }
                : { rotateX: 0, opacity: 1 }
            }
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Thân túi phong bì (Bottom Pocket) */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              backgroundColor: '#D85C8A',
              clipPath: 'polygon(0 0, 50% 50%, 100% 0, 100% 100%, 0 100%)',
              opacity: 0.98,
            }}
          />

          {/* Lá thư bên trong phong bì trượt lên thanh thoát */}
          <motion.div
            className="absolute inset-x-4 inset-y-3 bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center z-0 border border-[#F6C1D3]"
            initial={{ y: 24, opacity: 0.7 }}
            animate={isOpened ? { y: -45, opacity: 1 } : { y: 24, opacity: 0.7 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <EnvelopeLetterLogo logoUrl={logoUrl} />
            <p className="font-serif text-sm font-bold text-[#5C1F38] truncate max-w-[240px]">
              {config.eventName}
            </p>
            <p className="text-[11px] text-[#D85C8A] italic mt-0.5 font-script text-base">
              {config.slogan}
            </p>
          </motion.div>

          {/* Con dấu sáp niêm phong */}
          {!isOpened && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-auto">
              {waxSealUrl && !sealImgError ? (
                /* 1. Trường hợp người dùng đã upload ảnh con dấu sáp động */
                <motion.button
                  type="button"
                  onClick={onOpen}
                  aria-label={hintText}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center cursor-pointer active:scale-[0.94] transition-transform duration-200 min-h-[44px] min-w-[44px] focus:outline-none"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={waxSealUrl}
                    alt="Con dấu sáp"
                    className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none"
                    onError={() => setSealImgError(true)}
                  />
                </motion.button>
              ) : (
                /* 2. Trường hợp con dấu sáp mặc định (Hoa Ly tông ngọc trai/vàng hồng) */
                <motion.button
                  type="button"
                  onClick={onOpen}
                  aria-label={hintText}
                  className="wax-seal-btn relative w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center cursor-pointer border-2 border-white/80 active:scale-[0.94] transition-transform duration-200 min-h-[44px] min-w-[44px]"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #FCE4EC 28%, #F8BBD0 65%, #D85C8A 100%)',
                  }}
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 8px 24px rgba(216, 92, 138, 0.35)',
                      '0 12px 28px rgba(216, 92, 138, 0.55)',
                      '0 8px 24px rgba(216, 92, 138, 0.35)',
                    ],
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <div className="w-12 h-12 rounded-full border border-white/50 flex items-center justify-center shadow-inner relative overflow-hidden bg-white/20 backdrop-blur-[1px]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-900/10 via-transparent to-white/40" />
                    <LilySealSymbol />
                  </div>
                </motion.button>
              )}
            </div>
          )}
        </div>

        {/* Lời nhắc chạm vào con dấu hoa ly */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-5 text-xs text-[#7D6670] font-medium flex items-center gap-1.5 animate-pulse select-none"
        >
          <span>✨</span>
          <span>{hintText}</span>
          <span>✨</span>
        </motion.p>
      </div>
    </div>
  );
}
