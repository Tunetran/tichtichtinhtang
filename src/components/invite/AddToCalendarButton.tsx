'use client';

import { useState } from 'react';
import { CalendarPlus, Check, ChevronDown } from 'lucide-react';
import type { EventConfig } from '@/config/event';

interface AddToCalendarButtonProps {
  config: EventConfig;
}

export function AddToCalendarButton({ config }: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Parse start and end time
  const startDate = config.eventDateIso ? new Date(config.eventDateIso) : new Date(2026, 11, 5, 18, 30);
  const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours duration

  const formatGoogleDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    config.eventName
  )}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${encodeURIComponent(
    `${config.slogan}\n\nDress code: ${config.dresscodeDescription}\nChủ trì: ${config.hostName}`
  )}&location=${encodeURIComponent(`${config.venueName}, ${config.venueAddress}`)}`;

  const handleDownloadIcs = () => {
    const formatIcsDate = (d: Date) => {
      return d.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MusicNightCard//Concert Invite//VI',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@musicnightcard.vn`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:${config.eventName}`,
      `DESCRIPTION:${config.slogan} - Host: ${config.hostName}`,
      `LOCATION:${config.venueName}\\, ${config.venueAddress}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tich-tich-tinh-tang.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex justify-center font-sans-ui">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Thêm sự kiện vào lịch của bạn"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap font-sans-ui bg-white/95 hover:bg-[#E8F5E9] text-[#006C3A] border border-[#C8E6C9] hover:border-[#006C3A] shadow-xs hover:shadow-sm active:scale-[0.98] transition-all duration-200 cursor-pointer min-h-[42px] select-none"
      >
        <CalendarPlus className="w-4 h-4 text-[#006C3A] shrink-0" />
        <span className="whitespace-nowrap font-sans-ui">Thêm vào lịch của bạn</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#61733F] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-full left-0 mb-2 z-50 min-w-[200px] w-64 rounded-2xl bg-[#FFFDF9] border border-[#C8E6C9] shadow-[0_12px_30px_-5px_rgba(0,108,58,0.18)] py-2 font-sans-ui overflow-hidden animate-fadeIn">
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-[#3E3836] hover:bg-[#E8F5E9] hover:text-[#006C3A] transition-colors min-h-[42px] font-sans-ui"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <span>Google Calendar</span>
            </a>

            <button
              type="button"
              onClick={handleDownloadIcs}
              className="w-full text-left flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-medium text-[#3E3836] hover:bg-[#E8F5E9] hover:text-[#006C3A] transition-colors min-h-[42px] font-sans-ui cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span>Apple Calendar / Outlook (.ics)</span>
              </div>
              {isCopied && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
