'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';

export interface FloatingHeartItem {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  driftX: number;
  rotate: number;
}

const HEART_COLORS = ['#D85C8A', '#F4B8CC', '#E598B3', '#D85C8A', '#F6C1D3'];

export function useTapHearts() {
  const [hearts, setHearts] = useState<FloatingHeartItem[]>([]);

  const spawnHearts = useCallback((originX: number, originY: number) => {
    const count = 4 + Math.floor(Math.random() * 2); // 4-5 hearts
    const batchId = Date.now();
    const newItems: FloatingHeartItem[] = [];

    for (let i = 0; i < count; i++) {
      newItems.push({
        id: batchId + i + Math.random(),
        x: originX + (Math.random() * 40 - 20),
        y: originY + (Math.random() * 20 - 10),
        size: 15 + Math.floor(Math.random() * 10),
        color: HEART_COLORS[i % HEART_COLORS.length],
        driftX: Math.random() * 50 - 25,
        rotate: Math.random() * 40 - 20,
      });
    }

    setHearts((prev) => [...prev, ...newItems]);

    // Tự động xóa khỏi state sau 0.9s để luôn mượt 60fps
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newItems.some((n) => n.id === h.id)));
    }, 900);
  }, []);

  return { hearts, spawnHearts };
}

export function HeartBurstRenderer({ hearts }: { hearts: FloatingHeartItem[] }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{
              opacity: 1,
              scale: 0.6,
              x: heart.x,
              y: heart.y,
              rotate: 0,
            }}
            animate={{
              opacity: 0,
              scale: 1.25,
              x: heart.x + heart.driftX,
              y: heart.y - 75 - Math.random() * 35,
              rotate: heart.rotate,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Heart
              style={{
                width: heart.size,
                height: heart.size,
                fill: heart.color,
                color: heart.color,
              }}
              className="drop-shadow-xs"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

interface TapHeartButtonProps {
  onTap: (e: React.MouseEvent) => void;
}

export function TapHeartButton({ onTap }: TapHeartButtonProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={onTap}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF5F8] border border-[#F3C6D6] hover:border-[#D85C8A] text-[#D85C8A] shadow-xs transition-all cursor-pointer font-sans-ui text-xs font-semibold select-none"
      aria-label="Thả tim cho đêm nhạc"
    >
      <Heart className="w-4 h-4 fill-current text-[#D85C8A] animate-pulse" />
      <span>Thả tim cho đêm nhạc</span>
    </motion.button>
  );
}
