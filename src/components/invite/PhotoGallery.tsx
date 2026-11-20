'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import type { GalleryPhoto, ThemeName } from '@/config/event';

interface PhotoGalleryProps {
  gallery: GalleryPhoto[];
  theme: ThemeName;
}

export function PhotoGallery({ gallery, theme }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  const isVintage = theme === 'vintage';

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-serif text-lg sm:text-xl font-semibold text-text">
          Khoảnh Khắc Đêm Nhạc
        </h3>
        <p className="text-xs text-text-muted mt-1 italic">
          Những thanh âm và hình ảnh dịu êm
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {gallery.map((photo, index) => {
          const isOdd = index % 2 !== 0;

          return (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setSelectedPhoto(photo)}
              className={`cursor-pointer overflow-hidden rounded-xl bg-bg-surface border border-border shadow-sm hover:shadow-md transition-all duration-300 group ${
                isVintage
                  ? `gallery-polaroid p-2 bg-white pb-6 shadow-md ${
                      isOdd ? 'rotate-1' : '-rotate-1'
                    }`
                  : ''
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-bg/50">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 45vw, 220px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {photo.caption && (
                <p
                  className={`mt-2 text-center text-xs truncate px-1 ${
                    isVintage
                      ? 'font-script text-sm text-[#4A373B]'
                      : 'text-text-muted'
                  }`}
                >
                  {photo.caption}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal phóng to ảnh */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 cursor-pointer"
          >
            {/* Nút đóng X */}
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10 backdrop-blur-md"
              aria-label="Đóng xem ảnh"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Khung ảnh trung tâm */}
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

              <div className="mt-3 text-center text-white px-2">
                <p className="text-sm font-medium">{selectedPhoto.alt}</p>
                {selectedPhoto.caption && (
                  <p className="text-xs text-white/70 italic mt-0.5">
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
