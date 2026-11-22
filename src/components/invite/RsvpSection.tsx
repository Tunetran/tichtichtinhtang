'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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

export function RsvpSection({
  guest,
  config = EVENT_CONFIG,
  onRsvpSuccess,
  logoUrl,
}: RsvpSectionProps) {
  const hasAlreadyResponded = guest.status === 'ACCEPTED' || guest.status === 'DECLINED';
  const [isEditing, setIsEditing] = useState(!hasAlreadyResponded);

  const [fullName, setFullName] = useState<string>(guest.full_name || '');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>(guest.wish_message || guest.song_request || '');
  const [attendanceChoice, setAttendanceChoice] = useState<'yes' | 'try' | 'unsure'>(
    guest.status === 'DECLINED' ? 'unsure' : 'yes'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const isAttending = attendanceChoice === 'yes' || attendanceChoice === 'try';
      const status = isAttending ? 'ACCEPTED' : 'DECLINED';

      const payload = {
        status,
        attendees_count: isAttending ? 1 : 0,
        phone: phone.trim() || null,
        email: email.trim() || null,
        wish_message: message.trim() || null,
        song_request: message.trim() || null,
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

      // Kích hoạt pháo hoa cánh hoa sen & lá tre khi đồng ý tham gia
      if (isAttending) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.75 },
            colors: ['#006C3A', '#A8D5BA', '#F4A7BB', '#FFF4D6'],
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
    <section className="space-y-6 pt-2 font-sans-ui" id="rsvp-section">
      {/* Huy hiệu Tiêu đề chuẩn Page 5 */}
      <div className="flex justify-center">
        <div className="px-6 py-2 rounded-full bg-[#FCEBE6] border border-[#F8C6D2] shadow-xs">
          <h2 className="font-serif-title text-xl sm:text-2xl font-bold tracking-normal text-[#3E3836] uppercase text-center">
            {config.rsvpHeading || 'XÁC NHẬN THAM DỰ'}
          </h2>
        </div>
      </div>

      <p className="text-center text-xs sm:text-sm text-[#61733F] max-w-sm mx-auto leading-relaxed px-4 tracking-normal font-sans-ui">
        {config.rsvpSubheading ||
          'Quý Thầy/Cô vui lòng gửi xác nhận để BTC sắp xếp chỗ ngồi và đón tiếp chu đáo nhất'}
      </p>

      {/* Hiển thị Vé kỷ niệm khi đã gửi phản hồi */}
      {hasAlreadyResponded && !isEditing ? (
        guest.status === 'ACCEPTED' ? (
          <MiniTicket
            guest={guest}
            config={config}
            logoUrl={logoUrl}
            onEdit={() => setIsEditing(true)}
          />
        ) : (
          <div className="relative bg-[#FFFDF9]/95 backdrop-blur-sm rounded-2xl p-6 sm:p-7 shadow-[0_15px_35px_-8px_rgba(0,108,58,0.12)] border border-[#C8E6C9] space-y-4 font-sans-ui text-center">
            <div className="flex items-center justify-center gap-2 text-[#61733F]">
              <CheckCircle2 className="w-5 h-5 text-[#006C3A]" />
              <p className="font-semibold text-sm sm:text-base text-[#3E3836] tracking-normal font-sans-ui">
                Bạn đã báo chưa chắc chắn hoặc không thể tham dự
              </p>
            </div>
            <p className="text-xs text-[#61733F] tracking-normal font-sans-ui leading-relaxed">
              The Light xin chân thành cảm ơn phản hồi của bạn. Chúc bạn luôn dồi dào sức khỏe!
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-[#006C3A] hover:underline cursor-pointer min-h-[44px] inline-flex items-center font-sans-ui"
              >
                Thay đổi xác nhận của bạn
              </button>
            </div>
          </div>
        )
      ) : (
        /* Form RSVP thiết kế theo chuẩn Page 5 với font UI Be_Vietnam_Pro */
        <form
          onSubmit={handleSubmit}
          className="relative bg-[#FFFDF9]/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,108,58,0.15)] border-2 border-[#F8C6D2]/80 space-y-5 text-left font-sans-ui overflow-hidden"
        >
          {/* 1. Họ và tên */}
          <div className="space-y-1.5">
            <label
              htmlFor="rsvp_name"
              className="block font-sans-ui text-sm sm:text-base font-semibold text-[#3E3836] tracking-normal"
            >
              Họ và tên
            </label>
            <input
              id="rsvp_name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên..."
              className="w-full px-4 py-3 rounded-xl bg-[#F7F5EE]/80 border border-[#D5DDD0] text-sm text-[#3E3836] placeholder:text-[#3E3836]/40 focus:outline-none focus:border-[#006C3A] focus:ring-1 focus:ring-[#006C3A] transition-colors font-sans-ui"
            />
          </div>

          {/* 2. Số điện thoại liên hệ */}
          <div className="space-y-1.5">
            <label
              htmlFor="rsvp_phone"
              className="block font-sans-ui text-sm sm:text-base font-semibold text-[#3E3836] tracking-normal"
            >
              Số điện thoại liên hệ
            </label>
            <input
              id="rsvp_phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại..."
              className="w-full px-4 py-3 rounded-xl bg-[#F7F5EE]/80 border border-[#D5DDD0] text-sm text-[#3E3836] placeholder:text-[#3E3836]/40 focus:outline-none focus:border-[#006C3A] focus:ring-1 focus:ring-[#006C3A] transition-colors font-sans-ui"
            />
          </div>

          {/* 3. Gmail */}
          <div className="space-y-1.5">
            <label
              htmlFor="rsvp_email"
              className="block font-sans-ui text-sm sm:text-base font-semibold text-[#3E3836] tracking-normal"
            >
              Gmail
            </label>
            <input
              id="rsvp_email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập địa chỉ email..."
              className="w-full px-4 py-3 rounded-xl bg-[#F7F5EE]/80 border border-[#D5DDD0] text-sm text-[#3E3836] placeholder:text-[#3E3836]/40 focus:outline-none focus:border-[#006C3A] focus:ring-1 focus:ring-[#006C3A] transition-colors font-sans-ui"
            />
          </div>

          {/* 4. Đôi lời gửi đến BTC */}
          <div className="space-y-1.5">
            <label
              htmlFor="rsvp_message"
              className="block font-sans-ui text-sm sm:text-base font-semibold text-[#3E3836] tracking-normal"
            >
              Đôi lời gửi đến BTC
            </label>
            <textarea
              id="rsvp_message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Gửi lời chúc, nhắn nhủ hoặc lưu ý đến The Light..."
              className="w-full px-4 py-3 rounded-xl bg-[#F7F5EE]/80 border border-[#D5DDD0] text-sm text-[#3E3836] placeholder:text-[#3E3836]/40 focus:outline-none focus:border-[#006C3A] focus:ring-1 focus:ring-[#006C3A] transition-colors resize-none font-sans-ui leading-relaxed"
            />
          </div>

          {/* 5. Xác nhận đến tham dự sự kiện (3 tùy chọn) */}
          <div className="space-y-2 pt-1">
            <label className="block font-sans-ui text-sm sm:text-base font-semibold text-[#3E3836] tracking-normal">
              Xác nhận đến tham dự sự kiện
            </label>
            <div className="space-y-2.5">
              {[
                { id: 'yes', label: 'Có tham gia' },
                { id: 'try', label: 'Sẽ cố gắng tham gia' },
                { id: 'unsure', label: 'Chưa rõ' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAttendanceChoice(opt.id as 'yes' | 'try' | 'unsure')}
                  className={`w-full py-3 px-4 rounded-xl text-left font-sans-ui text-sm sm:text-base transition-all flex items-center justify-between border cursor-pointer ${
                    attendanceChoice === opt.id
                      ? 'bg-[#E1EEDD] border-[#006C3A] text-[#006C3A] font-semibold shadow-xs'
                      : 'bg-[#ECEAE2]/60 hover:bg-[#ECEAE2] border-[#D5DDD0] text-[#3E3836]'
                  }`}
                >
                  <span className="tracking-normal">{opt.label}</span>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      attendanceChoice === opt.id
                        ? 'border-[#006C3A] bg-[#006C3A]'
                        : 'border-[#7D8C63] bg-transparent'
                    }`}
                  >
                    {attendanceChoice === opt.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Lỗi nếu có */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-sans-ui">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 6. Nút GỬI LỜI XÁC NHẬN */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#FAE8D8] hover:bg-[#F6DCBE] active:scale-[0.98] transition-all border border-[#F0D0B4] shadow-sm flex items-center justify-center cursor-pointer min-h-[48px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2 font-sans-ui text-base text-[#3E3836]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#006C3A]" />
                  <span>Đang gửi xác nhận...</span>
                </div>
              ) : (
                <span className="font-sans-ui text-base sm:text-lg text-[#3E3836] font-bold tracking-wider uppercase">
                  GỬI LỜI XÁC NHẬN
                </span>
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
