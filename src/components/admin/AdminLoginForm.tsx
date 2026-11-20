'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, Music } from 'lucide-react';
import { EVENT_CONFIG } from '@/config/event';

interface AdminLoginFormProps {
  eventName?: string;
}

export function AdminLoginForm({ eventName }: AdminLoginFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayTitle = eventName || EVENT_CONFIG.eventName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Mật khẩu quản trị không chính xác.');
      }

      // Đăng nhập thành công -> refresh để Server Component render Dashboard
      router.refresh();
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[380px] bg-bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <p className="font-script text-2xl text-accent">
            Bảng Quản Trị
          </p>
          <h1 className="font-serif text-xl font-bold text-text">
            {displayTitle}
          </h1>
          <p className="text-xs text-text-muted">
            Vui lòng nhập mật khẩu quản trị viên để tiếp tục
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-pass" className="block text-xs font-medium text-text">
              Mật khẩu quản trị
            </label>
            <div className="relative">
              <input
                id="admin-pass"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl bg-bg border border-border focus:outline-none focus:ring-1 focus:ring-accent text-text placeholder:text-text-muted/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-1"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-500 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !password}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-fg font-medium text-sm shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang kiểm tra...</span>
              </>
            ) : (
              <span>Đăng nhập</span>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
