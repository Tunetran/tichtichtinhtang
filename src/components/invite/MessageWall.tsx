'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquareHeart, Sparkles } from 'lucide-react';

export interface WallMessage {
  id: string;
  name: string;
  message: string;
  time?: string;
}

interface MessageWallProps {
  latestMessage?: WallMessage | null;
}

export function MessageWall({ latestMessage }: MessageWallProps) {
  const [messages, setMessages] = useState<WallMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Tải danh sách lời nhắn từ API
  useEffect(() => {
    let mounted = true;
    fetch('/api/messages')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (mounted && data?.messages) {
          setMessages(data.messages);
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

  // Cập nhật ngay khi có lời nhắn mới từ khách mời hiện tại mà không cần reload
  useEffect(() => {
    if (!latestMessage || !latestMessage.message) return;
    setMessages((prev) => {
      // Tránh trùng lặp
      const exists = prev.some((m) => m.id === latestMessage.id || (m.name === latestMessage.name && m.message === latestMessage.message));
      if (exists) return prev;
      return [latestMessage, ...prev].slice(0, 8);
    });
  }, [latestMessage]);

  if (!isLoading && messages.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-[#FFFDFD]/95 backdrop-blur-sm rounded-2xl shadow-[0_20px_60px_-15px_rgba(216,92,138,0.18)] border border-[#F3C6D6]/80 p-6 sm:p-7 space-y-4 overflow-hidden font-sans-ui">
      {/* Khung viền đôi cao cấp */}
      <div className="absolute inset-3 border border-[#F3C6D6]/80 rounded-xl pointer-events-none" />

      {/* Tiêu đề mục lớn */}
      <div className="text-center border-b border-[#F3C6D6]/70 pb-3 space-y-0.5 relative z-10">
        <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#D85C8A] font-bold">
          <Sparkles className="w-3 h-3 text-[#D85C8A]" />
          <span>Gửi Gắm Yêu Thương</span>
          <Sparkles className="w-3 h-3 text-[#D85C8A]" />
        </div>
        <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-[#5C1F38] leading-relaxed py-1 overflow-visible">
          Bức Tường Lời Nhắn
        </h3>
        <p className="text-xs text-[#7D6670]">
          Những lời chúc & chia sẻ ấm áp từ khách quý
        </p>
      </div>

      {/* Khung cuộn danh sách lời nhắn */}
      <div className="relative z-10 max-h-72 overflow-y-auto space-y-3 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((item, index) => (
            <motion.div
              key={item.id || `${item.name}-${index}`}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#FFF5F8]/90 border border-[#F6C1D3]/80 rounded-xl p-3.5 space-y-1.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-sans-ui text-xs font-bold text-[#5C1F38] flex items-center gap-1.5">
                  <MessageSquareHeart className="w-3.5 h-3.5 text-[#D85C8A]" />
                  <span>{item.name}</span>
                </span>
                <span className="text-[10px] text-[#7D6670]/60">Khách mời</span>
              </div>
              <p className="font-handwriting text-base sm:text-lg text-[#4A3B42] leading-relaxed pl-1">
                &ldquo;{item.message}&rdquo;
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
