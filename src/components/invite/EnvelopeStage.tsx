'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import type { GuestRecord } from '@/types/guest';
import type { EventConfig } from '@/config/event';
import { LilyFlowerIcon } from '@/components/icons/LilyFlowerIcon';

export type InviteStage = 'closed' | 'opening' | 'reading';

interface EnvelopeStageProps {
  guest: GuestRecord;
  config: EventConfig;
  stage: InviteStage;
  onOpen: () => void;
  logoUrl?: string | null;
  waxSealUrl?: string | null;
}

/**
 * Biểu tượng Hoa Ly (Lily flower) trên con dấu sáp mặc định
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
  stage,
  onOpen,
  logoUrl,
  waxSealUrl,
}: EnvelopeStageProps) {
  const [sealImgError, setSealImgError] = useState(false);
  const [isFlapBehind, setIsFlapBehind] = useState(false);

  const greeting = config.envelopeGreeting || 'Trân trọng kính mời';
  const hintText = config.sealHintText || 'Chạm vào con dấu hoa ly để mở thiệp';

  // Nhịp 1: Sau nửa chu kỳ mở nắp (~0.275s của 0.55s), hạ z-index nắp ra sau lá thư
  useEffect(() => {
    if (stage === 'opening') {
      const timer = setTimeout(() => {
        setIsFlapBehind(true);
      }, 275);
      return () => clearTimeout(timer);
    } else {
      setIsFlapBehind(false);
    }
  }, [stage]);

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center p-4 min-h-[100dvh] h-[100dvh] overflow-hidden bg-[#FFF5F8]/95 select-none"
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

      {/* Khung bao phong bì 3D với perspective 1200px */}
      <motion.div
        className="relative w-full max-w-[340px] sm:max-w-[370px] flex flex-col items-center [perspective:1200px]"
        animate={
          stage === 'opening'
            ? {
              y: [0, 0, 80],
              opacity: [1, 1, 0],
            }
            : { y: 0, opacity: 1 }
        }
        transition={
          stage === 'opening'
            ? {
              duration: 1.4,
              times: [0, 0.75, 1], // Giữ vị trí trong 1.05s đầu, sau đó trượt xuống và mờ dần trong 1.05s -> 1.4s
              ease: 'easeInOut',
            }
            : { duration: 0.3 }
        }
      >
        {/* Lời đề tặng trên phong bì */}
        <motion.div
          animate={
            stage === 'opening'
              ? { opacity: 0, y: -12 }
              : { opacity: 1, y: 0 }
          }
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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

        {/* Thân phong bì vật lý 3D chiều sâu thật */}
        <div
          className="relative w-full aspect-[4/3] rounded-2xl border border-[#F6C1D3] shadow-2xl [perspective:1200px]"
          style={{
            backgroundColor: '#D85C8A',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Lớp nền sau phong bì (Back Panel) */}
          <div className="absolute inset-0 bg-[#D85C8A] rounded-2xl z-0" />
          <div className="absolute inset-1.5 rounded-xl border border-white/30 pointer-events-none z-0" />

          {/* NHỊP 2: Tờ thư kẹp giữa lớp mặt sau và túi mặt trước trượt lên cao (0.45s → 1.35s) */}
          <motion.div
            className="absolute inset-x-4 top-4 h-[80%] bg-[#FFFDFD] rounded-xl shadow-xl p-4 flex flex-col items-center justify-center text-center border border-[#F3C6D6]/80 overflow-hidden"
            style={{ zIndex: 15 }}
            initial={{ y: 15, scale: 0.9, opacity: 0 }}
            animate={
              stage === 'opening'
                ? { y: -120, scale: 0.96, opacity: 1 }
                : { y: 15, scale: 0.9, opacity: 0 }
            }
            transition={
              stage === 'opening'
                ? { delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }
                : { duration: 0.25 }
            }
          >
            <div className="absolute inset-1.5 border border-[#F3C6D6]/60 rounded-lg pointer-events-none" />
            <EnvelopeLetterLogo logoUrl={logoUrl} />
            <p className="font-serif text-sm font-bold text-[#5C1F38] truncate max-w-[240px]">
              {config.eventName}
            </p>
            <p className="text-[11px] text-[#D85C8A] italic mt-0.5 font-script text-base">
              {config.slogan}
            </p>
          </motion.div>

          {/* Túi mặt trước phong bì (Front Pocket) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: '#D85C8A',
              clipPath: 'polygon(0 0, 50% 50%, 100% 0, 100% 100%, 0 100%)',
              zIndex: 25,
            }}
          >
            <div className="absolute inset-1.5 rounded-xl border border-white/20 pointer-events-none" />
          </div>

          {/* NHỊP 1: Nắp phong bì (Flap) lật mở 3D (0s → 0.55s) */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[53%] origin-top will-change-transform shadow-md pointer-events-none"
            style={{
              backgroundColor: '#C44D78',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              transformOrigin: 'top',
              backfaceVisibility: 'visible',
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
          />

          {/* Con dấu sáp niêm phong (nhỏ dần & mờ đi khi mở) */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-auto"
            style={{ zIndex: 40 }}
          >
            {waxSealUrl && !sealImgError ? (
              /* Con dấu sáp upload động */
              <motion.button
                type="button"
                onClick={onOpen}
                disabled={stage !== 'closed'}
                aria-label={hintText}
                className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center cursor-pointer active:scale-[0.94] transition-transform duration-200 min-h-[44px] min-w-[44px] focus:outline-none"
                animate={
                  stage === 'opening'
                    ? { scale: 0.8, opacity: 0 }
                    : { scale: [1, 1.05, 1] }
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={waxSealUrl}
                  alt="Con dấu sáp"
                  className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none"
                  onError={() => setSealImgError(true)}
                />
              </motion.button>
            ) : (
              /* Con dấu sáp Hoa Ly mặc định */
              <motion.button
                type="button"
                onClick={onOpen}
                disabled={stage !== 'closed'}
                aria-label={hintText}
                className="wax-seal-btn relative w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center cursor-pointer border-2 border-white/80 active:scale-[0.94] transition-transform duration-200 min-h-[44px] min-w-[44px]"
                style={{
                  background:
                    'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #FCE4EC 28%, #F8BBD0 65%, #D85C8A 100%)',
                }}
                animate={
                  stage === 'opening'
                    ? { scale: 0.8, opacity: 0 }
                    : {
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        '0 8px 24px rgba(216, 92, 138, 0.35)',
                        '0 12px 28px rgba(216, 92, 138, 0.55)',
                        '0 8px 24px rgba(216, 92, 138, 0.35)',
                      ],
                    }
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
                <div className="w-12 h-12 rounded-full border border-white/50 flex items-center justify-center shadow-inner relative overflow-hidden bg-white/20 backdrop-blur-[1px]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-rose-900/10 via-transparent to-white/40" />
                  <LilySealSymbol />
                </div>
              </motion.button>
            )}
          </div>
        </div>

        {/* Lời nhắc chạm vào con dấu */}
        <motion.p
          animate={
            stage === 'opening'
              ? { opacity: 0, y: 8 }
              : { opacity: 1, y: 0 }
          }
          transition={{ duration: 0.3 }}
          className="mt-5 text-xs text-[#7D6670] font-medium flex items-center gap-1.5 animate-pulse select-none"
        >
          <span>✨</span>
          <span>{hintText}</span>
          <span>✨</span>
        </motion.p>
      </motion.div>
    </div>
  );
}
