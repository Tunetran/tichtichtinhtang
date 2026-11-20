'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  UserPlus,
  Users,
  Download,
  RefreshCw,
  Music,
  ListFilter,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import type { GuestRecord, AdminStats } from '@/types/guest';
import { EVENT_CONFIG } from '@/config/event';
import { StatsCards } from './StatsCards';
import { GuestTable } from './GuestTable';
import { SongRequestsTab } from './SongRequestsTab';
import { BulkImportModal } from './BulkImportModal';

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
  const [activeMainTab, setActiveMainTab] = useState<'guests' | 'songs'>('guests');

  // Modal states
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestRecord | null>(null);

  // Form states cho tạo đơn & sửa
  const [formName, setFormName] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
      const res = await fetch('/api/admin/guests');
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setGuests(data.guests || []);
        setStats(data.stats || {
          totalInvites: 0,
          notOpened: 0,
          openedOnly: 0,
          acceptedInvites: 0,
          totalAttendees: 0,
          declinedInvites: 0,
        });
      }
    } catch {
      // Bỏ qua lỗi kết nối
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

  // Tạo khách mời đơn
  const handleCreateSingleGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsFormSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/admin/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formName.trim(),
          custom_message: formMessage.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể tạo khách mời.');
      }

      setFormName('');
      setFormMessage('');
      setIsCreateModalOpen(false);
      fetchData(true);
      showToast('Đã tạo khách mời mới thành công!');
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Mở modal sửa khách
  const handleOpenEdit = (guest: GuestRecord) => {
    setEditingGuest(guest);
    setFormName(guest.full_name);
    setFormMessage(guest.custom_message || '');
    setFormError(null);
  };

  // Lưu sửa khách
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest || !formName.trim()) return;

    setIsFormSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch(`/api/admin/guests/${editingGuest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formName.trim(),
          custom_message: formMessage.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể cập nhật khách mời.');
      }

      setEditingGuest(null);
      setFormName('');
      setFormMessage('');
      fetchData(true);
      showToast('Đã cập nhật thông tin thành công!');
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsFormSubmitting(false);
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

  // Xuất file CSV có UTF-8 BOM (\uFEFF)
  const handleExportCSV = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`;

    // Helper escape CSV cell
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
      'Bài hát yêu cầu',
      'Lời chúc',
      'Lời nhắn riêng',
      'Link thiệp mời',
      'Thời gian mở',
      'Thời gian phản hồi',
    ];

    const rows = guests.map((g, idx) => [
      escapeCsv(idx + 1),
      escapeCsv(g.full_name),
      escapeCsv(statusMap[g.status] || g.status),
      escapeCsv(g.attendees_count),
      escapeCsv(g.song_request || ''),
      escapeCsv(g.wish_message || ''),
      escapeCsv(g.custom_message || ''),
      escapeCsv(`${origin}/invite/${g.slug}`),
      escapeCsv(g.opened_at || ''),
      escapeCsv(g.responded_at || ''),
    ]);

    const csvBody = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    // BẮT BUỘC thêm UTF-8 BOM (\uFEFF) để Excel mở không lỗi font tiếng Việt
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
    showToast('Đã tải xuống danh sách check-in CSV thành công!');
  };

  const songRequestsCount = guests.filter(
    (g) => g.status === 'ACCEPTED' && g.song_request && g.song_request.trim().length > 0
  ).length;

  return (
    <main className="min-h-[100dvh] bg-bg py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Quản Trị */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-bg-surface p-5 sm:p-6 rounded-2xl border border-border shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-script text-2xl text-accent">Ban Tổ Chức</span>
              <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                Admin
              </span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-text mt-0.5">
              {EVENT_CONFIG.eventName}
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Theo dõi phản hồi khách mời & điều phối tổ chức đêm nhạc
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => fetchData()}
              disabled={isRefreshing}
              title="Làm mới dữ liệu"
              className="p-2 rounded-xl border border-border bg-bg hover:bg-bg-surface text-text-muted hover:text-text transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-accent' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-border bg-bg hover:bg-rose-50 text-text-muted hover:text-rose-600 text-xs font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* 5 Thẻ Thống Kê KPI */}
        <StatsCards stats={stats} />

        {/* Thanh Điều Hướng Tab Chính & Các Nút Thao Tác */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Main Tab Switcher */}
          <div className="flex items-center gap-2 bg-bg-surface p-1 rounded-xl border border-border shadow-sm">
            <button
              type="button"
              onClick={() => setActiveMainTab('guests')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMainTab === 'guests'
                  ? 'bg-primary text-primary-fg shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Danh sách khách mời ({guests.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('songs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMainTab === 'songs'
                  ? 'bg-primary text-primary-fg shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Bài hát yêu cầu ({songRequestsCount})</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={guests.length === 0}
              className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl border border-border bg-bg-surface hover:border-accent text-xs font-medium text-text transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-accent" />
              <span>Xuất CSV</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormName('');
                setFormMessage('');
                setFormError(null);
                setIsCreateModalOpen(true);
              }}
              className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl border border-border bg-bg-surface hover:border-accent text-xs font-medium text-text transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5 text-accent" />
              <span>+ Thêm khách</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-primary text-primary-fg hover:opacity-95 text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ Tạo hàng loạt</span>
            </button>
          </div>
        </div>

        {/* Nội dung Tab */}
        {isLoading ? (
          <div className="bg-bg-surface border border-border rounded-2xl p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" />
            <p className="text-xs text-text-muted">Đang tải dữ liệu khách mời...</p>
          </div>
        ) : activeMainTab === 'guests' ? (
          <GuestTable
            guests={guests}
            onRefresh={() => fetchData(true)}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        ) : (
          <SongRequestsTab guests={guests} />
        )}
      </div>

      {/* Modal Tạo Khách Mời Đơn Lẻ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="font-serif text-lg font-semibold text-text">
                Thêm Khách Mời Mới
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-text-muted hover:text-text p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingleGuest} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="create-name" className="block text-xs font-medium text-text">
                  Họ và tên khách mời *
                </label>
                <input
                  id="create-name"
                  type="text"
                  required
                  maxLength={150}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Minh Ánh"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:outline-none focus:ring-1 focus:ring-accent text-text"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="create-msg" className="block text-xs font-medium text-text">
                  Lời nhắn riêng (không bắt buộc)
                </label>
                <textarea
                  id="create-msg"
                  rows={3}
                  maxLength={1000}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Lời nhắn chân thành gửi riêng cho người bạn này..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:outline-none focus:ring-1 focus:ring-accent text-text resize-none"
                />
              </div>

              {formError && (
                <p className="text-xs text-rose-500 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                  {formError}
                </p>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isFormSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs text-text-muted hover:bg-bg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting || !formName.trim()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-fg font-medium text-xs sm:text-sm shadow-md hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isFormSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <span>Tạo đường dẫn mời</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Khách Mời */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <h3 className="font-serif text-lg font-semibold text-text">
                  Chỉnh Sửa Thông Tin
                </h3>
                <p className="text-[11px] text-text-muted">
                  Đường dẫn: /invite/{editingGuest.slug} (được giữ nguyên)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingGuest(null)}
                className="text-text-muted hover:text-text p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="edit-name" className="block text-xs font-medium text-text">
                  Họ và tên khách mời *
                </label>
                <input
                  id="edit-name"
                  type="text"
                  required
                  maxLength={150}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:outline-none focus:ring-1 focus:ring-accent text-text"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-msg" className="block text-xs font-medium text-text">
                  Lời nhắn riêng
                </label>
                <textarea
                  id="edit-msg"
                  rows={3}
                  maxLength={1000}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Để trống nếu không có..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-bg border border-border focus:outline-none focus:ring-1 focus:ring-accent text-text resize-none"
                />
              </div>

              {formError && (
                <p className="text-xs text-rose-500 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                  {formError}
                </p>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGuest(null)}
                  disabled={isFormSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs text-text-muted hover:bg-bg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting || !formName.trim()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-fg font-medium text-xs sm:text-sm shadow-md hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isFormSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
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

      {/* Modal Tạo Hàng Loạt */}
      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => {
          fetchData(true);
          showToast('Đã tạo danh sách khách mời hàng loạt thành công!');
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
