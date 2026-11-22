'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquareHeart, Sparkles } from 'lucide-react';
import { parseGuestNote } from '@/lib/guest-contact';

export interface WishItem {
  id: string;
  name: string;
  message: string;
  time?: string;
}

interface GuestWishesSectionProps {
  latestWish?: {
    id?: string;
    name: string;
    message: string;
  } | null;
}

export function GuestWishesSection({ latestWish }: GuestWishesSectionProps) {
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Tải danh sách lời chúc từ API
  useEffect(() => {
    let mounted = true;
    fetch('/api/messages')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (mounted && data?.messages) {
          setWishes(data.messages);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Cập nhật tức thì lời chúc mới từ khách mời vừa gửi RSVP mà không cần tải lại trang
  useEffect(() => {
    if (!latestWish || !latestWish.message?.trim()) return;

    // Giải mã an toàn chuỗi lời chúc, tuyệt đối không đưa JSON hay phone/email vào bức tường
    const { note } = parseGuestNote(latestWish.message);
    if (!note) return;

    setWishes((prev) => {
      const wishText = note;
      // Tránh thêm trùng lặp
      const alreadyExists = prev.some(
        (w) =>
          (latestWish.id && w.id === latestWish.id) ||
          (w.name === latestWish.name && w.message === wishText)
      );
      if (alreadyExists) return prev;

      const newWish: WishItem = {
        id: latestWish.id || `temp-${Date.now()}`,
        name: latestWish.name,
        message: wishText,
        time: new Date().toISOString(),
      };
      return [newWish, ...prev];
    });
  }, [latestWish]);

  return (
    <section className="space-y-4 font-sans-ui" id="wishes-section">
      {/* Huy hiệu Tiêu đề Lời Chúc Từ Khách Mời */}
      <div className="flex justify-center">
        <div className="px-6 py-2 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] shadow-xs inline-flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#006C3A]" />
          <h2 className="font-serif-title text-base sm:text-lg font-bold tracking-normal text-[#006C3A] uppercase text-center">
            LỜI CHÚC TỪ KHÁCH MỜI
          </h2>
          <Sparkles className="w-3.5 h-3.5 text-[#006C3A]" />
        </div>
      </div>

      <p className="text-center text-xs sm:text-sm text-[#61733F] max-w-sm mx-auto leading-relaxed px-4 tracking-normal">
        Những lời chúc và chia sẻ thân thương gửi đến đêm nhạc Tịch Tịch Tình Tang
      </p>

      {/* Khung danh sách lời chúc cuộn gọn trang nhã */}
      <div className="relative bg-[#FFFDF9]/95 backdrop-blur-sm rounded-3xl p-5 sm:p-6 shadow-[0_15px_35px_-8px_rgba(0,108,58,0.12)] border border-[#C8E6C9] space-y-3">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#61733F]/70 italic">
            Đang tải những lời chúc yêu thương...
          </div>
        ) : wishes.length === 0 ? (
          <div className="py-6 text-center text-xs sm:text-sm text-[#61733F] leading-relaxed italic px-3">
            Chưa có lời chúc nào. Hãy là người đầu tiên gửi gắm lời chúc đến The Light qua khung xác nhận phía trên nhé! 🎋
          </div>
        ) : (
          <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-2.5 pr-1.5">
            <AnimatePresence initial={false}>
              {wishes.map((item, idx) => (
                <motion.div
                  key={item.id || `${item.name}-${idx}`}
                  initial={{ opacity: 0, y: -10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-[#F9FCF8] border border-[#D5E5C9] rounded-2xl p-3.5 sm:p-4 space-y-1.5 shadow-2xs hover:border-[#006C3A]/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-sans-ui text-xs sm:text-sm font-bold text-[#006C3A] flex items-center gap-1.5 truncate">
                      <MessageSquareHeart className="w-3.5 h-3.5 text-[#006C3A] shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="text-[10px] text-[#61733F] bg-white border border-[#C8E6C9]/80 px-2 py-0.5 rounded-full font-medium shrink-0">
                      Khách mời
                    </span>
                  </div>
                  <p className="font-sans-ui text-xs sm:text-sm text-[#3E3836] leading-relaxed italic pl-1 select-text">
                    &ldquo;{item.message}&rdquo;
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}

export { GuestWishesSection as MessageWall };
