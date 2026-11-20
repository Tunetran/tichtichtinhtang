'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Search, Loader2, ArrowRight, UserCheck, MailOpen } from 'lucide-react';

interface LookupGuest {
  id: string;
  slug: string;
  full_name: string;
  status: string;
}

export function GuestLookup() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<LookupGuest[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = keyword.trim();
    if (!query || query.length < 2) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/guests/lookup?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.guests || []);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setHasSearched(true);
      }
    });
  };

  return (
    <div className="editorial-card rounded-2xl p-5 sm:p-6 space-y-3.5 text-left shadow-sm">
      <div className="flex items-center gap-2">
        <MailOpen className="w-4 h-4 text-accent" />
        <h3 className="font-serif text-sm sm:text-base font-bold text-text">
          Tra Cứu Thiệp Mời Của Bạn
        </h3>
      </div>
      <p className="text-xs text-text-muted leading-relaxed">
        Nhập họ và tên để tìm đường dẫn thiệp mời riêng nếu bạn vô tình làm mất tin nhắn.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              if (hasSearched) setHasSearched(false);
            }}
            placeholder="Nhập tên của bạn (tối thiểu 2 ký tự)..."
            className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-bg border border-border focus:ring-1 focus:ring-accent text-text placeholder:text-text-muted/60 min-h-[44px]"
          />
        </div>
        <button
          type="submit"
          disabled={isPending || keyword.trim().length < 2}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-fg text-xs font-semibold shadow-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[44px] cursor-pointer shrink-0"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span>Tìm kiếm</span>
          )}
        </button>
      </form>

      {/* Results */}
      {hasSearched && (
        <div className="pt-1 space-y-1.5 animate-fadeIn">
          {results.length === 0 ? (
            <p className="text-xs text-text-muted/80 italic p-2 bg-bg/50 rounded-lg text-center">
              Không tìm thấy thiệp mời khớp với tên này. Vui lòng kiểm tra lại chính tả hoặc liên hệ Ban Tổ Chức.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pt-1">
              {results.map((g) => (
                <Link
                  key={g.id}
                  href={`/invite/${g.slug}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-bg hover:bg-accent/10 border border-border/60 hover:border-accent transition-all group min-h-[44px]"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-accent" />
                    <span className="font-semibold text-xs text-text group-hover:text-primary transition-colors">
                      {g.full_name}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent group-hover:translate-x-0.5 transition-transform">
                    <span>Mở thiệp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
