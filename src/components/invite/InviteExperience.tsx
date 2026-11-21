'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { GuestRecord } from '@/types/guest';
import type { EventConfig } from '@/config/event';
import { EVENT_CONFIG } from '@/config/event';
import { EnvelopeStage } from './EnvelopeStage';
import { AudioPlayer } from './AudioPlayer';
import { LetterContent } from './LetterContent';
import { FallingHearts } from '@/components/FallingHearts';

interface InviteExperienceProps {
  guest: GuestRecord;
  config?: EventConfig;
  initialLogoUrl?: string | null;
  initialBgUrl?: string | null;
  initialWaxSealUrl?: string | null;
}

export function InviteExperience({
  guest: initialGuest,
  config = EVENT_CONFIG,
  initialLogoUrl = null,
  initialBgUrl = null,
  initialWaxSealUrl = null,
}: InviteExperienceProps) {
  const [guest, setGuest] = useState<GuestRecord>(initialGuest);
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [showLetter, setShowLetter] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [bgUrl, setBgUrl] = useState<string | null>(initialBgUrl);
  const [waxSealUrl, setWaxSealUrl] = useState<string | null>(initialWaxSealUrl);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userMutedRef = useRef<boolean>(false);

  // Tự động kiểm tra cập nhật logo, nền và con dấu mới nhất từ API cài đặt
  useEffect(() => {
    let mounted = true;
    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (mounted && data) {
          if ('event_logo_url' in data) {
            setLogoUrl(data.event_logo_url || null);
          }
          if ('event_bg_url' in data) {
            setBgUrl(data.event_bg_url || null);
          }
          if ('wax_seal_url' in data) {
            setWaxSealUrl(data.wax_seal_url || null);
          }
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  // Sync theme attribute to documentElement
  useEffect(() => {
    if (config?.theme) {
      document.documentElement.setAttribute('data-theme', config.theme);
    }
  }, [config?.theme]);

  // Fade-in âm lượng từ từ lên mức defaultVolume
  const fadeInAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.volume = 0.05;
      const targetVolume = config.audio?.defaultVolume ?? 0.4;
      const step = (targetVolume - 0.05) / 15;

      const fadeInterval = setInterval(() => {
        if (!audio || audio.paused) {
          clearInterval(fadeInterval);
          return;
        }
        try {
          if (audio.volume + step >= targetVolume) {
            audio.volume = targetVolume;
            clearInterval(fadeInterval);
          } else {
            audio.volume += step;
          }
        } catch {
          // iOS Safari không cho phép gán thuộc tính volume qua JS
          clearInterval(fadeInterval);
        }
      }, 100);
    } catch {
      // Bỏ qua lỗi volume trên trình duyệt di động
    }
  }, [config.audio?.defaultVolume]);

  // Xử lý mở thư & kích hoạt âm thanh đồng bộ
  const handleOpenEnvelope = () => {
    // 1. Kích hoạt phát nhạc ĐỒNG BỘ trong click handler (vượt Autoplay iOS Safari / Zalo)
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          userMutedRef.current = false;
          fadeInAudio();
        })
        .catch(() => {
          // Trình duyệt chặn âm thanh
        });
    }

    // 2. Kích hoạt chuỗi animation phong bì
    setIsOpened(true);

    // 3. Ghi nhận mở thiệp
    fetch(`/api/invites/${guest.slug}/open`, {
      method: 'POST',
    }).catch(() => {});

    // 4. Mở khóa hiển thị toàn bộ nội dung sau khi nắp trượt xong (~1.2s)
    setTimeout(() => {
      setShowLetter(true);
    }, 1200);
  };

  // Nút bật/tắt nhạc chủ động
  const handleToggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      userMutedRef.current = true;
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          userMutedRef.current = false;
        })
        .catch(() => {});
    }
  };

  // Tự động tạm dừng nhạc khi người dùng chuyển tab hoặc ẩn ứng dụng
  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        if (!audio.paused) {
          audio.pause();
          setIsPlaying(false);
        }
      } else {
        if (!userMutedRef.current && isOpened) {
          audio
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpened]);

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center overflow-x-hidden">
      {/* Lớp nền ảnh sự kiện động phủ toàn màn hình kèm mờ trắng-hồng dịu (-z-20) */}
      {bgUrl && (
        <div
          className="fixed inset-0 -z-20 pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgUrl}
            alt="Nền thiệp mời"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px]" />
        </div>
      )}

      {/* Hiệu ứng logo sự kiện/trái tim pastel rơi phía sau nền (-z-10) */}
      <FallingHearts logoUrl={logoUrl} />

      {/* Audio element ẩn */}
      <audio
        ref={audioRef}
        src={config.audio?.src || EVENT_CONFIG.audio.src}
        loop
        preload="none"
        playsInline
      />

      {/* Floating Vinyl Audio Controller */}
      <AudioPlayer isPlaying={isPlaying} onToggle={handleToggleAudio} />

      {/* Chặng 1 & 2: Phong bì niêm phong vật lý */}
      {!showLetter && (
        <EnvelopeStage
          guest={guest}
          config={config}
          isOpened={isOpened}
          onOpen={handleOpenEnvelope}
          logoUrl={logoUrl}
          waxSealUrl={waxSealUrl}
        />
      )}

      {/* Chặng 3 & 4: Nội dung thư, thư viện ảnh & form RSVP */}
      <div
        className={`w-full transition-opacity duration-700 ease-luxury ${
          showLetter ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <LetterContent
          guest={guest}
          config={config}
          onRsvpUpdated={(updatedGuest) => setGuest(updatedGuest)}
          logoUrl={logoUrl}
          isOpened={isOpened}
        />
      </div>
    </div>
  );
}
