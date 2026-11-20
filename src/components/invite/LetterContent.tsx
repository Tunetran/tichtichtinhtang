'use client';

import { Calendar, Clock, MapPin, Shirt, Music, ExternalLink } from 'lucide-react';
import type { GuestRecord } from '@/types/guest';
import { EVENT_CONFIG } from '@/config/event';
import { PhotoGallery } from './PhotoGallery';
import { RsvpSection } from './RsvpSection';

interface LetterContentProps {
  guest: GuestRecord;
  onRsvpUpdated: (updated: GuestRecord) => void;
}

export function LetterContent({ guest, onRsvpUpdated }: LetterContentProps) {
  return (
    <article className="w-full max-w-[460px] mx-auto px-4 sm:px-5 py-10 space-y-10 text-text">
      {/* 1. Header Đêm Nhạc */}
      <header className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto mb-1">
          <Music className="w-6 h-6" />
        </div>
        <p className="font-script text-2xl sm:text-3xl text-accent font-medium">
          Thiệp Mời
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-text leading-snug">
          {EVENT_CONFIG.eventName}
        </h1>
        <p className="text-sm text-text-muted italic max-w-sm mx-auto">
          &ldquo;{EVENT_CONFIG.slogan}&rdquo;
        </p>

        {/* Đường kẻ trang trí với nốt nhạc */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className="h-px w-16 bg-border" />
          <Music className="w-3.5 h-3.5 text-accent" />
          <span className="h-px w-16 bg-border" />
        </div>
      </header>

      {/* 2. Lời Ngỏ Cá Nhân */}
      <section className="bg-bg-surface/80 border border-border/70 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4 leading-relaxed">
        <h2 className="font-script text-2xl sm:text-3xl text-accent font-semibold">
          Thân gửi {guest.full_name},
        </h2>

        {EVENT_CONFIG.generalInvitationText.map((paragraph, index) => (
          <p key={index} className="text-[15px] text-text/90">
            {paragraph}
          </p>
        ))}

        {/* Khối lời nhắn riêng cho khách mời (nếu có) */}
        {guest.custom_message && (
          <div className="mt-4 p-4 rounded-xl bg-accent/5 border-l-4 border-accent text-sm text-text italic space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent not-italic">
              Lời nhắn riêng gửi bạn:
            </p>
            <p className="leading-relaxed">&ldquo;{guest.custom_message}&rdquo;</p>
          </div>
        )}
      </section>

      {/* 3. Khối Thông Tin Chính & Địa Điểm */}
      <section className="bg-bg-surface/80 border border-border/70 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
        <h3 className="font-serif text-lg sm:text-xl font-semibold text-text text-center border-b border-border/60 pb-3">
          Thông Tin Sự Kiện
        </h3>

        <div className="space-y-4 text-sm">
          {/* Thời gian */}
          <div className="flex items-start gap-3.5">
            <Calendar className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text">{EVENT_CONFIG.eventDateLabel}</p>
              <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Đón khách: {EVENT_CONFIG.checkinTime} • Bắt đầu: {EVENT_CONFIG.startTime}
                </span>
              </div>
            </div>
          </div>

          {/* Địa điểm */}
          <div className="flex items-start gap-3.5">
            <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div>
                <p className="font-semibold text-text">{EVENT_CONFIG.venueName}</p>
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                  {EVENT_CONFIG.venueAddress}
                </p>
              </div>

              <a
                href={EVENT_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20 transition-colors"
              >
                <span>Xem bản đồ (Google Maps)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Dresscode */}
          <div className="flex items-start gap-3.5 pt-2 border-t border-border/50">
            <Shirt className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div>
                <p className="font-semibold text-text">Trang phục gợi ý (Dress code)</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {EVENT_CONFIG.dresscodeDescription}
                </p>
              </div>

              {/* Bảng màu mẫu */}
              <div className="flex flex-wrap gap-2 pt-1">
                {EVENT_CONFIG.dresscodeColors.map((color) => (
                  <div
                    key={color.name}
                    className="flex items-center gap-1.5 bg-bg border border-border/70 rounded-full px-2.5 py-1 text-xs"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[11px] text-text-muted">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Timeline Buổi Diễn */}
      <section className="bg-bg-surface/80 border border-border/70 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
        <h3 className="font-serif text-lg sm:text-xl font-semibold text-text text-center border-b border-border/60 pb-3">
          Lịch Trình Đêm Nhạc
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-accent/30">
          {EVENT_CONFIG.timeline.map((item, index) => (
            <div key={index} className="relative">
              {/* Chấm mốc timeline */}
              <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-bg-surface bg-accent shadow-sm" />

              <div className="space-y-0.5">
                <span className="inline-block text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                  {item.time}
                </span>
                <p className="font-medium text-sm text-text mt-1">{item.title}</p>
                {item.description && (
                  <p className="text-xs text-text-muted leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Bộ Sưu Tập Ảnh */}
      <PhotoGallery gallery={EVENT_CONFIG.gallery} theme={EVENT_CONFIG.theme} />

      {/* 6. Form Xác Nhận RSVP */}
      <RsvpSection guest={guest} onRsvpSuccess={onRsvpUpdated} />

      {/* 7. Footer & Chữ ký Host */}
      <footer className="text-center pt-8 pb-6 border-t border-border/50 space-y-3">
        <p className="text-xs text-text-muted">
          Rất mong được gặp bạn trong đêm nhạc ấm áp này
        </p>
        <p className="font-script text-2xl sm:text-3xl text-accent font-semibold">
          {EVENT_CONFIG.hostName}
        </p>
        <p className="text-[11px] text-text-muted/60 pt-2">
          © 2026 {EVENT_CONFIG.eventName}
        </p>
      </footer>
    </article>
  );
}
