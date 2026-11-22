'use client';

import { useState, useMemo } from 'react';
import { UserPlus, Users, Loader2, Sparkles, Plus, CheckCircle2 } from 'lucide-react';

interface QuickAddGuestProps {
  onSuccess: () => void;
  showToast: (msg: string) => void;
}

interface ParsedGuestItem {
  full_name: string;
  custom_message: string | null;
}

export function QuickAddGuest({ onSuccess, showToast }: QuickAddGuestProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  // Single guest state
  const [singleName, setSingleName] = useState('');
  const [singleMessage, setSingleMessage] = useState('');
  const [isSubmittingSingle, setIsSubmittingSingle] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);

  // Bulk guest state
  const [bulkText, setBulkText] = useState('');
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Parse bulk text
  const parsedBulkItems = useMemo<ParsedGuestItem[]>(() => {
    if (!bulkText.trim()) return [];
    const lines = bulkText.split('\n');
    const items: ParsedGuestItem[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.includes('|')) {
        const parts = line.split('|');
        const fullName = parts[0].trim();
        const customMessage = parts.slice(1).join('|').trim();
        if (fullName) {
          items.push({
            full_name: fullName,
            custom_message: customMessage || null,
          });
        }
      } else {
        items.push({
          full_name: line,
          custom_message: null,
        });
      }
    }
    return items;
  }, [bulkText]);

  // Handle single submit
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName.trim()) {
      setSingleError('Vui lòng nhập họ tên khách mời');
      return;
    }

    setIsSubmittingSingle(true);
    setSingleError(null);

    try {
      const res = await fetch('/api/admin/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: singleName.trim(),
          custom_message: singleMessage.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi tạo khách mời');
      }

      setSingleName('');
      setSingleMessage('');
      showToast(`Đã tạo thiệp mời cho "${data.guest.full_name}" thành công!`);
      onSuccess();
    } catch (err) {
      setSingleError((err as Error).message);
    } finally {
      setIsSubmittingSingle(false);
    }
  };

  // Handle bulk submit
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBulkItems.length === 0) {
      setBulkError('Vui lòng nhập hoặc dán ít nhất 1 tên khách');
      return;
    }

    if (parsedBulkItems.length > 200) {
      setBulkError('Mỗi lần chỉ tạo tối đa 200 khách mời. Vui lòng giảm bớt danh sách.');
      return;
    }

    setIsSubmittingBulk(true);
    setBulkError(null);

    try {
      const res = await fetch('/api/admin/guests/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsedBulkItems }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi khi tạo danh sách');
      }

      setBulkText('');
      showToast(`Đã tạo thành công ${data.createdCount} thiệp mời!`);
      onSuccess();
    } catch (err) {
      setBulkError((err as Error).message);
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 font-sans-ui">
      {/* Header chuyển chế độ thêm khách */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#006C3A]/10 text-[#006C3A]">
            <UserPlus className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-text">
            Thêm Khách Mời Mới
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-bg p-1 rounded-xl border border-border/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'single'
                ? 'bg-white shadow-2xs text-[#006C3A]'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Thêm từng người
          </button>
          <button
            type="button"
            onClick={() => setMode('bulk')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'bulk'
                ? 'bg-white shadow-2xs text-[#006C3A]'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Dán danh sách nhiều dòng
          </button>
        </div>
      </div>

      {/* Chế độ 1: Thêm từng người */}
      {mode === 'single' ? (
        <form onSubmit={handleSingleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-5">
              <input
                type="text"
                value={singleName}
                onChange={(e) => setSingleName(e.target.value)}
                placeholder="Họ và tên khách mời * (ví dụ: Quý Thầy/Cô, Anh Minh...)"
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text placeholder:text-text-muted/60"
              />
            </div>
            <div className="sm:col-span-5">
              <input
                type="text"
                value={singleMessage}
                onChange={(e) => setSingleMessage(e.target.value)}
                placeholder="Lời nhắn riêng từ Host (tùy chọn)..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text placeholder:text-text-muted/60"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isSubmittingSingle || !singleName.trim()}
                className="w-full h-full min-h-[36px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-fg text-xs font-semibold hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xs cursor-pointer"
              >
                {isSubmittingSingle ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>+ Tạo thiệp</span>
              </button>
            </div>
          </div>
          {singleError && (
            <p className="text-xs text-rose-600 font-medium">{singleError}</p>
          )}
        </form>
      ) : (
        /* Chế độ 2: Dán danh sách nhiều dòng */
        <form onSubmit={handleBulkSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              rows={4}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`Dán danh sách họ tên khách mời vào đây, mỗi dòng một người:
Nguyễn Văn A
Trần Thị B | Lời nhắn riêng gửi bạn B
Quý Thầy/Cô Khoa CNTT`}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text placeholder:text-text-muted/60 font-mono leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-[11px] text-text-muted flex items-center gap-2">
              <span>Định dạng: <code className="bg-bg px-1.5 py-0.5 rounded border border-border/80">Tên Khách</code> hoặc <code className="bg-bg px-1.5 py-0.5 rounded border border-border/80">Tên Khách | Lời nhắn riêng</code></span>
              {parsedBulkItems.length > 0 && (
                <span className="font-bold text-[#006C3A] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Đã nhận diện: {parsedBulkItems.length} khách
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmittingBulk || parsedBulkItems.length === 0}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-fg text-xs font-semibold hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xs cursor-pointer shrink-0"
            >
              {isSubmittingBulk ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tạo hàng loạt...</span>
                </>
              ) : (
                <>
                  <Users className="w-3.5 h-3.5" />
                  <span>+ Tạo {parsedBulkItems.length > 0 ? `${parsedBulkItems.length} thiệp` : 'hàng loạt'}</span>
                </>
              )}
            </button>
          </div>
          {bulkError && (
            <p className="text-xs text-rose-600 font-medium">{bulkError}</p>
          )}
        </form>
      )}
    </div>
  );
}
