import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { getEventConfig } from '@/lib/event-settings';
import { getSiteSettings } from '@/lib/site-settings';
import { EventCountdown } from '@/components/invite/EventCountdown';
import { AddToCalendarButton } from '@/components/invite/AddToCalendarButton';
import { GuestLookup } from '@/components/home/GuestLookup';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [config, siteSettings] = await Promise.all([
    getEventConfig(),
    getSiteSettings(),
  ]);

  const logoUrl = siteSettings.event_logo_url || '/images/logo-tichtichtinhtang.png';
  const bgUrl = siteSettings.event_bg_url || '/images/bg-bamboo-lotus.png';

  return (
    <main
      suppressHydrationWarning
      className="relative flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 pb-safe pt-safe min-h-[100dvh] overflow-x-hidden"
    >
      {/* Nền phong cảnh Hồ sen & Rặng tre */}
      <div className="fixed inset-0 -z-20 pointer-events-none select-none overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgUrl}
          alt="Nền sự kiện"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[0.5px]" />
      </div>

      <div className="w-full max-w-[500px] bg-[#FFFDF9]/95 backdrop-blur-sm rounded-3xl border border-[#C8E6C9] p-6 sm:p-9 text-center space-y-7 shadow-[0_25px_60px_-15px_rgba(0,108,58,0.2)] relative z-10 font-sans-ui">
        {/* Logo sự kiện Tịch Tịch Tình Tang */}
        <div className="w-56 sm:w-64 mx-auto flex items-center justify-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="Tịch Tịch Tình Tang"
            className="w-full h-auto object-contain drop-shadow-md"
          />
        </div>

        {/* Lời mở đầu trang trọng */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-[#006C3A] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#006C3A]" />
            <span>{config.invitationBadge || 'Thư Mời Tham Dự'}</span>
            <Sparkles className="w-3.5 h-3.5 text-[#006C3A]" />
          </div>

          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold tracking-tight text-[#006C3A] leading-snug text-balance">
            {config.eventName}
          </h1>

          <p className="text-xs sm:text-sm text-[#61733F] italic max-w-sm mx-auto leading-relaxed text-balance">
            &ldquo;{config.slogan}&rdquo;
          </p>
        </div>

        {/* Đường kẻ hoa sen */}
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-[#C8E6C9]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/lotus-petal.png" alt="" className="w-4 h-4 object-contain opacity-80" />
          <span className="h-px w-16 bg-[#C8E6C9]" />
        </div>

        {/* Live Countdown Timer */}
        {config.showCountdown !== false && (
          <EventCountdown targetDateIso={config.eventDateIso} />
        )}

        {/* Khối thông tin thời gian & địa điểm */}
        <div className="border border-[#C8E6C9] rounded-2xl p-5 bg-[#EAF4E6]/60 space-y-4 text-xs sm:text-sm text-left shadow-2xs">
          {/* Thời gian */}
          <div className="flex items-start gap-3 text-[#3E3836]">
            <Calendar className="w-4 h-4 text-[#006C3A] shrink-0 mt-0.5" />
            <div>
              <span className="font-serif text-base sm:text-lg font-bold text-[#006C3A] block">
                {config.eventDateLabel}
              </span>
              <span className="text-xs text-[#61733F] flex items-center gap-1.5 mt-0.5 tabular-nums">
                <Clock className="w-3 h-3 text-[#006C3A]" />
                Đón khách: {config.checkinTime} • Bắt đầu: {config.startTime} - {config.endTime || '19:30'}
              </span>
            </div>
          </div>

          {/* Địa điểm */}
          <div className="flex items-start gap-3 text-[#3E3836] border-t border-[#C8E6C9]/60 pt-3">
            <MapPin className="w-4 h-4 text-[#006C3A] shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <span className="inline-block px-2 py-0.5 rounded bg-[#006C3A] text-white text-[11px] font-bold">
                {config.venueHall || 'HỘI TRƯỜNG B'}
              </span>
              <p className="font-serif text-sm sm:text-base font-bold text-[#006C3A]">
                {config.venueName}
              </p>
              <p className="text-xs text-[#61733F] leading-relaxed">
                {config.venueAddress}
              </p>
              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#006C3A] font-bold underline underline-offset-2 hover:text-[#016748] mt-1 min-h-[36px]"
              >
                <span>Xem định vị Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Dresscode 3 phong cách */}
          <div className="border-t border-[#C8E6C9]/60 pt-3 space-y-2">
            <p className="font-serif text-xs font-bold text-[#006C3A] uppercase tracking-wider">
              Gợi ý trang phục (Dress code)
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="space-y-1">
                <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border border-[#C8E6C9] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/dresscode-1-smart.png" alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-bold text-[#3E3836] block">ĐỒ LỊCH SỰ</span>
              </div>
              <div className="space-y-1">
                <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border border-[#F8B4C4] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/dresscode-2-aodai.png" alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-bold text-[#3E3836] block">ÁO DÀI</span>
              </div>
              <div className="space-y-1">
                <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border border-[#FAD8C0] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/dresscode-3-traditional.png" alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-bold text-[#3E3836] block leading-tight">CỔ PHỤC</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#C8E6C9]/60">
            <AddToCalendarButton config={config} />
          </div>
        </div>

        {/* Tra cứu thiệp mời dành cho khách mời */}
        <GuestLookup />

        {/* Chân trang & liên hệ */}
        <footer className="pt-2 text-xs text-[#61733F] space-y-2">
          <p>
            Cần liên hệ Ban Tổ Chức?{' '}
            <a
              href={config.contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#006C3A] hover:underline min-h-[44px] inline-flex items-center"
            >
              {config.contactLabel}
            </a>
          </p>

          <div className="pt-3 border-t border-[#C8E6C9]/60 flex items-center justify-between text-[11px] text-[#61733F]/70">
            <span>© {new Date().getFullYear()} Tịch Tịch Tình Tang — {config.hostName}</span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 hover:text-[#006C3A] transition-colors p-2 -mr-2"
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
