import Link from 'next/link';
import { Music, AlertCircle, ArrowLeft } from 'lucide-react';
import { getEventConfig } from '@/lib/event-settings';

export default async function InviteNotFound() {
  const config = await getEventConfig();

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 text-center font-invitation">
      <div className="w-full max-w-[420px] bg-bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Biểu tượng lỗi trang nhã */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-500 mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2 font-invitation">
          <p className="font-invitation text-3xl text-accent font-bold leading-relaxed">
            Rất tiếc...
          </p>
          <h1 className="font-invitation text-2xl sm:text-3xl font-bold text-text leading-relaxed">
            Liên kết thiệp mời không tồn tại
          </h1>
          <p className="text-base sm:text-lg text-text-muted leading-relaxed font-invitation">
            Đường dẫn thiệp mời này có thể chưa chính xác hoặc đã được thay đổi. Vui lòng kiểm tra lại đường dẫn cá nhân được gửi riêng cho bạn.
          </p>
        </div>

        {/* Nút hỗ trợ liên hệ BTC */}
        <div className="pt-2 space-y-3 font-invitation">
          <a
            href={config.contactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-primary text-primary-fg font-bold text-base sm:text-lg shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 font-invitation min-h-[44px]"
          >
            <Music className="w-4 h-4" />
            <span>Liên hệ Ban Tổ Chức ({config.contactLabel})</span>
          </a>

          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl border border-border text-sm sm:text-base text-text-muted hover:bg-bg transition-colors flex items-center justify-center gap-2 font-invitation min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về trang giới thiệu sự kiện</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
