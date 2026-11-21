'use client';

import { Music, MessageSquareHeart, UserCheck } from 'lucide-react';
import type { GuestRecord } from '@/types/guest';

interface SongRequestsTabProps {
  guests: GuestRecord[];
}

export function SongRequestsTab({ guests }: SongRequestsTabProps) {
  // Lọc các khách đã đồng ý tham gia và có yêu cầu bài hát
  const songRequests = guests.filter(
    (g) => g.status === 'ACCEPTED' && g.song_request && g.song_request.trim().length > 0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold text-text">
            Danh Sách Lời Nhắn ({songRequests.length})
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Tổng hợp các lời nhắn được khách mời gửi gắm đến đêm nhạc
          </p>
        </div>
      </div>

      {songRequests.length === 0 ? (
        <div className="bg-bg-surface border border-border rounded-xl p-8 text-center space-y-2">
          <Music className="w-8 h-8 text-accent/50 mx-auto" />
          <p className="text-sm font-medium text-text">Chưa có lời nhắn nào</p>
          <p className="text-xs text-text-muted">
            Khi khách mời xác nhận tham gia và gửi lời nhắn, danh sách sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {songRequests.map((guest, idx) => (
            <div
              key={guest.id}
              className="bg-bg-surface border border-border rounded-xl p-4 shadow-sm space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded shrink-0 mt-0.5">
                    #{idx + 1}
                  </span>
                  <h4 className="font-serif font-semibold text-base text-text leading-snug">
                    {guest.song_request}
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-xs text-text-muted pl-8">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Khách gửi: <strong className="text-text">{guest.full_name}</strong> (đi cùng {guest.attendees_count} người)
                  </span>
                </div>
              </div>

              {guest.wish_message && (
                <div className="text-xs bg-bg/70 p-2.5 rounded-lg border border-border/40 text-text-muted flex items-start gap-2 italic">
                  <MessageSquareHeart className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  <span className="line-clamp-2">
                    <strong className="not-italic text-accent mr-1">Ghi chú riêng BTC:</strong>
                    &ldquo;{guest.wish_message}&rdquo;
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
