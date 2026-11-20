'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Edit2,
  Trash2,
  MessageSquare,
  Music,
  UserCheck,
  Clock,
} from 'lucide-react';
import type { GuestRecord, GuestStatus } from '@/types/guest';
import { EVENT_CONFIG } from '@/config/event';
import { removeVietnameseTones } from '@/lib/slug';

interface GuestTableProps {
  guests: GuestRecord[];
  onRefresh: () => void;
  onEdit: (guest: GuestRecord) => void;
  onDelete: (id: string, name: string) => void;
}

type FilterTab = 'ALL' | GuestStatus;

export function GuestTable({ guests, onRefresh, onEdit, onDelete }: GuestTableProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [copiedZaloSlug, setCopiedZaloSlug] = useState<string | null>(null);

  // Sao chép an toàn vào Clipboard kèm fallback cho Safari / iframe
  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fallback qua textarea
      }
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  };

  const handleCopyLink = async (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const inviteUrl = `${origin}/invite/${slug}`;
    const ok = await copyTextToClipboard(inviteUrl);
    if (ok) {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  const handleCopyZalo = async (guest: GuestRecord) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const inviteUrl = `${origin}/invite/${guest.slug}`;
    const zaloMessage = `Trân trọng kính mời ${guest.full_name} tham dự ${EVENT_CONFIG.eventName}. Xem thiệp mời riêng tại đây nhé: ${inviteUrl}`;
    const ok = await copyTextToClipboard(zaloMessage);
    if (ok) {
      setCopiedZaloSlug(guest.slug);
      setTimeout(() => setCopiedZaloSlug(null), 2000);
    }
  };

  // Tính số lượng khách theo trạng thái cho các Tab
  const counts = useMemo(() => {
    return {
      ALL: guests.length,
      NOT_OPENED: guests.filter((g) => g.status === 'NOT_OPENED').length,
      OPENED: guests.filter((g) => g.status === 'OPENED').length,
      ACCEPTED: guests.filter((g) => g.status === 'ACCEPTED').length,
      DECLINED: guests.filter((g) => g.status === 'DECLINED').length,
    };
  }, [guests]);

  // Lọc và tìm kiếm
  const filteredGuests = useMemo(() => {
    let result = guests;

    if (activeTab !== 'ALL') {
      result = result.filter((g) => g.status === activeTab);
    }

    if (searchKeyword.trim()) {
      const normalizedKeyword = removeVietnameseTones(searchKeyword.trim().toLowerCase());
      result = result.filter((g) => {
        const normalizedName = removeVietnameseTones(g.full_name.toLowerCase());
        const normalizedMessage = g.custom_message
          ? removeVietnameseTones(g.custom_message.toLowerCase())
          : '';
        const normalizedSong = g.song_request
          ? removeVietnameseTones(g.song_request.toLowerCase())
          : '';
        return (
          normalizedName.includes(normalizedKeyword) ||
          normalizedMessage.includes(normalizedKeyword) ||
          normalizedSong.includes(normalizedKeyword) ||
          g.slug.includes(normalizedKeyword)
        );
      });
    }

    return result;
  }, [guests, activeTab, searchKeyword]);

  // Format thời gian kiểu Việt Nam: HH:mm dd/MM
  const formatTime = (isoString: string | null) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${hours}:${minutes} ${day}/${month}`;
    } catch {
      return null;
    }
  };

  // Status Badge UI
  const renderStatusBadge = (guest: GuestRecord) => {
    switch (guest.status) {
      case 'NOT_OPENED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            Chưa mở
          </span>
        );
      case 'OPENED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Đã mở
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Tham gia ({guest.attendees_count} người)
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Từ chối
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Thanh bộ lọc Tab & Ô tìm kiếm */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Các Tab lọc */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(
            [
              { key: 'ALL', label: 'Tất cả', count: counts.ALL },
              { key: 'NOT_OPENED', label: 'Chưa mở', count: counts.NOT_OPENED },
              { key: 'OPENED', label: 'Đã mở', count: counts.OPENED },
              { key: 'ACCEPTED', label: 'Tham gia', count: counts.ACCEPTED },
              { key: 'DECLINED', label: 'Từ chối', count: counts.DECLINED },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-fg border-primary shadow-sm'
                  : 'bg-bg-surface text-text-muted border-border hover:border-accent hover:text-text'
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-bg text-text-muted'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Ô tìm kiếm tức thời */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo tên, bài hát, lời nhắn..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-bg-surface border border-border focus:outline-none focus:ring-1 focus:ring-accent text-text placeholder:text-text-muted/60"
          />
        </div>
      </div>

      {/* Hiển thị số lượng kết quả */}
      <div className="text-xs text-text-muted px-1 flex items-center justify-between">
        <span>Hiển thị {filteredGuests.length} khách mời</span>
        {searchKeyword && (
          <button
            type="button"
            onClick={() => setSearchKeyword('')}
            className="text-accent hover:underline text-[11px]"
          >
            Xóa tìm kiếm
          </button>
        )}
      </div>

      {filteredGuests.length === 0 ? (
        <div className="bg-bg-surface border border-border rounded-2xl p-10 text-center space-y-2">
          <p className="text-sm font-medium text-text">Không tìm thấy khách mời nào</p>
          <p className="text-xs text-text-muted">
            Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.
          </p>
        </div>
      ) : (
        <>
          {/* 1. Desktop View: HTML Table */}
          <div className="hidden md:block bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg/70 border-b border-border/80 text-text-muted uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Khách Mời</th>
                    <th className="py-3 px-4 font-semibold">Trạng Thái</th>
                    <th className="py-3 px-4 font-semibold">Bài Hát & Lời Chúc</th>
                    <th className="py-3 px-4 font-semibold">Cập Nhật</th>
                    <th className="py-3 px-4 font-semibold text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredGuests.map((guest) => {
                    const isCopied = copiedSlug === guest.slug;
                    const isZaloCopied = copiedZaloSlug === guest.slug;
                    const updateTime = formatTime(guest.responded_at || guest.opened_at);

                    return (
                      <tr key={guest.id} className="hover:bg-bg/40 transition-colors">
                        {/* Cột 1: Tên & link */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-sm text-text">
                                {guest.full_name}
                              </span>
                              {guest.custom_message && (
                                <span
                                  title={`Lời nhắn riêng: ${guest.custom_message}`}
                                  className="inline-flex p-0.5 rounded text-accent bg-accent/10 cursor-help"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[11px] text-text-muted truncate max-w-[160px]">
                              /invite/{guest.slug}
                            </div>
                          </div>
                        </td>

                        {/* Cột 2: Trạng thái */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {renderStatusBadge(guest)}
                        </td>

                        {/* Cột 3: Bài hát & Lời chúc */}
                        <td className="py-3.5 px-4 max-w-[240px]">
                          <div className="space-y-1 text-xs">
                            {guest.song_request && (
                              <div className="flex items-center gap-1.5 text-accent font-medium truncate">
                                <Music className="w-3 h-3 shrink-0" />
                                <span className="truncate">&ldquo;{guest.song_request}&rdquo;</span>
                              </div>
                            )}
                            {guest.wish_message ? (
                              <p className="text-text-muted truncate italic text-[11px]">
                                &ldquo;{guest.wish_message}&rdquo;
                              </p>
                            ) : !guest.song_request ? (
                              <span className="text-text-muted/40">—</span>
                            ) : null}
                          </div>
                        </td>

                        {/* Cột 4: Thời gian */}
                        <td className="py-3.5 px-4 text-text-muted whitespace-nowrap text-[11px]">
                          {updateTime ? (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {updateTime}
                            </span>
                          ) : (
                            <span className="text-text-muted/40">—</span>
                          )}
                        </td>

                        {/* Cột 5: Cụm nút thao tác */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            {/* Copy Link */}
                            <button
                              type="button"
                              onClick={() => handleCopyLink(guest.slug)}
                              title="Sao chép đường dẫn thiệp mời"
                              className={`p-1.5 rounded-lg border transition-all text-xs flex items-center gap-1 ${
                                isCopied
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : 'bg-bg hover:bg-bg-surface text-text-muted hover:text-text border-border'
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-[10px] font-semibold text-emerald-600">Đã copy</span>
                                </>
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Copy Zalo */}
                            <button
                              type="button"
                              onClick={() => handleCopyZalo(guest)}
                              title="Sao chép tin nhắn gửi Zalo"
                              className={`p-1.5 rounded-lg border transition-all ${
                                isZaloCopied
                                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                                  : 'bg-bg hover:bg-bg-surface text-text-muted hover:text-text border-border'
                              }`}
                            >
                              {isZaloCopied ? (
                                <Check className="w-3.5 h-3.5 text-blue-600" />
                              ) : (
                                <Share2 className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Xem thử thiệp */}
                            <Link
                              href={`/invite/${guest.slug}`}
                              target="_blank"
                              title="Mở thiệp mời trong tab mới"
                              className="p-1.5 rounded-lg border border-border bg-bg hover:bg-bg-surface text-text-muted hover:text-text"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            {/* Sửa */}
                            <button
                              type="button"
                              onClick={() => onEdit(guest)}
                              title="Chỉnh sửa thông tin khách"
                              className="p-1.5 rounded-lg border border-border bg-bg hover:bg-bg-surface text-text-muted hover:text-text"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Xóa */}
                            <button
                              type="button"
                              onClick={() => onDelete(guest.id, guest.full_name)}
                              title="Xóa khách mời"
                              className="p-1.5 rounded-lg border border-border bg-bg hover:bg-rose-50 text-text-muted hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Mobile View: Responsive Cards List */}
          <div className="md:hidden space-y-3">
            {filteredGuests.map((guest) => {
              const isCopied = copiedSlug === guest.slug;
              const isZaloCopied = copiedZaloSlug === guest.slug;
              const updateTime = formatTime(guest.responded_at || guest.opened_at);

              return (
                <div
                  key={guest.id}
                  className="bg-bg-surface border border-border rounded-xl p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-semibold text-sm text-text">
                          {guest.full_name}
                        </h4>
                        {guest.custom_message && (
                          <span className="p-0.5 rounded text-accent bg-accent/10">
                            <MessageSquare className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[11px] text-text-muted">
                        /invite/{guest.slug}
                      </p>
                    </div>

                    <div>{renderStatusBadge(guest)}</div>
                  </div>

                  {guest.custom_message && (
                    <div className="text-xs bg-bg/80 p-2.5 rounded-lg border border-border/40 text-text italic">
                      <span className="not-italic text-[10px] uppercase font-bold text-accent block">
                        Lời nhắn riêng:
                      </span>
                      &ldquo;{guest.custom_message}&rdquo;
                    </div>
                  )}

                  {(guest.song_request || guest.wish_message) && (
                    <div className="space-y-1 text-xs border-t border-border/40 pt-2 text-text">
                      {guest.song_request && (
                        <p className="flex items-center gap-1.5 text-accent font-medium">
                          <Music className="w-3.5 h-3.5 shrink-0" />
                          <span>{guest.song_request}</span>
                        </p>
                      )}
                      {guest.wish_message && (
                        <p className="text-text-muted italic text-[11px]">
                          &ldquo;{guest.wish_message}&rdquo;
                        </p>
                      )}
                    </div>
                  )}

                  {updateTime && (
                    <div className="text-[11px] text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Cập nhật: {updateTime}</span>
                    </div>
                  )}

                  {/* Cụm nút thao tác mobile */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(guest.slug)}
                        className={`py-1.5 px-2.5 rounded-lg border text-xs flex items-center gap-1.5 ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-bg text-text-muted border-border'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-semibold text-emerald-600">Đã copy link</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyZalo(guest)}
                        className={`py-1.5 px-2.5 rounded-lg border text-xs flex items-center gap-1.5 ${
                          isZaloCopied
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : 'bg-bg text-text-muted border-border'
                        }`}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{isZaloCopied ? 'Đã copy Zalo' : 'Zalo'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/invite/${guest.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg border border-border bg-bg text-text-muted"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onEdit(guest)}
                        className="p-1.5 rounded-lg border border-border bg-bg text-text-muted"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(guest.id, guest.full_name)}
                        className="p-1.5 rounded-lg border border-border bg-bg text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
