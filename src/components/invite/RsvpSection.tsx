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

      // Kích hoạt confetti hạt vàng kim / đỏ rượu nếu đồng ý tham gia
      if (selectedStatus === 'ACCEPTED') {
        try {
          confetti({
            particleCount: 65,
            spread: 70,
            origin: { y: 0.72 },
            colors: ['#7A1835', '#C89B54', '#FAF6F0', '#E2C275', '#ECCF8A'],
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
    <section className="space-y-6 pt-6 border-t border-border/60">
      <div className="text-center space-y-1.5 px-2">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-text text-balance">
          {config.rsvpHeading || 'Xác Nhận Tham Dự'}
        </h3>
        <p className="text-xs sm:text-sm text-text-muted text-balance max-w-sm mx-auto">
          {config.rsvpSubheading || 'Sự hiện diện của bạn là niềm vinh hạnh lớn của chúng mình'}
        </p>
      </div>

      {/* Thẻ tóm tắt khi đã phản hồi và không ở chế độ sửa */}
      {hasAlreadyResponded && !isEditing && (
        <div className="editorial-card rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            {guest.status === 'ACCEPTED' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
            )}
            <div>
              <p className="font-semibold text-text text-sm">
                {guest.status === 'ACCEPTED'
                  ? `Bạn đã xác nhận tham dự cùng ${guest.attendees_count} người`
                  : 'Bạn đã báo không thể tham dự đêm nhạc'}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Cảm ơn bạn đã phản hồi cho Ban Tổ Chức
              </p>
            </div>
          </div>

          {guest.song_request && (
            <div className="text-xs bg-bg/70 p-3 rounded-xl border border-border/50 text-text space-y-1">
              <span className="text-accent flex items-center gap-1.5 font-semibold">
                <Music className="w-3.5 h-3.5" /> Ca khúc bạn yêu cầu:
              </span>
              <p className="italic pl-5 font-serif text-sm">&ldquo;{guest.song_request}&rdquo;</p>
            </div>
          )}

          {guest.wish_message && (
            <div className="text-xs bg-bg/70 p-3 rounded-xl border border-border/50 text-text space-y-1">
              <span className="text-accent flex items-center gap-1.5 font-semibold">
                <MessageSquareHeart className="w-3.5 h-3.5" /> Lời chúc của bạn:
              </span>
              <p className="italic pl-5 text-text-muted">&ldquo;{guest.wish_message}&rdquo;</p>
            </div>
          )}

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-accent hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
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
          className="editorial-card rounded-2xl p-5 sm:p-6 shadow-md space-y-5 text-left"
        >
          {/* Lựa chọn 2 phương án */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedStatus('ACCEPTED')}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-semibold text-xs sm:text-sm border transition-all duration-200 active:scale-[0.98] min-h-[44px] cursor-pointer ${
                selectedStatus === 'ACCEPTED'
                  ? 'bg-primary text-primary-fg border-primary shadow-md ring-2 ring-primary/20'
                  : 'bg-bg text-text border-border hover:border-accent'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  selectedStatus === 'ACCEPTED' ? 'fill-current text-primary-fg' : 'text-accent'
                }`}
              />
              <span>Tôi sẽ tham gia</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('DECLINED')}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-semibold text-xs sm:text-sm border transition-all duration-200 active:scale-[0.98] min-h-[44px] cursor-pointer ${
                selectedStatus === 'DECLINED'
                  ? 'bg-neutral-700 text-white border-neutral-700 shadow-md ring-2 ring-neutral-700/20'
                  : 'bg-bg text-text border-border hover:border-accent'
              }`}
            >
              <XCircle className="w-4 h-4 text-text-muted" />
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
                className="space-y-4 pt-1"
              >
                {/* Chọn số người tham dự */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-text">
                    Số người tham dự (bao gồm bạn):
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setAttendeesCount(num)}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all active:scale-[0.98] min-h-[44px] cursor-pointer ${
                          attendeesCount === num
                            ? 'bg-accent text-primary-fg border-accent shadow-sm ring-2 ring-accent/20'
                            : 'bg-bg text-text border-border hover:border-accent'
                        }`}
                      >
                        {num} người
                      </button>
                    ))}
                  </div>
                </div>

                {/* Yêu cầu bài hát (nếu được bật trong cài đặt sự kiện) */}
                {config.showSongRequest !== false && (
                  <div className="space-y-1.5">
                    <label htmlFor="song_request" className="block text-xs font-semibold text-text">
                      Gợi ý ca khúc bạn muốn lắng nghe trong đêm nhạc (không bắt buộc):
                    </label>
                    <input
                      id="song_request"
                      type="text"
                      maxLength={200}
                      value={songRequest}
                      onChange={(e) => setSongRequest(e.target.value)}
                      placeholder="Ví dụ: Nàng thơ, Có chàng trai viết lên cây, Khúc thụy du..."
                      className="w-full px-3.5 py-3 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:outline-none focus:ring-1 focus:ring-accent text-text placeholder:text-text-muted/60 min-h-[44px]"
                    />
                  </div>
                )}

                {/* Lời chúc */}
                <div className="space-y-1.5">
                  <label htmlFor="wish_message_acc" className="block text-xs font-semibold text-text">
                    Lời chúc hoặc thông điệp gửi đến đêm nhạc (không bắt buộc):
                  </label>
                  <textarea
                    id="wish_message_acc"
                    rows={3}
                    maxLength={500}
                    value={wishMessage}
                    onChange={(e) => setWishMessage(e.target.value)}
                    placeholder="Gửi gắm đôi dòng cảm xúc của bạn..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:outline-none focus:ring-1 focus:ring-accent text-text placeholder:text-text-muted/60 resize-none"
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
                className="space-y-4 pt-1"
              >
                {/* Lời chúc khi từ chối */}
                <div className="space-y-1.5">
                  <label htmlFor="wish_message_dec" className="block text-xs font-semibold text-text">
                    Gửi lời chúc đến đêm nhạc (không bắt buộc):
                  </label>
                  <textarea
                    id="wish_message_dec"
                    rows={3}
                    maxLength={500}
                    value={wishMessage}
                    onChange={(e) => setWishMessage(e.target.value)}
                    placeholder="Dù không thể tham gia, hãy để lại lời chúc cho tụi mình nhé..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:outline-none focus:ring-1 focus:ring-accent text-text placeholder:text-text-muted/60 resize-none"
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
                className="px-4 py-2.5 rounded-xl border border-border text-xs text-text-muted hover:bg-bg transition-colors min-h-[44px]"
              >
                Hủy bỏ
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-fg font-semibold text-xs sm:text-sm shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
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
      <div className="text-center pt-2 text-xs text-text-muted space-y-1">
        <p>Cần hỗ trợ thêm thông tin sự kiện?</p>
        <a
          href={config.contactUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center font-semibold text-accent hover:underline min-h-[44px]"
        >
          {config.contactLabel}
        </a>
      </div>
    </section>
  );
}
