'use client';
import { useState } from 'react';

export function LilyCorner({ className = '' }: { className?: string }) {
  const [hasError, setHasError] = useState(false);
  if (!hasError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/images/lily-corner.png" alt="" className={className} onError={() => setHasError(true)} />
    );
  }
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="#E598B3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 44C12 36 16 26 18 16M18 16C16 10 20 4 24 4C28 4 32 10 30 16C26 26 12 36 4 44Z" />
      <path d="M18 16C12 18 6 16 4 12C6 8 12 10 18 16Z" />
      <path d="M30 16C36 18 42 16 44 12C42 8 36 10 30 16Z" />
      <path d="M12 28C8 28 5 32 4 38C8 38 12 35 12 28Z" />
      <path d="M22 24C26 26 32 26 36 24C34 29 29 30 22 28" />
    </svg>
  );
}
