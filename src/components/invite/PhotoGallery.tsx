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

      <div className="grid grid-cols-2 gap-3.5">
        {gallery.map((photo, index) => {
          const isOdd = index % 2 !== 0;

          return (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setSelectedPhoto(photo)}
              className={`cursor-pointer overflow-hidden rounded-xl bg-bg-surface border border-border/80 shadow-sm hover:shadow-md transition-all duration-300 group active:scale-[0.98] ${
                isVintage
                  ? `gallery-polaroid p-2 bg-white pb-6 shadow-md ${
                      isOdd ? 'rotate-1' : '-rotate-1'
                    }`
                  : 'p-1.5'
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-bg/50">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 45vw, 220px"
                  className="object-cover transition-transform duration-500 ease-luxury group-hover:scale-105"
                />
              </div>

              {photo.caption && (
                <p
                  className={`mt-2 text-center text-xs truncate px-1 ${
                    isVintage
                      ? 'font-script text-sm text-[#4A373B]'
                      : 'text-text-muted font-serif'
                  }`}
                >
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
