'use client';

import { motion } from 'motion/react';
import { Music } from 'lucide-react';
import type { GuestRecord } from '@/types/guest';

interface EnvelopeStageProps {
  guest: GuestRecord;
  isOpened: boolean;
  onOpen: () => void;
}

export function EnvelopeStage({ guest, isOpened, onOpen }: EnvelopeStageProps) {
  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center p-4 min-h-[100dvh] h-[100dvh] overflow-hidden bg-bg/95 backdrop-blur-sm transition-opacity duration-500 ${
        isOpened ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* Họa tiết nốt nhạc mờ ở các góc */}
      <div className="absolute top-6 left-6 text-accent/15 pointer-events-none">
        <Music className="w-16 h-16 -rotate-12" />
      </div>
      <div className="absolute bottom-8 right-8 text-accent/15 pointer-events-none">
        <Music className="w-20 h-20 rotate-12" />
      </div>
      <div className="absolute top-1/4 right-8 text-accent/10 pointer-events-none">
        <Music className="w-10 h-10 rotate-45" />
      </div>

      {/* Phong bì chính */}
      <div className="relative w-full max-w-[340px] sm:max-w-[360px] flex flex-col items-center">
        {/* Lời đề tặng trên phong bì */}
        <div className="mb-4 text-center space-y-1">
          <p className="text-xs uppercase tracking-[0.25em] text-text-muted font-medium">
            Trân trọng kính mời
          </p>
          <h2 className="font-script text-3xl sm:text-4xl text-accent font-semibold px-2 truncate max-w-[320px]">
            {guest.full_name}
          </h2>
        </div>

        {/* Khung phong bì vật lý */}
        <div
          className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-border/50"
          style={{
            backgroundColor: 'var(--bg-envelope)',
            boxShadow: 'var(--envelope-shadow)',
            perspective: '1000px',
          }}
        >
          {/* Nắp phong bì (Flap) có thể lật mở */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1/2 z-20 origin-top"
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
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Thân túi phong bì (Bottom pocket) */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              backgroundColor: 'var(--bg-envelope)',
              clipPath: 'polygon(0 0, 50% 50%, 100% 0, 100% 100%, 0 100%)',
              opacity: 0.95,
            }}
          />

          {/* Tờ thư bên trong trượt lên khi nắp mở */}
          <motion.div
            className="absolute inset-x-4 inset-y-3 bg-bg-surface rounded-lg shadow-inner p-4 flex flex-col items-center justify-center text-center z-0"
            initial={{ y: 20, opacity: 0.6 }}
            animate={isOpened ? { y: -30, opacity: 1 } : { y: 20, opacity: 0.6 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Music className="w-6 h-6 text-accent mb-2" />
            <p className="font-serif text-sm font-semibold text-text">
              Đêm Nhạc Tình Yêu
            </p>
            <p className="text-[11px] text-text-muted italic mt-0.5">
              Chạm đến từng cung bậc cảm xúc
            </p>
          </motion.div>

          {/* Con dấu sáp niêm phong */}
          {!isOpened && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-auto">
              <motion.button
                type="button"
                onClick={onOpen}
                aria-label="Mở thư mời"
                className="wax-seal-btn w-16 h-16 rounded-full flex items-center justify-center cursor-pointer border-2 border-white/20 active:scale-95 transition-transform"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="w-12 h-12 rounded-full border border-black/15 flex items-center justify-center shadow-inner">
                  <Music className="w-6 h-6 text-white drop-shadow" />
                </div>
              </motion.button>
            </div>
          )}
        </div>

        {/* Lời nhắc bên dưới */}
        <p className="mt-5 text-xs text-text-muted animate-pulse">
          Chạm vào dấu sáp để mở thư
        </p>
      </div>
    </div>
  );
}
