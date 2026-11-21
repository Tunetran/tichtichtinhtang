'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, XCircle, Loader2, MessageSquareHeart } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { GuestRecord } from '@/types/guest';
import type { EventConfig } from '@/config/event';
import { EVENT_CONFIG } from '@/config/event';
import { MiniTicket } from './MiniTicket';

interface RsvpSectionProps {
  guest: GuestRecord;
  config?: EventConfig;
  onRsvpSuccess: (updated: GuestRecord) => void;
  logoUrl?: string | null;
}

export function RsvpSection({ guest, config = EVENT_CONFIG, onRsvpSuccess, logoUrl }: RsvpSectionProps) {
  const hasAlreadyResponded = guest.status === 'ACCEPTED' || guest.status === 'DECLINED';
  const [isEditing, setIsEditing] = useState(!hasAlreadyResponded);

  const [selectedStatus, setSelectedStatus] = useState<'ACCEPTED' | 'DECLINED'>(
    guest.status === 'DECLINED' ? 'DECLINED' : 'ACCEPTED'
  );
  const [attendeesCount, setAttendeesCount] = useState<number>(
    guest.attendees_count > 0 ? guest.attendees_count : 1
  );
  const [songRequest, setSongRequest] = useState<string>(guest.song_request || '');
  const [wishMessage, setWishMessage] = useState<string>(guest.wish_message || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        status: selectedStatus,
        attendees_count: selectedStatus === 'ACCEPTED' ? attendeesCount : 0,
        song_request: selectedStatus === 'ACCEPTED' ? songRequest.trim() || null : null,
        wish_message: wishMessage.trim() || null,
      };

      const res = await fetch(`/api/invites/${guest.slug}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi gửi xác nhận.');
      }

      // Kích hoạt confetti hạt hồng cánh sen / hồng pastel / trắng nếu đồng ý tham gia
      if (selectedStatus === 'ACCEPTED') {
        try {
          confetti({
            particleCount: 65,
            spread: 70,
            origin: { y: 0.72 },
            colors: ['#D85C8A', '#F6C1D3', '#FFFFFF', '#FDE2EC'],
            disableForReducedMotion: true,
          });
        } catch {
          // Bỏ qua lỗi canvas
        }
      }

      onRsvpSuccess(data.guest);
      setIsEditing(false);
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 pt-6 border-t border-[#F6C1D3]/70 font-sans-ui">
      <div className="text-center space-y-1.5 px-2">
        <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-[#5C1F38] text-balance leading-relaxed py-1 overflow-visible">
          {config.rsvpHeading || 'Xác Nhận Tham Dự'}
        </h3>
        <p className="text-xs sm:text-sm text-[#7D6670] text-balance max-w-sm mx-auto leading-relaxed">
          {config.rsvpSubheading || 'Sự hiện diện của bạn là niềm vinh hạnh lớn của chúng mình'}
        </p>
      </div>

      {/* Khi đã phản hồi và không ở chế độ sửa: Hiển thị Thẻ Vé Kỷ Niệm (nếu Accepted) hoặc Thông báo Từ chối */}
      {hasAlreadyResponded && !isEditing && (
        guest.status === 'ACCEPTED' ? (
          <MiniTicket
            guest={guest}
            config={config}
            logoUrl={logoUrl}
            onEdit={() => setIsEditing(true)}
          />
        ) : (
          <div className="relative bg-[#FFFDFD]/95 backdrop-blur-sm rounded-2xl p-6 sm:p-7 shadow-[0_20px_60px_-15px_rgba(216,92,138,0.18)] border border-[#F3C6D6]/80 space-y-4 overflow-hidden font-sans-ui">
            <div className="absolute inset-3 border border-[#F3C6D6]/80 rounded-xl pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
              <div>
                <p className="font-semibold text-[#5C1F38] text-sm sm:text-base">
                  Bạn đã báo không thể tham dự đêm nhạc
                </p>
                <p className="text-xs text-[#7D6670] mt-0.5">
                  Cảm ơn bạn đã phản hồi cho Ban Tổ Chức. Chúc bạn luôn an yên!
                </p>
              </div>
            </div>

            {guest.wish_message && (
              <div className="text-xs bg-[#FFF5F8] p-3 rounded-xl border border-[#F6C1D3] text-[#4A3B42] space-y-1">
                <span className="text-[#D85C8A] flex items-center gap-1.5 font-bold">
                  <MessageSquareHeart className="w-3.5 h-3.5" /> Ghi chú riêng cho BTC của bạn:
                </span>
                <p className="italic pl-5 text-[#7D6670] font-handwriting text-base">&ldquo;{guest.wish_message}&rdquo;</p>
              </div>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-[#D85C8A] hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
              >
                Thay đổi phản hồi của bạn
              </button>
            </div>
          </div>
        )
      )}

      {/* Form tương tác RSVP */}
      {isEditing && (
        <form
          onSubmit={handleSubmit}
          className="relative bg-[#FFFDFD]/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(216,92,138,0.18)] border border-[#F3C6D6]/80 space-y-5 text-left overflow-hidden font-sans-ui"
        >
          <div className="absolute inset-3 border border-[#F3C6D6]/80 rounded-xl pointer-events-none" />
          {/* Lựa chọn 2 phương án */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedStatus('ACCEPTED')}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm border transition-all duration-200 active:scale-[0.98] min-h-[44px] cursor-pointer font-sans-ui ${
                selectedStatus === 'ACCEPTED'
                  ? 'bg-[#D85C8A] text-white border-[#D85C8A] shadow-md ring-2 ring-[#D85C8A]/20'
                  : 'bg-[#FFF5F8] text-[#4A3B42] border-[#F6C1D3] hover:border-[#D85C8A]'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  selectedStatus === 'ACCEPTED' ? 'fill-current text-white' : 'text-[#D85C8A]'
                }`}
              />
              <span>Tôi sẽ tham gia</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('DECLINED')}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm border transition-all duration-200 active:scale-[0.98] min-h-[44px] cursor-pointer font-sans-ui ${
                selectedStatus === 'DECLINED'
                  ? 'bg-[#7D6670] text-white border-[#7D6670] shadow-md ring-2 ring-[#7D6670]/20'
                  : 'bg-[#FFF5F8] text-[#4A3B42] border-[#F6C1D3] hover:border-[#D85C8A]'
              }`}
            >
              <XCircle className="w-4 h-4 text-[#7D6670]" />
              <span>Rất tiếc vắng mặt</span>
            </button>
          </div>

          {/* Các trường mở rộng động */}
          <AnimatePresence mode="wait">
            {selectedStatus === 'ACCEPTED' ? (
              <motion.div
                key="accepted-fields"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4 pt-1 font-sans-ui"
              >
                {/* Chọn số người tham dự */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#5C1F38]">
                    Số người tham dự:
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setAttendeesCount(num)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all active:scale-[0.98] min-h-[44px] cursor-pointer ${
                          attendeesCount === num
                            ? 'bg-[#D85C8A] text-white border-[#D85C8A] shadow-xs ring-2 ring-[#D85C8A]/20'
                            : 'bg-[#FFF5F8] text-[#4A3B42] border-[#F6C1D3] hover:border-[#D85C8A]'
                        }`}
                      >
                        {num} người
                      </button>
                    ))}
                  </div>
                  {/* Ghi chú linh hoạt theo số người tham dự */}
                  <p className="text-sm text-[#7A1835] mt-2 italic font-medium leading-relaxed">
                    {attendeesCount === 1 && "Still us rất hân hạnh được đón tiếp bạn trong đêm nhạc."}
                    {attendeesCount === 2 && "Thật ấm áp! Hẹn gặp bạn cùng người đồng hành tại đêm nhạc."}
                    {attendeesCount >= 3 && `Càng đông càng vui! Ban tổ chức sẽ chuẩn bị chỗ ngồi chu đáo cho nhóm ${attendeesCount} người của bạn.`}
                  </p>
                </div>

                {/* Ô 1: Lời nhắn gửi đến đêm nhạc (hiển thị trên Bức tường lời nhắn - lưu vào song_request) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="song_request" className="block text-xs font-semibold text-[#5C1F38]">
                      Lời nhắn gửi đến đêm nhạc
                    </label>
                    <span className="text-[11px] text-[#7D6670]/80 italic shrink-0">
                      Hiển thị trên Bức tường lời nhắn
                    </span>
                  </div>
                  <textarea
                    id="song_request"
                    rows={2}
                    maxLength={200}
                    value={songRequest}
                    onChange={(e) => setSongRequest(e.target.value)}
                    placeholder="Gửi một lời chúc hoặc tâm tình nhỏ đến Still us..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-[#FFF5F8] border border-[#F6C1D3] focus:outline-none focus:ring-1 focus:ring-[#D85C8A] text-[#4A3B42] placeholder:text-[#7D6670]/60 resize-none min-h-[44px]"
                  />
                </div>

                {/* Ô 2: Ghi chú riêng cho Ban Tổ Chức (chỉ BTC nhìn thấy - lưu vào wish_message) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="wish_message_acc" className="block text-xs font-semibold text-[#5C1F38]">
                      Ghi chú riêng cho Ban Tổ Chức (tùy chọn)
                    </label>
                    <span className="text-[11px] text-[#7D6670]/80 italic shrink-0">
                      Chỉ Ban Tổ Chức nhìn thấy
                    </span>
                  </div>
                  <textarea
                    id="wish_message_acc"
                    rows={2}
                    maxLength={500}
                    value={wishMessage}
                    onChange={(e) => setWishMessage(e.target.value)}
                    placeholder="Ví dụ: SĐT liên hệ, muốn ngồi gần bạn A, hoặc dự kiến đến lúc 17:00..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-[#FFF5F8] border border-[#F6C1D3] focus:outline-none focus:ring-1 focus:ring-[#D85C8A] text-[#4A3B42] placeholder:text-[#7D6670]/60 resize-none min-h-[44px]"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="declined-fields"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4 pt-1 font-sans-ui"
              >
                {/* Ghi chú riêng cho Ban Tổ Chức khi từ chối */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="wish_message_dec" className="block text-xs font-semibold text-[#5C1F38]">
                      Ghi chú riêng cho Ban Tổ Chức (tùy chọn)
                    </label>
                    <span className="text-[11px] text-[#7D6670]/80 italic shrink-0">
                      Chỉ Ban Tổ Chức nhìn thấy
                    </span>
                  </div>
                  <textarea
                    id="wish_message_dec"
                    rows={3}
                    maxLength={500}
                    value={wishMessage}
                    onChange={(e) => setWishMessage(e.target.value)}
                    placeholder="Ví dụ: SĐT liên hệ, muốn ngồi gần bạn A, hoặc dự kiến đến lúc 17:00..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-[#FFF5F8] border border-[#F6C1D3] focus:outline-none focus:ring-1 focus:ring-[#D85C8A] text-[#4A3B42] placeholder:text-[#7D6670]/60 resize-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Báo lỗi nếu có */}
          {errorMessage && (
            <p className="text-xs text-rose-500 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
              {errorMessage}
            </p>
          )}

          {/* Nút gửi & nút hủy */}
          <div className="flex gap-2.5 pt-2">
            {hasAlreadyResponded && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-[#F6C1D3] text-xs font-medium text-[#7D6670] hover:bg-[#FFF5F8] transition-colors min-h-[44px]"
              >
                Hủy bỏ
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-[#D85C8A] text-white font-semibold text-xs sm:text-sm shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang ghi nhận...</span>
                </>
              ) : (
                <span>Gửi phản hồi xác nhận</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Thông tin liên hệ BTC ở chân trang */}
      <div className="text-center pt-2 text-xs text-[#7D6670] space-y-1 font-sans-ui">
        <p>Cần hỗ trợ thêm thông tin sự kiện?</p>
        <a
          href={config.contactUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center font-semibold text-[#D85C8A] hover:underline min-h-[44px]"
        >
          {config.contactLabel}
        </a>
      </div>
    </section>
  );
}
