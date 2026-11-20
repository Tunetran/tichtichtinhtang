'use client';

import { useState, useMemo } from 'react';
import { X, Loader2, Sparkles } from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedGuestItem {
  full_name: string;
  custom_message: string | null;
}

export function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parse danh sách khách mời thời gian thực
  const parsedItems = useMemo<ParsedGuestItem[]>(() => {
    if (!inputText.trim()) return [];

    const lines = inputText.split('\n');
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
  }, [inputText]);

  const customMessageCount = useMemo(() => {
    return parsedItems.filter((i) => i.custom_message !== null).length;
  }, [parsedItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedItems.length === 0) return;

    if (parsedItems.length > 200) {
      setErrorMessage('Mỗi lần chỉ tạo tối đa 200 khách mời. Vui lòng giảm bớt danh sách.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/guests/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsedItems }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo hàng loạt.');
      }

      setInputText('');
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/70">
          <div>
            <h3 className="font-serif text-lg font-semibold text-text">
              Tạo Khách Mời Hàng Loạt
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Dán danh sách tên (mỗi người 1 dòng, hỗ trợ kèm lời nhắn riêng)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1 overflow-y-auto">
          <div className="space-y-1.5">
            <label htmlFor="bulk-input" className="block text-xs font-medium text-text">
              Danh sách khách mời (cú pháp: <code className="bg-bg px-1 rounded text-accent">Tên | Lời nhắn riêng</code>):
            </label>
            <textarea
              id="bulk-input"
              rows={8}
              required
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Nguyễn Minh Anh\nTrần Hoàng Nam | Nhớ đến sớm nghe mở màn nhé!\nLê Thu Thảo | Cảm ơn cậu luôn đồng hành cùng tụi mình`}
              className="w-full p-3 font-mono text-xs sm:text-sm rounded-xl bg-bg border border-border focus:outline-none focus:ring-1 focus:ring-accent text-text placeholder:text-text-muted/50 leading-relaxed"
            />
          </div>

          {/* Live Preview & Thống kê nhận diện */}
          <div className="bg-bg/60 border border-border/70 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-text">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>
                Đã nhận diện <strong className="text-accent">{parsedItems.length} khách mời</strong> hợp lệ
                {parsedItems.length > 0 && (
                  <> (trong đó có <strong className="text-primary">{customMessageCount} người</strong> có lời nhắn riêng)</>
                )}
              </span>
            </div>

            {parsedItems.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-1 pt-1 border-t border-border/40 text-xs">
                {parsedItems.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-text-muted py-0.5">
                    <span className="font-medium text-text truncate max-w-[200px]">
                      {idx + 1}. {item.full_name}
                    </span>
                    {item.custom_message ? (
                      <span className="text-[11px] bg-accent/10 text-accent px-1.5 py-0.2 rounded truncate max-w-[160px]">
                        {item.custom_message}
                      </span>
                    ) : (
                      <span className="text-[10px] text-text-muted/60">Không kèm lời nhắn</span>
                    )}
                  </div>
                ))}
                {parsedItems.length > 5 && (
                  <p className="text-[11px] text-text-muted italic pt-1">
                    ...và {parsedItems.length - 5} khách mời khác
                  </p>
                )}
              </div>
            )}
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-500 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
              {errorMessage}
            </p>
          )}

          {/* Modal Footer Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-border text-xs sm:text-sm text-text-muted hover:bg-bg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || parsedItems.length === 0}
              className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-fg font-medium text-xs sm:text-sm shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang khởi tạo đường dẫn...</span>
                </>
              ) : (
                <span>Tạo {parsedItems.length} đường dẫn mời</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
