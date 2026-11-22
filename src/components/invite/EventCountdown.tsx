'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface EventCountdownProps {
  targetDateIso?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export function EventCountdown({ targetDateIso }: EventCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    setMounted(true);
    const target = targetDateIso ? new Date(targetDateIso).getTime() : new Date('2026-12-05T18:30:00+07:00').getTime();

    const calculate = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDateIso]);

  if (!mounted) {
    // Zero-CLS placeholder during SSR
    return (
      <div className="py-2 text-center" aria-hidden="true">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-bg border border-border/50 text-xs text-text-muted font-sans-ui">
          <Clock className="w-3.5 h-3.5 text-accent" />
          <span>Đang đếm ngược thời khắc khai mạc...</span>
        </div>
      </div>
    );
  }

  if (timeLeft.isPast) {
    return (
      <div className="py-2 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/30 text-xs font-semibold text-accent font-sans-ui">
          <span>✨ Đêm nhạc đang diễn ra hoặc đã kết thúc viên mãn ✨</span>
        </div>
      </div>
    );
  }

  const items = [
    { label: 'Ngày', value: String(timeLeft.days).padStart(2, '0') },
    { label: 'Giờ', value: String(timeLeft.hours).padStart(2, '0') },
    { label: 'Phút', value: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'Giây', value: String(timeLeft.seconds).padStart(2, '0') },
  ];

  return (
    <div className="space-y-2 text-center font-sans-ui">
      <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted tracking-wider uppercase font-semibold font-sans-ui">
        <Clock className="w-3.5 h-3.5 text-accent" />
        <span>Thời khắc khai màn</span>
      </div>

      <div className="grid grid-cols-4 gap-2 max-w-[320px] mx-auto font-sans-ui">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="editorial-card rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-center bg-bg-surface border border-border/70 shadow-sm"
          >
            <span className="font-sans-ui text-xl sm:text-2xl font-bold text-accent tabular-nums tracking-tight leading-none">
              {item.value}
            </span>
            <span className="text-[10px] uppercase font-semibold text-text-muted mt-1 tracking-wider font-sans-ui">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
