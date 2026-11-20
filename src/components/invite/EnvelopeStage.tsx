'use client';

import { motion } from 'motion/react';
import { Music, Sparkles } from 'lucide-react';
import type { GuestRecord } from '@/types/guest';
import type { EventConfig } from '@/config/event';

interface EnvelopeStageProps {
  guest: GuestRecord;
  config: EventConfig;
  isOpened: boolean;
  onOpen: () => void;
}

export function EnvelopeStage({ guest, config, isOpened, onOpen }: EnvelopeStageProps) {
  const greeting = config.envelopeGreeting || 'Trân trọng kính mời';
  const hintText = config.sealHintText || 'Chạm vào dấu sáp để mở thiệp';

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center p-4 min-h-[100dvh] h-[100dvh] overflow-hidden bg-bg/95 transition-opacity duration-700 ease-luxury ${
        isOpened ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      style={{
        paddingTop: 'env(safe-area-inset-top, 16px)',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      }}
    >
      {/* Decorative hairline musical notes in the backdrop */}
      <div className="absolute top-8 left-8 text-accent/10 pointer-events-none select-none">
        <Music className="w-20 h-20 -rotate-12" />
      </div>
      <div className="absolute bottom-10 right-8 text-accent/10 pointer-events-none select-none">
        <Music className="w-24 h-24 rotate-12" />
      </div>

      {/* Main Print-Inspired Envelope Container */}
      <div className="relative w-full max-w-[340px] sm:max-w-[370px] flex flex-col items-center">
        {/* Envelope Header / Dedication */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 text-center space-y-1.5 px-2"
        >
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-text-muted font-semibold">
            <Sparkles className="w-3 h-3 text-accent" />
            <span>{greeting}</span>
            <Sparkles className="w-3 h-3 text-accent" />
          </div>

          <h1 className="font-script text-3xl sm:text-4xl text-accent font-bold px-2 truncate max-w-[330px] drop-shadow-sm">
            {guest.full_name}
          </h1>

          <p className="text-[11px] text-text-muted/80 italic max-w-xs mx-auto truncate">
            {config.eventName}
          </p>
        </motion.div>

        {/* 3D Physical Luxury Envelope Body */}
        <div
          className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-2xl"
          style={{
            backgroundColor: 'var(--bg-envelope)',
            perspective: '1200px',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Subtle gold foil edge outline */}
          <div className="absolute inset-1.5 rounded-xl border border-white/10 pointer-events-none z-30" />

          {/* Envelope Flap (Nắp phong bì lật 3D) */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1/2 z-20 origin-top will-change-transform shadow-md"
            style={{
              backgroundColor: 'var(--bg-envelope-flap)',
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

          {/* Envelope Bottom Pocket (Thân túi) */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              backgroundColor: 'var(--bg-envelope)',
              clipPath: 'polygon(0 0, 50% 50%, 100% 0, 100% 100%, 0 100%)',
              opacity: 0.96,
            }}
          />

          {/* The Letter Inside (Trượt lên thanh thoát khi mở) */}
          <motion.div
            className="absolute inset-x-4 inset-y-3 bg-bg-surface rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center z-0 border border-border/60"
            initial={{ y: 24, opacity: 0.7 }}
            animate={isOpened ? { y: -45, opacity: 1 } : { y: 24, opacity: 0.7 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1.5">
              <Music className="w-4 h-4" />
            </div>
            <p className="font-serif text-sm font-bold text-text truncate max-w-[240px]">
              {config.eventName}
            </p>
            <p className="text-[11px] text-accent italic mt-0.5 font-script text-base">
              {config.slogan}
            </p>
          </motion.div>

          {/* Luxury 3D Embossed Wax Seal Button */}
          {!isOpened && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-auto">
              <motion.button
                type="button"
                onClick={onOpen}
                aria-label={hintText}
                className="wax-seal-btn relative w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center cursor-pointer border-2 border-white/25 active:scale-[0.94] transition-transform duration-200 min-h-[44px] min-w-[44px]"
                animate={{
                  scale: [1, 1.06, 1],
                  boxShadow: [
                    '0 8px 22px rgba(109, 20, 45, 0.35)',
                    '0 12px 28px rgba(109, 20, 45, 0.5)',
                    '0 8px 22px rgba(109, 20, 45, 0.35)',
                  ],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* Embossed inner rim & acoustic guitar motif */}
                <div className="w-12 h-12 rounded-full border border-black/20 flex items-center justify-center shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20" />
                  <Music className="w-6 h-6 text-white drop-shadow-md relative z-10" />
                </div>
              </motion.button>
            </div>
          )}
        </div>

        {/* Elegant Seal Hint Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-5 text-xs text-text-muted font-medium flex items-center gap-1.5 animate-pulse select-none"
        >
          <span>✨</span>
          <span>{hintText}</span>
          <span>✨</span>
        </motion.p>
      </div>
    </div>
  );
}
