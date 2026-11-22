'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut,
  Users,
  RefreshCw,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Sparkles,
  X,
  UserCheck,
} from 'lucide-react';
import type { GuestRecord, AdminStats, GuestStatus } from '@/types/guest';
import { EVENT_CONFIG } from '@/config/event';
import { parseGuestContact } from '@/lib/guest-contact';
import { StatsCards } from './StatsCards';
import { QuickAddGuest } from './QuickAddGuest';
import { GuestTable } from './GuestTable';
import { EventVisualSettingsTab } from './EventVisualSettingsTab';

export function AdminDashboard() {
  const router = useRouter();
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalInvites: 0,
    notOpened: 0,
    openedOnly: 0,
    acceptedInvites: 0,
    totalAttendees: 0,
    declinedInvites: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'guests' | 'settings'>('guests');
  const [eventName, setEventName] = useState<string>(EVENT_CONFIG.eventName);

  // Modal Sửa Khách
  const [editingGuest, setEditingGuest] = useState<GuestRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editStatus, setEditStatus] = useState<GuestStatus>('NOT_OPENED');
  const [editAttendees, setEditAttendees] = useState<number>(1);
  const [editNote, setEditNote] = useState<string>('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Tải dữ liệu từ API
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const [guestsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/guests'),
        fetch('/api/admin/settings').catch(() => null),
      ]);

      if (guestsRes.status === 401) {
        router.refresh();
        return;
      }

      if (settingsRes && settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData?.config?.eventName) {
          setEventName(sData.config.eventName);
        }
      }

      const data = await guestsRes.json();
      if (guestsRes.ok) {
        setGuests(data.guests || []);
        setStats(
          data.stats || {
            totalInvites: 0,
            notOpened: 0,
            openedOnly: 0,
            acceptedInvites: 0,
            totalAttendees: 0,
            declinedInvites: 0,
          }
        );
      }
    } catch {
      // Bỏ qua lỗi mạng
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Đăng xuất
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.refresh();
    } catch {
      router.refresh();
    }
  };

  // Mở modal sửa khách
  const handleOpenEdit = (guest: GuestRecord) => {
    const contact = parseGuestContact(guest);
    setEditingGuest(guest);
    setEditName(guest.full_name);
    setEditMessage(guest.custom_message || '');
    setEditStatus(guest.status);
    setEditAttendees(guest.attendees_count > 0 ? guest.attendees_count : 1);
    setEditNote(contact.note || guest.song_request || '');
    setEditError(null);
  };

  // Lưu sửa khách vào Supabase
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest || !editName.trim()) return;

    setIsSubmittingEdit(true);
    setEditError(null);

    try {
      const contact = parseGuestContact(editingGuest);
      let newWishMessage: string | null = editNote.trim() || null;
      if (contact.phone || contact.email) {
        newWishMessage = JSON.stringify({
          phone: contact.phone || '',
          email: contact.email || '',
          note: editNote.trim() || '',
        });
      }

      const res = await fetch(`/api/admin/guests/${editingGuest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: editName.trim(),
          custom_message: editMessage.trim() || null,
          status: editStatus,
          attendees_count: editStatus === 'ACCEPTED' ? editAttendees : 0,
          song_request: null,
          wish_message: newWishMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể cập nhật khách mời.');
      }

      setEditingGuest(null);
      fetchData(true);
      showToast('Đã cập nhật thông tin khách thành công!');
    } catch (err) {
      setEditError((err as Error).message);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Xóa khách mời
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khách mời "${name}"? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/guests/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData(true);
        showToast(`Đã xóa khách mời "${name}"!`);
      } else {
        alert('Không thể xóa khách mời.');
      }
    } catch {
      alert('Lỗi kết nối khi xóa.');
    }
  };

  // Xuất file CSV danh sách khách
  const handleExportCSV = () => {
    if (guests.length === 0) return;

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`;

    const escapeCsv = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const statusMap: Record<string, string> = {
      NOT_OPENED: 'Chưa mở',
      OPENED: 'Đã mở',
      ACCEPTED: 'Đồng ý tham gia',
      DECLINED: 'Từ chối',
    };

    const headers = [
      'STT',
      'Tên khách mời',
      'Trạng thái',
      'Số người tham dự',
      'Số điện thoại',
      'Gmail / Email',
      'Lời nhắn / Ghi chú',
      'Lời nhắn riêng từ Host',
      'Link thiệp mời',
      'Thời gian mở',
      'Thời gian phản hồi',
    ];

    const rows = guests.map((g, idx) => {
      const contact = parseGuestContact(g);
      return [
        escapeCsv(idx + 1),
        escapeCsv(g.full_name),
        escapeCsv(statusMap[g.status] || g.status),
        escapeCsv(g.attendees_count),
        escapeCsv(contact.phone || ''),
        escapeCsv(contact.email || ''),
        escapeCsv(contact.note || g.song_request || ''),
        escapeCsv(g.custom_message || ''),
        escapeCsv(`${origin}/invite/${g.slug}`),
        escapeCsv(g.opened_at || ''),
        escapeCsv(g.responded_at || ''),
      ];
    });

    const csvBody = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const csvWithBom = '\uFEFF' + csvBody;
    const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `danh-sach-khach-moi-${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống danh sách khách CSV thành công!');
  };

  return (
    <main className="min-h-[100dvh] bg-bg py-5 sm:py-7 px-3.5 sm:px-6 lg:px-8 font-sans-ui text-text">
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
        {/* Header Quản Trị */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-bg-surface p-4 sm:p-5 rounded-2xl border border-border shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006C3A] animate-pulse" />
              <h1 className="font-bold text-base sm:text-lg text-text">
                Quản Trị Thiệp Mời
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Đêm nhạc kịch <strong className="text-[#006C3A] font-semibold">{eventName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Xem thử thiệp mẫu */}
            <Link
              href="/invite/demo"
              target="_blank"
              className="py-1.5 px-3 rounded-xl border border-border bg-bg hover:bg-bg-surface text-xs font-medium text-text flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#006C3A]" />
              <span className="hidden sm:inline">Xem thiệp mẫu</span>
            </Link>

            {/* Nút Làm mới */}
            <button
              type="button"
              onClick={() => fetchData()}
              disabled={isRefreshing}
              className="p-2 rounded-xl border border-border bg-bg hover:bg-bg-surface text-text-muted hover:text-text transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#006C3A]' : ''}`} />
            </button>

            {/* Nút Đăng xuất */}
            <button
              type="button"
              onClick={handleLogout}
              className="py-1.5 px-3 rounded-xl border border-border bg-bg hover:bg-rose-50 text-text-muted hover:text-rose-600 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* 2 TAB ĐIỀU HƯỚNG RÕ RÀNG */}
        <div className="flex items-center gap-2 border-b border-border/80 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('guests')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'guests'
                ? 'bg-primary text-primary-fg shadow-2xs'
                : 'text-text-muted hover:text-text hover:bg-bg-surface'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tab 1 — Khách Mời & RSVP</span>
            <span
              className={`ml-1 px-2 py-0.2 rounded-full text-[11px] font-bold ${
                activeTab === 'guests' ? 'bg-white/20 text-white' : 'bg-bg text-text-muted'
              }`}
            >
              {guests.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-primary text-primary-fg shadow-2xs'
                : 'text-text-muted hover:text-text hover:bg-bg-surface'
            }`}
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Tab 2 — Cài Đặt Thiệp & Hình Ảnh</span>
          </button>
        </div>

        {/* NỘI DUNG TỪNG TAB */}
        {isLoading ? (
          <div className="bg-bg-surface border border-border rounded-2xl p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#006C3A] mx-auto" />
            <p className="text-xs text-text-muted">Đang tải dữ liệu trang quản trị...</p>
          </div>
        ) : activeTab === 'guests' ? (
          /* ========================================================
              TAB 1: KHÁCH MỜI & RSVP
             ======================================================== */
          <div className="space-y-5 sm:space-y-6">
            {/* 1. Hàng thẻ thống kê nhanh gọn */}
            <StatsCards stats={stats} />

            {/* 2. Khung thêm khách gọn gàng (thêm đơn hoặc dán danh sách nhiều dòng) */}
            <QuickAddGuest
              onSuccess={() => fetchData(true)}
              showToast={showToast}
            />

            {/* 3. Bảng danh sách khách mời */}
            <GuestTable
              guests={guests}
              eventName={eventName}
              onRefresh={() => fetchData(true)}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onExportCSV={handleExportCSV}
            />
          </div>
        ) : (
          /* ========================================================
              TAB 2: CÀI ĐẶT THIỆP & HÌNH ẢNH
             ======================================================== */
          <EventVisualSettingsTab
            onSaved={() => fetchData(true)}
            showToast={showToast}
          />
        )}
      </div>

      {/* Modal Chỉnh Sửa Khách Mời */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-text">
                  Chỉnh Sửa Khách Mời
                </h3>
                <p className="font-mono text-[11px] text-text-muted">
                  /invite/{editingGuest.slug}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingGuest(null)}
                className="text-text-muted hover:text-text p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text">
                  Họ và tên khách mời *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text">
                  Lời nhắn riêng từ Host
                </label>
                <textarea
                  rows={2}
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  placeholder="Lời nhắn riêng chỉ hiện cho khách này..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-text">
                    Trạng thái
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as GuestStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
                  >
                    <option value="NOT_OPENED">Chưa mở thiệp</option>
                    <option value="OPENED">Đã mở thiệp</option>
                    <option value="ACCEPTED">Đồng ý tham gia</option>
                    <option value="DECLINED">Từ chối tham gia</option>
                  </select>
                </div>

                {editStatus === 'ACCEPTED' ? (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-text">
                      Số người tham gia
                    </label>
                    <select
                      value={editAttendees}
                      onChange={(e) => setEditAttendees(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text"
                    >
                      {[1, 2, 3, 4].map((num) => (
                        <option key={num} value={num}>
                          {num} người
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div />
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text">
                  Lời nhắn / Ghi chú từ khách
                </label>
                <textarea
                  rows={2}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Thông tin liên hệ hoặc lời chúc..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text resize-none"
                />
              </div>

              {editError && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg">
                  {editError}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGuest(null)}
                  disabled={isSubmittingEdit}
                  className="flex-1 py-2 px-3 rounded-xl border border-border text-xs text-text-muted hover:bg-bg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit || !editName.trim()}
                  className="flex-1 py-2 px-4 rounded-xl bg-primary text-primary-fg font-semibold text-xs shadow-sm hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingEdit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Lưu thay đổi</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#006C3A] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
