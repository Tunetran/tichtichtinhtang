'use client';

import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

const ITEMS = [
  { l: '4%', s: 18, d: 11, delay: 0, rot: [-30, 45, -30], type: 'petal' },
  { l: '12%', s: 14, d: 14, delay: 3, rot: [15, -40, 15], type: 'leaf' },
  { l: '19%', s: 22, d: 12, delay: 1, rot: [-25, 30, -25], type: 'petal' },
  { l: '27%', s: 12, d: 15, delay: 5, rot: [40, -20, 40], type: 'sparkle' },
  { l: '35%', s: 20, d: 13, delay: 2, rot: [-15, 50, -15], type: 'petal' },
  { l: '43%', s: 16, d: 16, delay: 4, rot: [25, -35, 25], type: 'leaf' },
  { l: '51%', s: 18, d: 12, delay: 0.5, rot: [-40, 30, -40], type: 'petal' },
  { l: '59%', s: 14, d: 14, delay: 3.5, rot: [10, -50, 10], type: 'sparkle' },
  { l: '67%', s: 20, d: 13, delay: 1.5, rot: [-30, 40, -30], type: 'petal' },
  { l: '75%', s: 15, d: 15, delay: 4.5, rot: [35, -25, 35], type: 'leaf' },
  { l: '83%', s: 19, d: 11, delay: 2.5, rot: [-20, 45, -20], type: 'petal' },
  { l: '90%', s: 22, d: 14, delay: 0.8, rot: [30, -30, 30], type: 'petal' },
  { l: '95%', s: 12, d: 16, delay: 5.2, rot: [-10, 35, -10], type: 'sparkle' },
  { l: '62%', s: 16, d: 12, delay: 6, rot: [20, -45, 20], type: 'leaf' },
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
          className="absolute -top-10 flex items-center justify-center"
          style={{ left: h.l, opacity: 0.45 }}
          animate={{
            y: ['-40px', '108vh'],
            x: [-16, 16, -16],
            rotate: h.rot,
          }}
          transition={{ duration: h.d, repeat: Infinity, delay: h.delay, ease: 'linear' }}
        >
          {h.type === 'petal' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/lotus-petal.png"
              alt=""
              className="object-contain pointer-events-none select-none drop-shadow-xs"
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
              className="opacity-60"
              style={{ width: `${h.s}px`, height: `${h.s}px` }}
            >
              <path
                d="M12 2C6 8 4 14 6 20C12 22 18 20 20 14C22 8 18 4 12 2Z"
                fill="#C8E6C9"
                fillOpacity="0.4"
              />
              <path d="M12 2V22" stroke="#006C3A" strokeWidth="1" />
            </svg>
          ) : (
            <Sparkles size={h.s} className="text-[#006C3A]/40" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
