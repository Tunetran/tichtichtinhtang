import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 text-center">
      <h1 className="font-serif text-3xl font-bold text-[#5C1F38] mb-2">404 — Không Tìm Thấy Trang</h1>
      <p className="text-sm text-[#7D6670] mb-6">Liên kết thiệp mời không tồn tại hoặc đã hết hạn.</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-[#D85C8A] text-white text-xs font-semibold hover:opacity-95 transition-opacity"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
