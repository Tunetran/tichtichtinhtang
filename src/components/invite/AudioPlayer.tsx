'use client';

import { Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export function AudioPlayer({ isPlaying, onToggle }: AudioPlayerProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
      className="fixed top-4 right-4 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-bg-surface/85 backdrop-blur-md border border-border shadow-lg text-primary hover:text-accent transition-all duration-200 active:scale-95"
    >
      {isPlaying ? (
        <span className="relative flex items-center justify-center">
          <Volume2 className="w-5 h-5 text-primary" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-ping" />
        </span>
      ) : (
        <VolumeX className="w-5 h-5 text-text-muted opacity-80" />
      )}
    </button>
  );
}
