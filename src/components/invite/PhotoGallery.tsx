'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import type { GalleryPhoto, ThemeName } from '@/config/event';

interface PhotoGalleryProps {
  gallery: GalleryPhoto[];
  theme: ThemeName;
}

export function PhotoGallery({ gallery, theme }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  if (!gallery || gallery.length === 0) {
    return null;
  }

  const isVintage = theme === 'vintage';

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-accent font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>Khoảnh Khắc</span>
          <Sparkles className="w-3 h-3" />
        </div>
        <h3 className="font-serif text-lg sm:text-xl font-bold text-text text-balance">
          Không Gian & Kỷ Niệm
        </h3>
        <p className="text-xs text-text-muted italic">
          Những thanh âm và hình ảnh dịu êm
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 pt-2">
        {gallery.map((photo, index) => {
          const isOdd = index % 2 !== 0;

          return (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setSelectedPhoto(photo)}
              className={`relative cursor-pointer bg-white p-2 pb-6 shadow-md rounded-sm transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                isOdd ? 'rotate-1' : '-rotate-1'
              }`}
            >
              {/* Dải băng dính Washi Tape màu hồng phấn bán trong suốt ở chính giữa mép trên */}
              <div
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 sm:w-14 h-4 bg-[#F6C1D3]/60 backdrop-blur-[1px] rounded-xs shadow-xs z-10 pointer-events-none rotate-[-1deg]"
                aria-hidden="true"
              />

              <div className="relative aspect-square w-full overflow-hidden rounded-xs bg-[#FFF5F8]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 45vw, 220px"
                  className="object-cover transition-transform duration-500 ease-luxury hover:scale-105"
                />
              </div>

              {photo.caption && (
                <p className="mt-2 text-center text-xs font-handwriting text-[#5C1F38] truncate px-1 text-[13px]">
                  {photo.caption}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal (Optimized for Zalo/Safari: solid 90% black tint, no heavy nested blurs) */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 cursor-pointer"
          >
            {/* Close button with 44px touch target */}
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-5 right-5 text-white/90 hover:text-white p-3 rounded-full bg-white/15 hover:bg-white/25 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.95]"
              aria-label="Đóng xem ảnh"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Central photo frame */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-sm sm:max-w-md w-full max-h-[80vh] flex flex-col items-center cursor-default"
            >
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                <Image
                  src={selectedPhoto.src}
                  alt={selectedPhoto.alt}
                  fill
                  sizes="(max-width: 640px) 90vw, 480px"
                  className="object-cover"
                />
              </div>

              <div className="mt-3 text-center text-white px-2 space-y-0.5">
                <p className="text-sm font-semibold">{selectedPhoto.alt}</p>
                {selectedPhoto.caption && (
                  <p className="text-xs text-white/80 italic font-serif">
                    {selectedPhoto.caption}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
