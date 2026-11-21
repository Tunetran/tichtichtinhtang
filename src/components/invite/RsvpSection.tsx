'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, XCircle, CheckCircle2, Loader2, Music, MessageSquareHeart } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { GuestRecord } from '@/types/guest';
import type { EventConfig } from '@/config/event';
import { EVENT_CONFIG } from '@/config/event';

interface RsvpSectionProps {
  guest: GuestRecord;
  config?: EventConfig;
  onRsvpSuccess: (updated: GuestRecord) => void;
}

export function RsvpSection({ guest, config = EVENT_CONFIG, onRsvpSuccess }: RsvpSectionProps) {
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
    <section className="space-y-6 pt-6 border-t border-[#F6C1D3]/70 font-invitation">
      <div className="text-center space-y-1.5 px-2">
        <h3 className="font-invitation text-2xl sm:text-3xl font-bold text-[#5C1F38] text-balance leading-relaxed">
          {config.rsvpHeading || 'Xác Nhận Tham Dự'}
        </h3>
        <p className="text-sm sm:text-base text-[#7D6670] text-balance max-w-sm mx-auto font-invitation leading-relaxed">
          {config.rsvpSubheading || 'Sự hiện diện của bạn là niềm vinh hạnh lớn của chúng mình'}
        </p>
      </div>

      {/* Thẻ tóm tắt khi đã phản hồi và không ở chế độ sửa */}
      {hasAlreadyResponded && !isEditing && (
        <div className="relative bg-[#FFFDFD]/95 backdrop-blur-sm rounded-2xl p-6 sm:p-7 shadow-[0_20px_60px_-15px_rgba(216,92,138,0.18)] border border-[#F3C6D6]/80 space-y-4 overflow-hidden font-invitation">
          <div className="absolute inset-3 border border-[#F3C6D6]/80 rounded-xl pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            {guest.status === 'ACCEPTED' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
            )}
            <div>
              <p className="font-bold text-[#5C1F38] text-base sm:text-lg font-invitation leading-relaxed">
                {guest.status === 'ACCEPTED'
                  ? `Bạn đã xác nhận tham dự cùng ${guest.attendees_count} người`
                  : 'Bạn đã báo không thể tham dự đêm nhạc'}
              </p>
              <p className="text-sm text-[#7D6670] mt-0.5 font-invitation leading-relaxed">
                Cảm ơn bạn đã phản hồi cho Ban Tổ Chức
              </p>
            </div>
          </div>

          {guest.song_request && (
            <div className="text-sm bg-[#FFF5F8] p-3 rounded-xl border border-[#F6C1D3] text-[#4A3B42] space-y-1 font-invitation">
              <span className="text-[#D85C8A] flex items-center gap-1.5 font-bold">
                <Music className="w-3.5 h-3.5" /> Ca khúc bạn yêu cầu:
              </span>
              <p className="italic pl-5 font-invitation text-base sm:text-lg text-[#5C1F38] leading-relaxed">&ldquo;{guest.song_request}&rdquo;</p>
            </div>
          )}

          {guest.wish_message && (
            <div className="text-sm bg-[#FFF5F8] p-3 rounded-xl border border-[#F6C1D3] text-[#4A3B42] space-y-1 font-invitation">
              <span className="text-[#D85C8A] flex items-center gap-1.5 font-bold">
                <MessageSquareHeart className="w-3.5 h-3.5" /> Lời chúc của bạn:
              </span>
              <p className="italic pl-5 text-[#7D6670] font-invitation text-base sm:text-lg leading-relaxed">&ldquo;{guest.wish_message}&rdquo;</p>
            </div>
          )}

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-sm sm:text-base font-bold text-[#D85C8A] hover:underline cursor-pointer min-h-[44px] inline-flex items-center font-invitation"
            >
              Thay đổi phản hồi của bạn
            </button>
          </div>
        </div>
      )}

      {/* Form tương tác RSVP */}
      {isEditing && (
        <form
          onSubmit={handleSubmit}
          className="relative bg-[#FFFDFD]/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(216,92,138,0.18)] border border-[#F3C6D6]/80 space-y-5 text-left overflow-hidden font-invitation"
        >
          <div className="absolute inset-3 border border-[#F3C6D6]/80 rounded-xl pointer-events-none" />
          {/* Lựa chọn 2 phương án */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedStatus('ACCEPTED')}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm sm:text-base border transition-all duration-200 active:scale-[0.98] min-h-[44px] cursor-pointer font-invitation ${
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
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm sm:text-base border transition-all duration-200 active:scale-[0.98] min-h-[44px] cursor-pointer font-invitation ${
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
                className="space-y-4 pt-1 font-invitation"
              >
                {/* Chọn số người tham dự */}
                <div className="space-y-2">
                  <label className="block text-sm sm:text-base font-bold text-[#5C1F38] font-invitation leading-relaxed">
                    Số người tham dự (bao gồm bạn):
                  </label>
                  <div className="flex gap-2 font-invitation">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setAttendeesCount(num)}
                        className={`flex-1 py-2.5 text-sm sm:text-base font-bold rounded-xl border transition-all active:scale-[0.98] min-h-[44px] cursor-pointer font-invitation ${
                          attendeesCount === num
                            ? 'bg-[#D85C8A] text-white border-[#D85C8A] shadow-xs ring-2 ring-[#D85C8A]/20'
                            : 'bg-[#FFF5F8] text-[#4A3B42] border-[#F6C1D3] hover:border-[#D85C8A]'
                        }`}
                      >
                        {num} người
                      </button>
                    ))}
                  </div>
                </div>

                {/* Yêu cầu bài hát (nếu được bật trong cài đặt sự kiện) */}
                {config.showSongRequest !== false && (
                  <div className="space-y-1.5 font-invitation">
                    <label htmlFor="song_request" className="block text-sm sm:text-base font-bold text-[#5C1F38] font-invitation leading-relaxed">
                      Gợi ý ca khúc bạn muốn lắng nghe trong đêm nhạc (không bắt buộc):
                    </label>
                    <input
                      id="song_request"
                      type="text"
                      maxLength={200}
                      value={songRequest}
                      onChange={(e) => setSongRequest(e.target.value)}
                      placeholder="Ví dụ: Nàng thơ, Có chàng trai viết lên cây, Khúc thụy du..."
                      className="w-full px-3.5 py-3 text-base sm:text-lg rounded-xl bg-[#FFF5F8] border border-[#F6C1D3] focus:outline-none focus:ring-1 focus:ring-[#D85C8A] text-[#4A3B42] placeholder:text-[#7D6670]/60 min-h-[44px] font-invitation leading-relaxed"
                    />
                  </div>
                )}

                {/* Lời chúc */}
                <div className="space-y-1.5 font-invitation">
                  <label htmlFor="wish_message_acc" className="block text-sm sm:text-base font-bold text-[#5C1F38] font-invitation leading-relaxed">
                    Lời chúc hoặc thông điệp gửi đến đêm nhạc (không bắt buộc):
                  </label>
                  <textarea
                    id="wish_message_acc"
                    rows={3}
                    maxLength={500}
                    value={wishMessage}
                    onChange={(e) => setWishMessage(e.target.value)}
                    placeholder="Gửi gắm đôi dòng cảm xúc của bạn..."
                    className="w-full px-3.5 py-2.5 text-base sm:text-lg rounded-xl bg-[#FFF5F8] border border-[#F6C1D3] focus:outline-none focus:ring-1 focus:ring-[#D85C8A] text-[#4A3B42] placeholder:text-[#7D6670]/60 resize-none font-invitation leading-relaxed"
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
                className="space-y-4 pt-1 font-invitation"
              >
                {/* Lời chúc khi từ chối */}
                <div className="space-y-1.5 font-invitation">
                  <label htmlFor="wish_message_dec" className="block text-sm sm:text-base font-bold text-[#5C1F38] font-invitation leading-relaxed">
                    Gửi lời chúc đến đêm nhạc (không bắt buộc):
                  </label>
                  <textarea
                    id="wish_message_dec"
                    rows={3}
                    maxLength={500}
                    value={wishMessage}
                    onChange={(e) => setWishMessage(e.target.value)}
                    placeholder="Dù không thể tham gia, hãy để lại lời chúc cho tụi mình nhé..."
                    className="w-full px-3.5 py-2.5 text-base sm:text-lg rounded-xl bg-[#FFF5F8] border border-[#F6C1D3] focus:outline-none focus:ring-1 focus:ring-[#D85C8A] text-[#4A3B42] placeholder:text-[#7D6670]/60 resize-none font-invitation leading-relaxed"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Báo lỗi nếu có */}
          {errorMessage && (
            <p className="text-sm text-rose-500 bg-rose-50 border border-rose-200 p-2.5 rounded-lg font-invitation leading-relaxed">
              {errorMessage}
            </p>
          )}

          {/* Nút gửi & nút hủy */}
          <div className="flex gap-2.5 pt-2 font-invitation">
            {hasAlreadyResponded && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-[#F6C1D3] text-sm sm:text-base font-bold text-[#7D6670] hover:bg-[#FFF5F8] transition-colors min-h-[44px] font-invitation"
              >
                Hủy bỏ
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-[#D85C8A] text-white font-bold text-base sm:text-lg shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px] font-invitation"
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
      <div className="text-center pt-2 text-sm sm:text-base text-[#7D6670] space-y-1 font-invitation leading-relaxed">
        <p>Cần hỗ trợ thêm thông tin sự kiện?</p>
        <a
          href={config.contactUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center font-bold text-[#D85C8A] hover:underline min-h-[44px] font-invitation text-base sm:text-lg"
        >
          {config.contactLabel}
        </a>
      </div>
    </section>
  );
}
