'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Tilt from 'react-parallax-tilt';
import type { GuestRecord } from '@/types/guest';
import type { EventConfig } from '@/config/event';

export type InviteStage = 'closed' | 'opening' | 'reading';

interface EnvelopeStageProps {
  guest: GuestRecord;
  config: EventConfig;
  stage: InviteStage;
  onOpen: () => void;
  logoUrl?: string | null;
  waxSealUrl?: string | null;
}

export function EnvelopeStage({
  guest,
  config,
  stage,
  onOpen,
  logoUrl,
  waxSealUrl,
}: EnvelopeStageProps) {
  // Lớp 4 (Nắp phong bì): z-40 khi đóng -> chuyển sang z-15 ngay ở mốc nửa hành trình lật mở (~440ms)
  const [isFlapBehind, setIsFlapBehind] = useState(false);
  const sealSrc = waxSealUrl || '/images/wax-seal-combined.png';
  const showLogoSrc = logoUrl || '/images/logo-tichtichtinhtang.png';

  useEffect(() => {
    if (stage === 'opening') {
      // Nhịp 2: Nắp lật từ 0.15s -> 0.75s (0.6s). Ở mốc nửa hành trình (50%, ~440ms), hạ z-index ra sau tờ thư
      const timer = setTimeout(() => {
        setIsFlapBehind(true);
      }, 440);
      return () => clearTimeout(timer);
    } else {
      setIsFlapBehind(false);
    }
  }, [stage]);

  const handleEnvelopeClick = () => {
    if (stage === 'closed') {
      // Phát âm thanh mở giấy ở âm lượng 0.5 song song với nhạc nền
      try {
        const paperAudio = new Audio('/music/paper-open.mp3');
        paperAudio.volume = 0.5;
        paperAudio.play().catch(() => {});
      } catch {
        // An toàn nếu trình duyệt chặn hoặc chưa có file
      }
      onOpen();
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center px-4 select-none relative z-30 overflow-x-clip">
      <div className="w-full max-w-[420px] flex flex-col items-center justify-center my-auto space-y-4 sm:space-y-6">
        {/* ========================================================
            TIÊU ĐỀ ĐẦU TRANG: "BẠN NHẬN ĐƯỢC MỘT LÁ THƯ TỪ"
            Nhịp 1 (0s -> 0.25s): scale nhẹ và mờ dần khi chạm mở
           ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={
            stage === 'opening'
              ? { opacity: 0, y: -15, scale: 0.96, transition: { duration: 0.25, ease: 'easeOut' } }
              : { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
          }
          className="w-full text-center shrink-0 px-2"
        >
          <p className="font-serif-title text-xs sm:text-base md:text-lg font-bold tracking-[0.15em] sm:tracking-[0.25em] text-[#4A5835] uppercase select-none break-words">
            {config.envelopeGreeting || 'BẠN NHẬN ĐƯỢC MỘT LÁ THƯ TỪ'}
          </p>
        </motion.div>

        {/* ========================================================
            KHUNG PHONG BÌ 3D CHUẨN 5 LỚP (Tỷ lệ w-[min(90vw,390px)] aspect-[4/2.65])
            Bọc trong Tilt 3D khi closed (tắt tilt ngay khi mở)
           ======================================================== */}
        <Tilt
          tiltMaxAngleX={7}
          tiltMaxAngleY={7}
          glareEnable={stage === 'closed'}
          glareMaxOpacity={0.15}
          glareColor="#ffffff"
          gyroscope={true}
          scale={stage === 'closed' ? 1.02 : 1}
          tiltEnable={stage === 'closed'}
          className="w-[min(90vw,390px)] aspect-[4/2.65] flex items-center justify-center shrink-0"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <motion.div
            className="relative w-full h-full [perspective:1200px] flex items-center justify-center cursor-pointer will-change-transform rounded-xl shadow-[0_22px_45px_-12px_rgba(32,72,42,0.20)]"
            style={{ transformStyle: 'preserve-3d' }}
            whileHover={stage === 'closed' ? { y: -3, transition: { duration: 0.2, ease: 'easeOut' } } : {}}
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={
              stage === 'opening'
                ? {
                    y: [0, 0, 70],
                    opacity: [1, 1, 0],
                    transition: {
                      duration: 1.35,
                      times: [0, 0.48, 1], // Giữ nguyên đến ~0.65s rồi trượt xuống 70px và mờ dần
                      ease: [0.4, 0, 0.2, 1],
                    },
                  }
                : { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] } }
            }
            onClick={handleEnvelopeClick}
          >
            {/* Vỏ bao 3D duy trì không gian chiều sâu */}
            <div
              className="relative w-full h-full rounded-xl [perspective:1200px]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* ----------------------------------------------------
                  LỚP 1 (z-10): MẶT SAU & LÒNG PHONG BÌ
                  Màu xanh cốm dịu (#DCEAD6) tạo chiều sâu thật khi nắp mở ra
                 ---------------------------------------------------- */}
              <div
                className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
                style={{
                  zIndex: 10,
                  backgroundColor: '#DCEAD6',
                }}
              >
                {/* Bóng đổ hắt sâu vào trong lòng phong bì */}
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/15 via-[#006C3A]/5 to-transparent pointer-events-none" />
                {/* Lớp vân giấy mỹ thuật phủ nền lòng phong bì */}
                <div className="absolute inset-0 bg-[url('/images/textured-paper.png')] bg-repeat opacity-30 mix-blend-multiply pointer-events-none rounded-xl" />
              </div>

              {/* ----------------------------------------------------
                  LỚP 2 (z-20): TỜ THƯ NẰM LỌT BÊN TRONG LÒNG PHONG BÌ
                  Mặt giấy kem ngà ấm, viền xanh sang trọng
                  Nhịp 3 (0.60s -> 1.30s): Trượt cao lên khỏi miệng
                 ---------------------------------------------------- */}
              <motion.div
                className="absolute inset-x-3.5 sm:inset-x-4 top-2 sm:top-2.5 h-[92%] bg-gradient-to-b from-[#FCFBF6] via-[#FAF6EE] to-[#F3EFE2] rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center text-center border border-[#D5E5C9] overflow-hidden will-change-transform"
                style={{
                  zIndex: 20,
                  boxShadow:
                    stage === 'opening'
                      ? '0 25px 40px -10px rgba(0, 0, 0, 0.28), 0 2px 5px rgba(0,0,0,0.1)'
                      : '0 4px 12px rgba(0, 0, 0, 0.08)',
                }}
                initial={{ y: 0, scale: 0.95, opacity: 1 }}
                animate={
                  stage === 'opening'
                    ? {
                        y: [0, 0, -110],
                        scale: [0.95, 0.95, 1.04],
                        transition: {
                          duration: 1.3,
                          times: [0, 0.45, 1],
                          ease: [0.22, 1, 0.36, 1],
                        },
                      }
                    : { y: 0, scale: 0.95, opacity: 1 }
                }
              >
                {/* Lớp vân giấy mỹ thuật phủ trên tờ thư */}
                <div className="absolute inset-0 bg-[url('/images/textured-paper.png')] bg-repeat opacity-25 mix-blend-multiply pointer-events-none rounded-xl" />

                {/* Viền chỉ thanh nhã bao quanh tờ thư */}
                <div className="absolute inset-1.5 border border-[#61733F]/25 rounded-lg pointer-events-none" />

                {/* Logo The Light nhỏ trang trọng */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1 shrink-0 relative z-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/logo-the-light.png"
                    alt="The Light"
                    className="w-full h-full object-contain drop-shadow-sm"
                  />
                </div>

                {/* Dòng tiêu đề hé lộ khi nắp lật mở */}
                <p className="font-serif-title text-[10px] sm:text-xs font-semibold text-[#006C3A] tracking-wider uppercase relative z-10">
                  THƯ MỜI
                </p>
                <p className="font-serif-title text-sm sm:text-base md:text-lg font-bold text-[#2D4A22] max-w-full px-2 mt-0.5 tracking-normal break-words line-clamp-1 relative z-10">
                  {guest.full_name}
                </p>
                <p className="font-sans-ui text-[11px] sm:text-xs text-[#61733F] italic mt-0.5 line-clamp-1 tracking-normal relative z-10">
                  {config.eventName}
                </p>
              </motion.div>

              {/* ----------------------------------------------------
                  LỚP 3 (z-30): TÚI MẶT TRƯỚC PHONG BÌ (THUẦN CSS/SVG)
                  Mặt giấy kem ngà ấm (#FCFBF6 -> #F3EFE2), nếp gấp tinh tế
                 ---------------------------------------------------- */}
              <div
                className="absolute inset-0 w-full h-full pointer-events-none rounded-xl overflow-hidden"
                style={{ zIndex: 30 }}
              >
                <svg
                  viewBox="0 0 1000 662.5"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Chuyển sắc nếp gấp vạt tam giác trái */}
                    <linearGradient id="pocketLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F6F2E6" />
                      <stop offset="100%" stopColor="#EDE7D5" />
                    </linearGradient>
                    {/* Chuyển sắc nếp gấp vạt tam giác phải */}
                    <linearGradient id="pocketRightGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#F8F4E8" />
                      <stop offset="100%" stopColor="#ECE6D4" />
                    </linearGradient>
                    {/* Chuyển sắc nếp gấp đáy phía trước */}
                    <linearGradient id="pocketBottomGrad" x1="50%" y1="100%" x2="50%" y2="0%">
                      <stop offset="0%" stopColor="#EDE7D5" />
                      <stop offset="45%" stopColor="#F4EFE0" />
                      <stop offset="100%" stopColor="#FCFBF6" />
                    </linearGradient>
                    {/* Bóng đổ nhẹ tạo độ nổi giữa nếp gấp đáy và 2 cánh bên */}
                    <filter id="bottomFoldShadow" x="-10%" y="-20%" width="120%" height="140%">
                      <feDropShadow dx="0" dy="-3" stdDeviation="4" floodColor="#20482A" floodOpacity="0.08" />
                    </filter>
                  </defs>

                  {/* 1. Nếp gấp tam giác trái */}
                  <polygon points="0,0 500,375 0,662.5" fill="url(#pocketLeftGrad)" />
                  <line x1="0" y1="0" x2="500" y2="375" stroke="rgba(160, 150, 120, 0.22)" strokeWidth="1.5" />
                  <line x1="0" y1="662.5" x2="500" y2="375" stroke="rgba(160, 150, 120, 0.22)" strokeWidth="1.5" />

                  {/* 2. Nếp gấp tam giác phải */}
                  <polygon points="1000,0 500,375 1000,662.5" fill="url(#pocketRightGrad)" />
                  <line x1="1000" y1="0" x2="500" y2="375" stroke="rgba(160, 150, 120, 0.22)" strokeWidth="1.5" />
                  <line x1="1000" y1="662.5" x2="500" y2="375" stroke="rgba(160, 150, 120, 0.22)" strokeWidth="1.5" />

                  {/* 3. Nếp gấp đáy vát lên phía trước */}
                  <polygon points="0,662.5 500,335 1000,662.5" fill="url(#pocketBottomGrad)" filter="url(#bottomFoldShadow)" />
                  {/* Đường gân gập mảnh 1px */}
                  <polyline points="0,662.5 500,335 1000,662.5" fill="none" stroke="rgba(160, 150, 120, 0.25)" strokeWidth="1.5" />
                  {/* Đường gân sáng mảnh highlight */}
                  <polyline points="0,661 500,333.5 1000,661" fill="none" stroke="rgba(255, 255, 255, 0.65)" strokeWidth="1" />

                  {/* Viền chỉ mảnh bên trong phong bì tạo vẻ sang trọng cổ điển */}
                  <rect x="12" y="12" width="976" height="638.5" rx="18" fill="none" stroke="rgba(160, 150, 120, 0.18)" strokeWidth="1.5" strokeDasharray="8 6" />
                </svg>

                {/* Phủ lớp vân giấy mỹ thuật lên mặt trước phong bì */}
                <div className="absolute inset-0 bg-[url('/images/textured-paper.png')] bg-repeat opacity-30 mix-blend-multiply pointer-events-none rounded-xl" />
              </div>

              {/* ----------------------------------------------------
                  LỚP 4 (Nắp phong bì lật mở 3D thuần CSS):
                  z-40 khi đóng -> chuyển sang z-15 ở mốc 50% (~440ms)
                  Nhịp 2 (0.15s -> 0.75s): rotateX(0deg -> -180deg)
                 ---------------------------------------------------- */}
              <motion.div
                className="absolute inset-x-0 top-0 w-full h-[58%] pointer-events-none will-change-transform"
                style={{
                  transformOrigin: 'top center',
                  transformStyle: 'preserve-3d',
                  zIndex: isFlapBehind ? 15 : 40,
                }}
                initial={{ rotateX: 0 }}
                animate={
                  stage === 'opening'
                    ? { rotateX: -180 }
                    : { rotateX: 0 }
                }
                transition={
                  stage === 'opening'
                    ? {
                        duration: 0.6,
                        delay: 0.15,
                        ease: [0.4, 0, 0.2, 1],
                      }
                    : { duration: 0.3 }
                }
              >
                {/* Mặt trước nắp phong bì: Tam giác trỏ xuống màu kem ngà ấm */}
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backfaceVisibility: 'hidden',
                    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                    background: 'linear-gradient(175deg, #FCFBF6 0%, #F5F0E4 80%, #EDE6D4 100%)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Đường gân nếp gấp tam giác & viền chỉ mảnh */}
                  <svg viewBox="0 0 1000 384" className="w-full h-full absolute inset-0 pointer-events-none" preserveAspectRatio="none">
                    <path d="M 0 0 L 500 384 L 1000 0" fill="none" stroke="rgba(160, 150, 120, 0.28)" strokeWidth="2" />
                    <path d="M 0 1 L 500 382.5 L 1000 1" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="1" />
                    <path d="M 16 6 L 500 366 L 984 6" fill="none" stroke="rgba(160, 150, 120, 0.2)" strokeWidth="1.5" strokeDasharray="8 6" />
                  </svg>
                  {/* Phủ lớp vân giấy mỹ thuật */}
                  <div
                    className="absolute inset-0 bg-[url('/images/textured-paper.png')] bg-repeat opacity-30 mix-blend-multiply pointer-events-none"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                  />
                </div>

                {/* Mặt sau nắp khi lật ngược 180 độ: Lớp lót xanh cốm nhạt dịu (#DCEAD6) */}
                <div
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                    backgroundColor: '#DCEAD6',
                  }}
                >
                  <svg viewBox="0 0 1000 384" className="w-full h-full absolute inset-0 pointer-events-none" preserveAspectRatio="none">
                    <path d="M 0 0 L 500 384 L 1000 0" fill="none" stroke="rgba(0, 108, 58, 0.2)" strokeWidth="2" />
                    <path d="M 16 6 L 500 366 L 984 6" fill="none" stroke="rgba(0, 108, 58, 0.12)" strokeWidth="1.5" strokeDasharray="8 6" />
                  </svg>
                  <div
                    className="absolute inset-0 bg-[url('/images/textured-paper.png')] bg-repeat opacity-30 mix-blend-multiply pointer-events-none"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                  />
                </div>
              </motion.div>

              {/* ----------------------------------------------------
                  LỚP 5 (z-50): CON DẤU SÁP THE LIGHT
                  Nhịp 1 (0s -> 0.25s): scale 1.08 -> 0.85, opacity 0 khi chạm mở
                 ---------------------------------------------------- */}
              <div
                className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 w-[34%] aspect-[1466/1430] pointer-events-auto"
                style={{ zIndex: 50 }}
              >
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEnvelopeClick();
                  }}
                  disabled={stage !== 'closed'}
                  aria-label="Chạm để mở thiệp mời"
                  className="relative w-full h-full min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer active:scale-95 hover:scale-105 transition-transform duration-200 focus:outline-none"
                  animate={
                    stage === 'opening'
                      ? {
                          scale: [1, 1.08, 0.85],
                          opacity: [1, 0.85, 0],
                          y: [0, -6, 10],
                        }
                      : { scale: [1, 1.035, 1] }
                  }
                  transition={
                    stage === 'opening'
                      ? {
                          duration: 0.25,
                          ease: 'easeOut',
                        }
                      : {
                          duration: 2.6,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }
                  }
                >
                  {/* Con dấu sáp The Light với bóng đổ tự nhiên drop-shadow-[0_6px_12px_rgba(25,45,30,0.25)] */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sealSrc}
                    alt="Con dấu sáp The Light"
                    className="w-full h-full object-contain drop-shadow-[0_6px_12px_rgba(25,45,30,0.25)] select-none pointer-events-none"
                  />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </Tilt>

        {/* Dòng hướng dẫn "Chạm vào con dấu để mở thư" nhấp nháy mờ rất nhẹ */}
        {stage === 'closed' && (
          <motion.p
            animate={{ opacity: [0.4, 0.95, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
            className="font-sans-ui text-[11px] sm:text-xs text-[#4A5835] tracking-widest uppercase font-semibold text-center pointer-events-none -mt-1 sm:-mt-2"
          >
            ✦ Chạm vào con dấu để mở thư ✦
          </motion.p>
        )}

        {/* ========================================================
            LOGO SỰ KIỆN: TỊCH TỊCH TÌNH TANG (PHÍA DƯỚI PHONG BÌ)
            Nhịp 1 (0s -> 0.25s): Mờ dần khi bắt đầu mở thư
           ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={
            stage === 'opening'
              ? { opacity: 0, y: 15, transition: { duration: 0.25, ease: 'easeOut' } }
              : { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] } }
          }
          className="w-full flex flex-col items-center justify-center shrink-0"
        >
          <div className="w-[54%] sm:w-[48%] max-w-[200px] sm:max-w-[240px] aspect-square flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={showLogoSrc}
              alt={config.eventName || 'Tịch Tịch Tình Tang'}
              className="w-full h-full object-contain drop-shadow-sm select-none pointer-events-none"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
