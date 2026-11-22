'use client';

import { Users, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import type { AdminStats } from '@/types/guest';

interface StatsCardsProps {
  stats: AdminStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const pendingCount = Math.max(
    0,
    stats.totalInvites - stats.acceptedInvites - stats.declinedInvites
  );
  const openedTotal = stats.openedOnly + stats.acceptedInvites + stats.declinedInvites;

  const cards = [
    {
      title: 'Tổng khách',
      value: stats.totalInvites,
      subtext: 'Đã tạo trong hệ thống',
      icon: Users,
      color: 'text-[#006C3A]',
      bg: 'bg-[#006C3A]/10 border-[#006C3A]/20',
    },
    {
      title: 'Đồng ý tham gia',
      value: `${stats.acceptedInvites} lượt`,
      badge: `${stats.totalAttendees} người tham dự`,
      subtext: `Tổng ${stats.totalAttendees} ghế cần chuẩn bị`,
      icon: CheckCircle2,
      color: 'text-emerald-700 font-bold',
      bg: 'bg-emerald-50 border-emerald-200',
      highlight: true,
    },
    {
      title: 'Từ chối',
      value: stats.declinedInvites,
      subtext: 'Báo bận không đến',
      icon: XCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-200',
    },
    {
      title: 'Chưa phản hồi',
      value: pendingCount,
      subtext: 'Chưa gửi xác nhận RSVP',
      icon: Clock,
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      title: 'Đã mở thiệp',
      value: openedTotal,
      subtext: `${stats.openedOnly} chưa phản hồi`,
      icon: Eye,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 font-sans-ui">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`rounded-2xl border p-4 flex flex-col justify-between transition-all bg-bg-surface shadow-2xs ${
              card.highlight ? 'ring-1 ring-emerald-400/50' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-text-muted truncate">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg border shrink-0 ${card.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
            </div>

            <div className="mt-2.5 space-y-1">
              <p className={`text-xl sm:text-2xl font-bold tracking-tight text-text ${card.color}`}>
                {card.value}
              </p>
              {'badge' in card && card.badge && (
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100/90 text-emerald-800 text-[11px] font-bold border border-emerald-300/60 shadow-2xs">
                    👥 {card.badge}
                  </span>
                </div>
              )}
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
