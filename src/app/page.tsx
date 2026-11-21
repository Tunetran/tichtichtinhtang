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
  Sparkles,
} from 'lucide-react';
import { getEventConfig } from '@/lib/event-settings';
import { getSiteSettings } from '@/lib/site-settings';
import { EventCountdown } from '@/components/invite/EventCountdown';
import { AddToCalendarButton } from '@/components/invite/AddToCalendarButton';
import { GuestLookup } from '@/components/home/GuestLookup';
import { EventLogoImage } from '@/components/common/EventLogoImage';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [config, siteSettings] = await Promise.all([
    getEventConfig(),
    getSiteSettings(),
  ]);

  const logoUrl = siteSettings.event_logo_url;

  return (
    <main
      suppressHydrationWarning
      className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 pb-safe pt-safe min-h-[100dvh]"
    >
      <div className="w-full max-w-[480px] editorial-card rounded-3xl p-6 sm:p-8 text-center space-y-7 shadow-2xl">
        {/* Logo sự kiện hoặc Logo mặc định */}
        <EventLogoImage src={logoUrl} />

        {/* Lời mở đầu lãng mạn */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-[#D85C8A] font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>{config.invitationBadge || 'Thư Mời Tham Dự'}</span>
            <Sparkles className="w-3 h-3" />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#5C1F38] leading-snug text-balance">
            {config.eventName}
          </h1>

          <p className="text-xs sm:text-sm text-[#7D6670] italic max-w-sm mx-auto leading-relaxed text-balance">
            &ldquo;{config.slogan}&rdquo;
          </p>
        </div>

        {/* Đường kẻ trang trí */}
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-[#F6C1D3]" />
          <Heart className="w-3.5 h-3.5 text-[#D85C8A] fill-[#D85C8A]" />
          <span className="h-px w-16 bg-[#F6C1D3]" />
        </div>

        {/* Live Countdown Timer */}
        {config.showCountdown !== false && (
          <EventCountdown targetDateIso={config.eventDateIso} />
        )}

        {/* Khối thông tin thời gian & địa điểm */}
        <div className="border border-border/70 rounded-2xl p-4 sm:p-5 bg-bg/60 space-y-3.5 text-xs sm:text-sm text-left shadow-2xs">
          <div className="flex items-start gap-3 text-text">
            <Calendar className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-sm">{config.eventDateLabel}</span>
              <span className="text-[11px] text-text-muted flex items-center gap-1.5 mt-0.5 font-mono tabular-nums">
                <Clock className="w-3 h-3" /> Đón khách: {config.checkinTime} • Bắt đầu: {config.startTime}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-text border-t border-border/40 pt-3">
            <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-sm">{config.venueName}</span>
              <span className="text-[11px] text-text-muted leading-relaxed block mt-0.5">
                {config.venueAddress}
              </span>
              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-accent font-semibold hover:underline mt-1.5 min-h-[36px]"
              >
                <span>Xem trên Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 text-text border-t border-border/40 pt-3">
            <Shirt className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Trang phục gợi ý (Dress code)</span>
              <span className="text-[11px] text-text-muted leading-relaxed block mt-0.5">
                {config.dresscodeDescription}
              </span>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {config.dresscodeColors.map((color) => (
                  <div key={color.name} className="flex items-center gap-1 bg-bg-surface px-2 py-0.5 rounded-full border border-border">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0 shadow-2xs"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[10px] text-text-muted">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/40">
            <AddToCalendarButton config={config} />
          </div>
        </div>

        {/* Tra cứu thiệp mời dành cho khách mời */}
        <GuestLookup />

        {/* Chân trang & liên hệ */}
        <footer className="pt-2 text-xs text-text-muted space-y-2">
          <p>
            Cần liên hệ Ban Tổ Chức?{' '}
            <a
              href={config.contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent hover:underline min-h-[44px] inline-flex items-center"
            >
              {config.contactLabel}
            </a>
          </p>

          <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-text-muted/60">
            <span>© {new Date().getFullYear()} {config.eventName}</span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 hover:text-accent transition-colors p-2 -mr-2"
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
