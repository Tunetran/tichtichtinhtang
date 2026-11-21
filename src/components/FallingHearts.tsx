'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

const ITEMS = [
  { l: '4%', s: 14, imgS: 26, c: '#F4B8CC', d: 11, delay: 0 },
  { l: '12%', s: 12, imgS: 22, c: '#FDE2EC', d: 14, delay: 3 },
  { l: '19%', s: 16, imgS: 32, c: '#D85C8A', d: 12, delay: 1 },
  { l: '27%', s: 10, imgS: 20, c: '#F4B8CC', d: 15, delay: 5 },
  { l: '35%', s: 14, imgS: 28, c: '#FDE2EC', d: 13, delay: 2 },
  { l: '43%', s: 17, imgS: 36, c: '#D85C8A', d: 16, delay: 4 },
  { l: '51%', s: 12, imgS: 24, c: '#F4B8CC', d: 12, delay: 0.5 },
  { l: '59%', s: 15, imgS: 30, c: '#FDE2EC', d: 14, delay: 3.5 },
  { l: '67%', s: 11, imgS: 22, c: '#D85C8A', d: 13, delay: 1.5 },
  { l: '75%', s: 16, imgS: 34, c: '#F4B8CC', d: 15, delay: 4.5 },
  { l: '83%', s: 13, imgS: 26, c: '#FDE2EC', d: 11, delay: 2.5 },
  { l: '90%', s: 17, imgS: 34, c: '#D85C8A', d: 14, delay: 0.8 },
  { l: '95%', s: 10, imgS: 20, c: '#F4B8CC', d: 16, delay: 5.2 },
  { l: '62%', s: 14, imgS: 28, c: '#FDE2EC', d: 12, delay: 6 },
];

interface FallingHeartsProps {
  logoUrl?: string | null;
}

export function FallingHearts({ logoUrl }: FallingHeartsProps) {
  const [hasError, setHasError] = useState(false);
  const useLogo = Boolean(logoUrl && !hasError);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
      {ITEMS.map((h, i) => (
        <motion.div
          key={i}
          className="absolute -top-10"
          style={{ left: h.l, color: h.c, opacity: useLogo ? 0.35 : 0.5 }}
          animate={{ y: ['-30px', '108vh'], x: [-12, 12, -12], rotate: [-20, 20, -20] }}
          transition={{ duration: h.d, repeat: Infinity, delay: h.delay, ease: 'linear' }}
        >
          {useLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl!}
              alt=""
              className="object-contain pointer-events-none select-none drop-shadow-2xs"
              style={{ width: `${h.imgS}px`, height: `${h.imgS}px` }}
              onError={() => setHasError(true)}
            />
          ) : (
            <Heart size={h.s} fill="currentColor" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
