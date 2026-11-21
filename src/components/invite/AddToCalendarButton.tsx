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
  const startDate = config.eventDateIso ? new Date(config.eventDateIso) : new Date(2026, 1, 14, 19, 30);
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
    a.download = `dem-nhac-tinh-yeu.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left w-full sm:w-auto font-invitation">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-bg-surface hover:border-accent text-sm sm:text-base font-bold text-text shadow-sm transition-all duration-200 active:scale-[0.98] min-h-[44px] font-invitation cursor-pointer"
      >
        <CalendarPlus className="w-4 h-4 text-accent" />
        <span>Thêm vào lịch cá nhân</span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 sm:left-0 mt-2 w-56 rounded-xl bg-bg-surface border border-border shadow-xl z-50 py-1.5 animate-fadeIn font-invitation">
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm sm:text-base font-bold text-text hover:bg-bg transition-colors min-h-[44px] font-invitation"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Google Calendar</span>
            </a>

            <button
              type="button"
              onClick={handleDownloadIcs}
              className="w-full text-left flex items-center justify-between px-3.5 py-2.5 text-sm sm:text-base font-bold text-text hover:bg-bg transition-colors min-h-[44px] font-invitation cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Apple Calendar / Outlook (.ics)</span>
              </div>
              {isCopied && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
