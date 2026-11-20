import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Music,
  Shirt,
  ExternalLink,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { EVENT_CONFIG } from '@/config/event';

export default function HomePage() {
  return (
    <main
      suppressHydrationWarning
      className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12"
    >
      <div className="w-full max-w-[460px] bg-bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-7">
        {/* Biểu tượng âm nhạc mở màn */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto ring-8 ring-primary/5">
          <Music className="w-7 h-7" />
        </div>

        {/* Lời mở đầu lãng mạn */}
        <div className="space-y-2">
          <p className="font-script text-2xl sm:text-3xl text-accent font-semibold">
            Đêm Nhạc Tình Yêu
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-text leading-snug">
            {EVENT_CONFIG.eventName}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted italic max-w-xs mx-auto leading-relaxed">
            &ldquo;{EVENT_CONFIG.slogan}&rdquo;
          </p>
        </div>

        {/* Đường kẻ trang trí */}
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-border" />
          <Heart className="w-3.5 h-3.5 text-accent fill-accent" />
          <span className="h-px w-16 bg-border" />
        </div>

        {/* Khối thông tin thời gian & địa điểm */}
        <div className="border border-border/70 rounded-2xl p-4 sm:p-5 bg-bg/50 space-y-3.5 text-xs sm:text-sm text-left">
          <div className="flex items-start gap-3 text-text">
            <Calendar className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">{EVENT_CONFIG.eventDateLabel}</span>
              <span className="text-[11px] text-text-muted flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3" /> Đón khách: {EVENT_CONFIG.checkinTime} • Bắt đầu: {EVENT_CONFIG.startTime}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-text border-t border-border/40 pt-3">
            <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">{EVENT_CONFIG.venueName}</span>
              <span className="text-[11px] text-text-muted leading-relaxed block mt-0.5">
                {EVENT_CONFIG.venueAddress}
              </span>
              <a
                href={EVENT_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-accent font-medium hover:underline mt-1.5"
              >
                <span>Xem trên Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 text-text border-t border-border/40 pt-3">
            <Shirt className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Trang phục (Dress code)</span>
              <span className="text-[11px] text-text-muted leading-relaxed block mt-0.5">
                {EVENT_CONFIG.dresscodeDescription}
              </span>
              <div className="flex items-center gap-2 mt-2">
                {EVENT_CONFIG.dresscodeColors.map((color) => (
                  <div key={color.name} className="flex items-center gap-1">
                    <span
                      className="w-3 h-3 rounded-full border border-black/15 shrink-0 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[10px] text-text-muted">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Thông báo quan trọng về đường dẫn cá nhân */}
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 text-xs text-text-muted leading-relaxed space-y-1.5">
          <p className="font-semibold text-text flex items-center justify-center gap-1.5 text-xs sm:text-sm">
            <span>💌</span>
            <span>Thiệp Mời Điện Tử Cá Nhân Hóa</span>
          </p>
          <p>
            Mỗi khách mời đều có một đường dẫn riêng biệt để mở phong bì niêm phong và gửi xác nhận tham dự (RSVP).
          </p>
          <p className="text-[11px] text-text-muted/80">
            Vui lòng kiểm tra lại liên kết trong tin nhắn Zalo hoặc Messenger mà Ban Tổ Chức đã gửi cho bạn.
          </p>
        </div>

        {/* Chân trang & liên hệ */}
        <footer className="pt-2 text-xs text-text-muted space-y-2">
          <p>
            Cần liên hệ Ban Tổ Chức?{' '}
            <a
              href={EVENT_CONFIG.contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent hover:underline"
            >
              {EVENT_CONFIG.contactLabel}
            </a>
          </p>

          <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-text-muted/60">
            <span>© 2026 {EVENT_CONFIG.eventName}</span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 hover:text-accent transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Quản trị viên</span>
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
