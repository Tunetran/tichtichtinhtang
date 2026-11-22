'use client';

import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

const ITEMS = [
  { l: '4%', s: 23, d: 11, delay: 0, rot: [-30, 45, -30], type: 'petal', opacity: 0.75 },
  { l: '12%', s: 18, d: 14, delay: 3, rot: [15, -40, 15], type: 'leaf', opacity: 0.65 },
  { l: '19%', s: 28, d: 12, delay: 1, rot: [-25, 30, -25], type: 'petal', opacity: 0.85 },
  { l: '27%', s: 16, d: 15, delay: 5, rot: [40, -20, 40], type: 'sparkle', opacity: 0.58 },
  { l: '35%', s: 25, d: 13, delay: 2, rot: [-15, 50, -15], type: 'petal', opacity: 0.78 },
  { l: '43%', s: 20, d: 16, delay: 4, rot: [25, -35, 25], type: 'leaf', opacity: 0.68 },
  { l: '51%', s: 23, d: 12, delay: 0.5, rot: [-40, 30, -40], type: 'petal', opacity: 0.8 },
  { l: '59%', s: 18, d: 14, delay: 3.5, rot: [10, -50, 10], type: 'sparkle', opacity: 0.6 },
  { l: '67%', s: 25, d: 13, delay: 1.5, rot: [-30, 40, -30], type: 'petal', opacity: 0.82 },
  { l: '75%', s: 19, d: 15, delay: 4.5, rot: [35, -25, 35], type: 'leaf', opacity: 0.65 },
  { l: '83%', s: 24, d: 11, delay: 2.5, rot: [-20, 45, -20], type: 'petal', opacity: 0.78 },
  { l: '90%', s: 28, d: 14, delay: 0.8, rot: [30, -30, 30], type: 'petal', opacity: 0.85 },
  { l: '95%', s: 16, d: 16, delay: 5.2, rot: [-10, 35, -10], type: 'sparkle', opacity: 0.58 },
  { l: '62%', s: 20, d: 12, delay: 6, rot: [20, -45, 20], type: 'leaf', opacity: 0.7 },
];

interface FallingHeartsProps {
  logoUrl?: string | null;
}

export function FallingHearts({ logoUrl }: FallingHeartsProps) {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
      {ITEMS.map((h, i) => (
        <motion.div
          key={i}
          className="absolute -top-10 flex items-center justify-center pointer-events-none"
          style={{ left: h.l, opacity: h.opacity }}
          animate={{
            y: ['-40px', '108vh'],
            x: [-18, 18, -18],
            rotate: h.rot,
          }}
          transition={{ duration: h.d, repeat: Infinity, delay: h.delay, ease: 'linear' }}
        >
          {h.type === 'petal' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/lotus-petal.png"
              alt=""
              className="object-contain pointer-events-none select-none bg-transparent border-0 shadow-none drop-shadow-sm filter drop-shadow-[0_2px_4px_rgba(244,167,187,0.4)]"
              style={{ width: `${h.s}px`, height: `${h.s}px` }}
              onError={(e) => {
                // Fallback nếu ảnh không tải được
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : h.type === 'leaf' ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#006C3A"
              strokeWidth="1.5"
              className="drop-shadow-xs"
              style={{ width: `${h.s}px`, height: `${h.s}px` }}
            >
              <path
                d="M12 2C6 8 4 14 6 20C12 22 18 20 20 14C22 8 18 4 12 2Z"
                fill="#C8E6C9"
                fillOpacity="0.6"
              />
              <path d="M12 2V22" stroke="#006C3A" strokeWidth="1" />
            </svg>
          ) : (
            <Sparkles size={h.s} className="text-[#006C3A]/70 drop-shadow-xs" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
