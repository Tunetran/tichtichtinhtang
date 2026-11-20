'use client';

import { Users, MailQuestion, Eye, CheckCircle2, XCircle } from 'lucide-react';
import type { AdminStats } from '@/types/guest';

interface StatsCardsProps {
  stats: AdminStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Tổng thiệp đã tạo',
      value: stats.totalInvites,
      subtext: 'Tổng số đường dẫn mời',
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10 border-primary/20',
    },
    {
      title: 'Chưa mở thiệp',
      value: stats.notOpened,
      subtext: 'Chưa từng mở link',
      icon: MailQuestion,
      color: 'text-neutral-500',
      bg: 'bg-neutral-100 border-neutral-200',
    },
    {
      title: 'Đã mở — Chưa trả lời',
      value: stats.openedOnly,
      subtext: 'Đã xem nhưng chưa RSVP',
      icon: Eye,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      title: 'Đồng ý tham gia',
      value: `${stats.totalAttendees} khách`,
      subtext: `từ ${stats.acceptedInvites} thiệp xác nhận`,
      icon: CheckCircle2,
      color: 'text-emerald-600 font-bold',
      bg: 'bg-emerald-50 border-emerald-200',
      highlight: true,
    },
    {
      title: 'Từ chối tham dự',
      value: stats.declinedInvites,
      subtext: 'Báo bận không thể đến',
      icon: XCircle,
      color: 'text-rose-500',
      bg: 'bg-rose-50 border-rose-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`rounded-xl border p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 bg-bg-surface ${
              card.highlight ? 'ring-1 ring-emerald-400/40 shadow-sm' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-text-muted line-clamp-1">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg border shrink-0 ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>

            <div className="mt-3">
              <p className={`text-xl sm:text-2xl font-bold tracking-tight text-text ${card.color}`}>
                {card.value}
              </p>
              <p className="text-[11px] text-text-muted mt-0.5 truncate">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
