'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  PhoneCall,
  Mail,
  Globe,
  Copy,
  Check,
  X,
  MessageCircle,
  User,
  Info,
} from 'lucide-react';
import type { OrganizerContact } from '@/lib/site-settings';

interface OrganizerContactModalProps {
  contact?: OrganizerContact | null;
  className?: string;
}

export function OrganizerContactModal({ contact, className = '' }: OrganizerContactModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Kiểm tra nếu tất cả các trường đều trống thì không hiển thị nút
  const hasInfo = Boolean(
    contact &&
      (contact.name?.trim() ||
        contact.phone?.trim() ||
        contact.email?.trim() ||
        contact.social_url?.trim() ||
        contact.note?.trim())
  );

  const handleCopyPhone = useCallback((phone: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\s+/g, '');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cleanPhone).then(() => {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }).catch(() => {});
    }
  }, []);

  if (!hasInfo || !contact) {
    return null;
  }

  const cleanPhoneTel = contact.phone ? contact.phone.replace(/[\s.-]/g, '') : '';

  return (
    <>
      {/* Nút chữ tinh tế mở hộp thoại */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Xem thông tin liên hệ Ban Tổ Chức"
        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[#C8E6C9] bg-white/95 hover:bg-[#E8F5E9] hover:border-[#006C3A] text-[#006C3A] text-xs sm:text-sm font-semibold shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all duration-200 cursor-pointer font-sans-ui tracking-normal min-h-[44px] ${className}`}
      >
        <MessageCircle className="w-4 h-4 text-[#006C3A] shrink-0" />
        <span>Liên hệ Ban Tổ Chức</span>
      </button>

      {/* Hộp thoại nổi Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="organizer-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            <motion.div
              key="organizer-modal-dialog"
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-[92vw] max-w-md max-h-[85dvh] overflow-y-auto bg-[#FFFDF9] rounded-3xl p-5 sm:p-7 border border-[#C8E6C9] shadow-2xl space-y-4 font-sans-ui text-[#3E3836]"
            >
              {/* Tiêu đề & nút đóng */}
              <div className="flex items-start justify-between gap-3 border-b border-[#C8E6C9]/60 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#E8F5E9] text-[#006C3A] flex items-center justify-center shrink-0 shadow-2xs">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif-title text-base sm:text-lg font-bold text-[#006C3A] tracking-normal">
                      Ban Tổ Chức Sự Kiện
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#61733F] tracking-normal">
                      Hỗ trợ giải đáp & đón tiếp khách mời
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Đóng hộp thoại"
                  className="w-10 h-10 rounded-full hover:bg-[#E8F5E9] text-[#61733F] hover:text-[#006C3A] flex items-center justify-center transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Danh sách thông tin liên hệ */}
              <div className="space-y-3 pt-1">
                {/* 1. Tên người phụ trách / Ban Tổ Chức */}
                {contact.name?.trim() && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F4F9F2] border border-[#C8E6C9]/60">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#C8E6C9] flex items-center justify-center text-[#006C3A] shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-[#61733F] block font-medium">
                        Đơn vị / Người phụ trách
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#006C3A] truncate block">
                        {contact.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. Số điện thoại (Gọi ngay + Copy) */}
                {contact.phone?.trim() && (
                  <div className="p-3 rounded-2xl bg-[#F4F9F2] border border-[#C8E6C9]/60 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-white border border-[#C8E6C9] flex items-center justify-center text-[#006C3A] shrink-0">
                          <PhoneCall className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-[#61733F] block font-medium">
                            Số điện thoại Hotline
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-[#3E3836] tracking-wide block truncate">
                            {contact.phone}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(contact.phone!)}
                          aria-label="Sao chép số điện thoại"
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-[#C8E6C9] hover:bg-[#E8F5E9] text-xs font-semibold text-[#006C3A] transition-colors cursor-pointer min-h-[44px]"
                        >
                          {copiedPhone ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Chép</span>
                            </>
                          )}
                        </button>

                        <a
                          href={`tel:${cleanPhoneTel}`}
                          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-[#006C3A] hover:bg-[#016748] text-white text-xs font-bold shadow-xs transition-colors min-h-[44px]"
                        >
                          <span>Gọi ngay</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Email */}
                {contact.email?.trim() && (
                  <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#F4F9F2] border border-[#C8E6C9]/60">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-white border border-[#C8E6C9] flex items-center justify-center text-[#006C3A] shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-[#61733F] block font-medium">
                          Email liên hệ
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-[#3E3836] truncate block">
                          {contact.email}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`mailto:${contact.email.trim()}`}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-white border border-[#C8E6C9] hover:bg-[#E8F5E9] text-xs font-bold text-[#006C3A] transition-colors shrink-0 min-h-[44px]"
                    >
                      <span>Gửi thư</span>
                    </a>
                  </div>
                )}

                {/* 4. Link Zalo / Facebook Fanpage */}
                {contact.social_url?.trim() && (
                  <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#F4F9F2] border border-[#C8E6C9]/60">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-white border border-[#C8E6C9] flex items-center justify-center text-[#006C3A] shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-[#61733F] block font-medium">
                          Zalo / Fanpage
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-[#3E3836] truncate block">
                          {contact.social_url}
                        </span>
                      </div>
                    </div>
                    <a
                      href={contact.social_url.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-[#006C3A] hover:bg-[#016748] text-white text-xs font-bold shadow-xs transition-colors shrink-0 min-h-[44px]"
                    >
                      <span>Mở link</span>
                    </a>
                  </div>
                )}

                {/* 5. Ghi chú hỗ trợ */}
                {contact.note?.trim() && (
                  <div className="p-3 rounded-2xl bg-[#FFF4E5] border border-[#FAD8C0] flex items-start gap-2.5 text-xs text-[#3E3836] leading-relaxed">
                    <Info className="w-4 h-4 text-[#006C3A] shrink-0 mt-0.5" />
                    <p className="italic">{contact.note}</p>
                  </div>
                )}
              </div>

              {/* Nút đóng */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 min-h-[44px] rounded-xl border border-[#C8E6C9] hover:bg-[#E8F5E9] text-[#61733F] hover:text-[#006C3A] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
