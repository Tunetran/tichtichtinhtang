'use client';

import { useState } from 'react';

interface EventLogoImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
}

export function EventLogoImage({
  src,
  alt = 'Logo sự kiện',
  className = 'w-full h-full object-contain drop-shadow-sm bg-transparent',
  containerClassName = 'relative w-24 h-24 sm:w-28 sm:h-28 mx-auto flex items-center justify-center shrink-0 bg-transparent border-0 shadow-none p-0',
}: EventLogoImageProps) {
  const [hasError, setHasError] = useState(false);
  const imageSrc = src || '/images/default-logo.png';

  if (hasError) return null;

  return (
    <div className={containerClassName}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
