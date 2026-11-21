'use client';

import { Volume2, VolumeX, Disc3 } from 'lucide-react';

interface AudioPlayerProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export function AudioPlayer({ isPlaying, onToggle }: AudioPlayerProps) {
  return (
    <aside
      className="fixed z-50 pointer-events-auto"
      style={{
        top: 'max(1rem, env(safe-area-inset-top, 16px))',
        right: 'max(1rem, env(safe-area-inset-right, 16px))',
      }}
      aria-label="Điều khiển âm thanh"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={isPlaying ? 'Tạm dừng nhạc nền' : 'Bật nhạc nền lãng mạn'}
        className="group relative flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-bg-surface/95 border border-border/80 shadow-lg hover:border-accent text-text transition-all duration-300 active:scale-[0.96] min-h-[44px] min-w-[44px] cursor-pointer"
      >
        {/* Micro Vinyl Record Disc */}
        <div
          className={`relative w-8 h-8 rounded-full bg-neutral-900 border border-amber-600/30 flex items-center justify-center shrink-0 shadow-inner ${
            isPlaying ? 'animate-vinyl-spin' : ''
          }`}
        >
          {/* Concentric record grooves */}
          <div className="absolute inset-1 rounded-full border border-neutral-700/60 pointer-events-none" />
          <div className="absolute inset-2 rounded-full border border-neutral-800 pointer-events-none" />
          {/* Center gold spindle hole */}
          <div className="w-2.5 h-2.5 rounded-full bg-accent border border-black/30 shadow-sm flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-neutral-900" />
          </div>
        </div>

        {/* Audio status indicator & micro equalizer */}
        <div className="flex items-center gap-1.5 pr-0.5">
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 h-2.5 bg-accent rounded-full animate-pulse" />
              <span className="w-0.5 h-3.5 bg-primary rounded-full animate-bounce" />
              <span className="w-0.5 h-1.5 bg-accent rounded-full animate-pulse" />
            </div>
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-text-muted" />
          )}

          <span className="text-[11px] font-semibold text-text tracking-wide hidden sm:inline select-none font-sans-ui">
            {isPlaying ? 'Đang phát' : 'Âm nhạc'}
          </span>
        </div>
      </button>
    </aside>
  );
}
