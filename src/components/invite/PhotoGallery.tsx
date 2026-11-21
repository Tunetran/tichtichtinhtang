'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import type { GalleryPhoto, ThemeName } from '@/config/event';
import { useTapHearts, HeartBurstRenderer } from './TapHeartBurst';

interface PhotoGalleryProps {
  gallery: GalleryPhoto[];
  theme: ThemeName;
}

export function PhotoGallery({ gallery, theme }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const { hearts, spawnHearts } = useTapHearts();

  if (!gallery || gallery.length === 0) {
    return null;
  }

  const isVintage = theme === 'vintage';

  const handlePhotoClick = (e: React.MouseEvent, photo: GalleryPhoto) => {
    // Kích hoạt hiệu ứng thả tim bay lên từ điểm chạm
    spawnHearts(e.clientX, e.clientY);
    // Mở ảnh sau một tích tắc nhẹ để khách thấy rõ tim bay
    setSelectedPhoto(photo);
  };

  return (
    <div className="space-y-4 font-sans-ui relative">
      <HeartBurstRenderer hearts={hearts} />

      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent font-bold font-sans-ui">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tri Ân & Đồng Hành</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-text text-balance leading-relaxed py-1 overflow-visible">
          Đơn Vị Đồng Hành
        </h3>
        <p className="text-xs sm:text-sm text-text-muted italic font-sans-ui max-w-sm mx-auto leading-relaxed">
          Trân trọng cảm ơn sự đồng hành quý báu của các đơn vị tài trợ
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 pt-2 items-center justify-items-center">
        {gallery.map((photo, index) => (
          <motion.div
            key={photo.src + index}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => handlePhotoClick(e, photo)}
            className="group relative cursor-pointer bg-transparent border-0 shadow-none flex items-center justify-center h-28 sm:h-36 w-full max-w-[220px] select-none active:scale-[0.98]"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={photo.src}
                alt={photo.alt || 'Đơn vị đồng hành'}
                fill
                sizes="(max-width: 640px) 50vw, 220px"
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </motion.div>
        ))}
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
              className="relative max-w-sm sm:max-w-md w-full max-h-[80vh] flex flex-col items-center cursor-default font-sans-ui"
            >
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white/10 flex items-center justify-center p-6 backdrop-blur-sm">
                <Image
                  src={selectedPhoto.src}
                  alt={selectedPhoto.alt || 'Đơn vị đồng hành'}
                  fill
                  sizes="(max-width: 640px) 90vw, 480px"
                  className="max-h-full max-w-full object-contain p-4"
                />
              </div>

              <div className="mt-3 text-center text-white px-2 space-y-1">
                <p className="text-sm sm:text-base font-semibold leading-relaxed">{selectedPhoto.alt || 'Đơn vị đồng hành'}</p>
                {selectedPhoto.caption && (
                  <p className="text-xs sm:text-sm text-white/90 italic leading-relaxed">
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
