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
  Phone,
  Mail,
  Download,
  Loader2,
} from 'lucide-react';
import type { GuestRecord, GuestStatus } from '@/types/guest';
import { EVENT_CONFIG } from '@/config/event';
import { removeVietnameseTones } from '@/lib/slug';
import { parseGuestContact } from '@/lib/guest-contact';

interface GuestTableProps {
  guests: GuestRecord[];
  eventName?: string;
  onRefresh: () => void;
  onEdit: (guest: GuestRecord) => void;
  onDelete: (id: string, name: string) => void;
  onExportCSV?: () => void;
}

type FilterTab = 'ALL' | GuestStatus;

export function GuestTable({ guests, eventName, onRefresh, onEdit, onDelete, onExportCSV }: GuestTableProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [copiedZaloSlug, setCopiedZaloSlug] = useState<string | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [clearingWishId, setClearingWishId] = useState<string | null>(null);

  // Xóa lời chúc công khai của khách (chỉ làm rỗng lời chúc note, giữ nguyên SĐT/Email/RSVP)
  const handleClearWish = async (guest: GuestRecord) => {
    const contact = parseGuestContact(guest);
    const wishText = contact.note.trim();
    if (!wishText) return;

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa lời chúc của khách "${guest.full_name}" khỏi trang thiệp công khai?\n(Thông tin SĐT, Email và trạng thái tham dự RSVP của khách vẫn được giữ nguyên).`
    );
    if (!confirmed) return;

    setClearingWishId(guest.id);
    try {
      let newWishMessage: string | null = null;
      if (contact.phone || contact.email) {
        newWishMessage = JSON.stringify({
          phone: contact.phone || '',
          email: contact.email || '',
          note: '',
        });
      }

      const res = await fetch(`/api/admin/guests/${guest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          song_request: null,
          wish_message: newWishMessage,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || 'Không thể xóa lời chúc');
      }

      onRefresh();
    } catch (err) {
      alert((err as Error).message || 'Lỗi khi xóa lời chúc');
    } finally {
      setClearingWishId(null);
    }
  };

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
    const concertTitle = eventName || EVENT_CONFIG.eventName;
    const zaloMessage = `Trân trọng kính mời ${guest.full_name} tham dự ${concertTitle}. Xem thiệp mời riêng tại đây nhé: ${inviteUrl}`;
    const ok = await copyTextToClipboard(zaloMessage);
    if (ok) {
      setCopiedZaloSlug(guest.slug);
      setTimeout(() => setCopiedZaloSlug(null), 2000);
    }
  };

  const handleCopyPhone = async (id: string, phone: string) => {
    const ok = await copyTextToClipboard(phone);
    if (ok) {
      setCopiedPhoneId(id);
      setTimeout(() => setCopiedPhoneId(null), 2000);
    }
  };

  const handleCopyEmail = async (id: string, email: string) => {
    const ok = await copyTextToClipboard(email);
    if (ok) {
      setCopiedEmailId(id);
      setTimeout(() => setCopiedEmailId(null), 2000);
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
      const rawKeyword = searchKeyword.trim().toLowerCase();
      const normalizedKeyword = removeVietnameseTones(rawKeyword);
      result = result.filter((g) => {
        const contact = parseGuestContact(g);
        const normalizedName = removeVietnameseTones(g.full_name.toLowerCase());
        const normalizedMessage = g.custom_message
          ? removeVietnameseTones(g.custom_message.toLowerCase())
          : '';
        const normalizedSong = g.song_request
          ? removeVietnameseTones(g.song_request.toLowerCase())
          : '';
        const normalizedNote = contact.note
          ? removeVietnameseTones(contact.note.toLowerCase())
          : '';

        return (
          normalizedName.includes(normalizedKeyword) ||
          normalizedMessage.includes(normalizedKeyword) ||
          normalizedSong.includes(normalizedKeyword) ||
          normalizedNote.includes(normalizedKeyword) ||
          contact.phone.toLowerCase().includes(rawKeyword) ||
          contact.email.toLowerCase().includes(rawKeyword) ||
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

        {/* Ô tìm kiếm tức thời & nút xuất CSV */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo tên, SĐT, Email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-bg-surface border border-border focus:outline-none focus:ring-1 focus:ring-accent text-text placeholder:text-text-muted/60"
            />
          </div>

          {onExportCSV && (
            <button
              type="button"
              onClick={onExportCSV}
              disabled={guests.length === 0}
              className="py-1.5 px-3 rounded-xl border border-border bg-bg-surface hover:border-accent text-xs font-medium text-text transition-all flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer shrink-0"
              title="Tải danh sách khách mời (CSV Excel)"
            >
              <Download className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">Xuất CSV</span>
            </button>
          )}
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
          {/* Bảng khách mời bọc trong overflow-x-auto để vuốt ngang mượt trên mọi kích thước */}
          <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="bg-bg/70 border-b border-border/80 text-text-muted uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Tên Khách</th>
                    <th className="py-3 px-3 font-semibold">Trạng Thái</th>
                    <th className="py-3 px-3 font-semibold">Số Người</th>
                    <th className="py-3 px-3 font-semibold">Số ĐT</th>
                    <th className="py-3 px-3 font-semibold">Email</th>
                    <th className="py-3 px-3 font-semibold">Lời Chúc</th>
                    <th className="py-3 px-4 font-semibold text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredGuests.map((guest) => {
                    const isCopied = copiedSlug === guest.slug;
                    const contact = parseGuestContact(guest);
                    const isPhoneCopied = copiedPhoneId === guest.id;
                    const isEmailCopied = copiedEmailId === guest.id;

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
                                  title={`Lời nhắn riêng từ Host: ${guest.custom_message}`}
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
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {renderStatusBadge(guest)}
                        </td>

                        {/* Cột 3: Số người */}
                        <td className="py-3.5 px-3 whitespace-nowrap font-medium text-text">
                          {guest.status === 'ACCEPTED' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                              <UserCheck className="w-3 h-3" />
                              {guest.attendees_count} người
                            </span>
                          ) : (
                            <span className="text-text-muted/40">—</span>
                          )}
                        </td>

                        {/* Cột 4: Số Điện Thoại */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {contact.phone ? (
                            <div className="inline-flex items-center gap-1.5 bg-bg/80 px-2 py-1 rounded-lg border border-border/80">
                              <Phone className="w-3 h-3 text-accent shrink-0" />
                              <span className="font-mono text-[11px] font-medium text-text select-all">
                                {contact.phone}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyPhone(guest.id, contact.phone)}
                                title="Sao chép số điện thoại"
                                className="p-1 text-text-muted hover:text-accent transition-colors cursor-pointer"
                              >
                                {isPhoneCopied ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-text-muted/40">—</span>
                          )}
                        </td>

                        {/* Cột 5: Gmail / Email */}
                        <td className="py-3.5 px-3 max-w-[180px]">
                          {contact.email ? (
                            <div className="inline-flex items-center gap-1.5 bg-bg/80 px-2 py-1 rounded-lg border border-border/80 max-w-full">
                              <Mail className="w-3 h-3 text-accent shrink-0" />
                              <span
                                className="font-mono text-[11px] text-text truncate max-w-[120px] select-all"
                                title={contact.email}
                              >
                                {contact.email}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyEmail(guest.id, contact.email)}
                                title="Sao chép email"
                                className="p-1 text-text-muted hover:text-accent transition-colors cursor-pointer shrink-0"
                              >
                                {isEmailCopied ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-text-muted/40">—</span>
                          )}
                        </td>

                        {/* Cột 6: Lời Chúc (Chỉ hiện note thực tế, không hiện JSON/SĐT/Email) */}
                        <td className="py-3.5 px-3 max-w-[220px]">
                          {(() => {
                            const wishText = contact.note.trim();
                            if (!wishText) {
                              return <span className="text-text-muted/40 italic">—</span>;
                            }

                            return (
                              <div className="space-y-1.5">
                                <p className="text-xs text-text italic leading-relaxed line-clamp-2" title={wishText}>
                                  &ldquo;{wishText}&rdquo;
                                </p>
                                <button
                                  type="button"
                                  disabled={clearingWishId === guest.id}
                                  onClick={() => handleClearWish(guest)}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-700 hover:underline cursor-pointer transition-colors"
                                  title="Xóa lời chúc này khỏi trang thiệp công khai"
                                >
                                  {clearingWishId === guest.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-rose-600" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                  <span>Xóa lời chúc</span>
                                </button>
                              </div>
                            );
                          })()}
                        </td>

                        {/* Cột 7: Cụm nút thao tác */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {/* Copy Link 1 chạm nổi bật có thông báo "Đã copy" */}
                            <button
                              type="button"
                              onClick={() => handleCopyLink(guest.slug)}
                              title="Sao chép đường dẫn thiệp mời"
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                                isCopied
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400'
                                  : 'bg-white hover:bg-emerald-50/50 text-[#006C3A] border-[#C8E6C9]'
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-[11px] font-bold text-emerald-600">Đã copy</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span className="text-[11px]">Copy Link</span>
                                </>
                              )}
                            </button>

                            {/* Xem thử thiệp */}
                            <Link
                              href={`/invite/${guest.slug}`}
                              target="_blank"
                              title="Mở thiệp mời trong tab mới"
                              className="p-1.5 rounded-lg border border-border bg-bg hover:bg-bg-surface text-text-muted hover:text-text cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            {/* Xóa */}
                            <button
                              type="button"
                              onClick={() => onDelete(guest.id, guest.full_name)}
                              title="Xóa khách mời"
                              className="p-1.5 rounded-lg border border-border bg-bg hover:bg-rose-50 text-text-muted hover:text-rose-600 cursor-pointer"
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

          {/* 2. Mobile View: Hidden in favor of responsive scrollable table */}
          <div className="hidden">
            {filteredGuests.map((guest) => {
              const isCopied = copiedSlug === guest.slug;
              const isZaloCopied = copiedZaloSlug === guest.slug;
              const updateTime = formatTime(guest.responded_at || guest.opened_at);
              const contact = parseGuestContact(guest);
              const isPhoneCopied = copiedPhoneId === guest.id;
              const isEmailCopied = copiedEmailId === guest.id;

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

                  {guest.status === 'ACCEPTED' && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{guest.attendees_count} người tham dự</span>
                    </div>
                  )}

                  {/* Hiển thị SĐT & Email khách mời */}
                  {(contact.phone || contact.email) && (
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {contact.phone && (
                        <div className="inline-flex items-center gap-1.5 bg-bg/90 px-2 py-1 rounded-lg border border-border/80 text-xs">
                          <Phone className="w-3 h-3 text-accent" />
                          <span className="font-mono text-[11px] font-medium text-text select-all">
                            {contact.phone}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyPhone(guest.id, contact.phone)}
                            className="p-0.5 hover:text-accent transition-colors"
                          >
                            {isPhoneCopied ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-text-muted" />
                            )}
                          </button>
                        </div>
                      )}
                      {contact.email && (
                        <div className="inline-flex items-center gap-1.5 bg-bg/90 px-2 py-1 rounded-lg border border-border/80 text-xs">
                          <Mail className="w-3 h-3 text-accent" />
                          <span className="font-mono text-[11px] text-text max-w-[150px] truncate select-all">
                            {contact.email}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(guest.id, contact.email)}
                            className="p-0.5 hover:text-accent transition-colors"
                          >
                            {isEmailCopied ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-text-muted" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {guest.custom_message && (
                    <div className="text-xs bg-bg/80 p-2.5 rounded-lg border border-border/40 text-text italic">
                      <span className="not-italic text-[10px] uppercase font-bold text-accent block">
                        Lời nhắn riêng:
                      </span>
                      &ldquo;{guest.custom_message}&rdquo;
                    </div>
                  )}

                  {(() => {
                    const wishText = (contact.note || guest.song_request || '').trim();
                    if (!wishText) return null;

                    return (
                      <div className="space-y-1 text-xs border-t border-border/40 pt-2 text-text">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-text italic text-[11px] leading-relaxed flex-1">
                            <span className="not-italic text-accent font-semibold mr-1">Lời chúc:</span>
                            &ldquo;{wishText}&rdquo;
                          </p>
                          <button
                            type="button"
                            disabled={clearingWishId === guest.id}
                            onClick={() => handleClearWish(guest)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-700 hover:underline cursor-pointer shrink-0"
                            title="Xóa lời chúc này"
                          >
                            {clearingWishId === guest.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                            <span>Xóa lời chúc</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

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
