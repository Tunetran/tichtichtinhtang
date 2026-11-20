export type ThemeName = 'candlelight' | 'vintage' | 'starlight';

export interface TimelineItem {
  time: string;
  title: string;
  description?: string;
}

export interface DresscodeColor {
  name: string;
  hex: string;
}

export interface GalleryPhoto {
  src: string;
  alt: string;
  caption?: string;
}

export interface EventConfig {
  theme: ThemeName;
  eventName: string;
  slogan: string;
  invitationBadge?: string; // Ví dụ: "Thư Mời Tham Dự", "Thiệp Mời", "Save The Date"
  dedicationBadge?: string; // Ví dụ: "Dành tặng người bạn quý", "Kính gửi Quý khách"
  eventDateLabel: string;
  eventDateIso?: string; // ISO 8601 string for countdown & calendar export
  checkinTime: string;
  startTime: string;
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  dresscodeDescription: string;
  dresscodeColors: DresscodeColor[];
  hostName: string;
  contactLabel: string;
  contactUrl: string;
  envelopeGreeting: string; // "Trân trọng kính mời"
  sealHintText: string; // "Chạm vào dấu sáp để mở thư"
  letterSalutation: string; // "Thân gửi"
  generalInvitationText: string[]; // Các đoạn văn lời ngỏ
  timeline: TimelineItem[];
  gallery: GalleryPhoto[];
  audio: {
    src: string;
    defaultVolume: number;
  };
  ogImage: string;
  footerThankYou: string;
  rsvpHeading: string;
  rsvpSubheading: string;
  showCountdown?: boolean;
  showGallery?: boolean;
  showSongRequest?: boolean;
}

export const EVENT_CONFIG: EventConfig = {
  theme: 'candlelight',
  eventName: 'Đêm Nhạc Tình Yêu — Giai Điệu Chạm Trái Tim',
  slogan: 'Một buổi tối chỉ có ánh nến, tiếng đàn và những bản tình ca ngọt ngào',
  invitationBadge: 'Thư Mời Tham Dự',
  dedicationBadge: 'Dành tặng người bạn quý',
  eventDateLabel: 'Thứ Bảy, ngày 14 tháng 02 năm 2026',
  eventDateIso: '2026-02-14T19:30:00+07:00',
  checkinTime: '19:00',
  startTime: '19:30',
  venueName: 'The Muse Acoustic Lounge',
  venueAddress: 'Tầng 3, 128 Phan Kế Bính, Ba Đình, Hà Nội',
  googleMapsUrl: 'https://maps.google.com/?q=The+Muse+Acoustic+Lounge',
  dresscodeDescription: 'Trang phục lịch thiệp, thanh nhã (khuyến khích theo bảng màu bên dưới)',
  dresscodeColors: [
    { name: 'Đỏ rượu / Burgundy', hex: '#7A1835' },
    { name: 'Vàng kem / Champagne', hex: '#E8D3A2' },
    { name: 'Trắng thanh lịch', hex: '#FFFFFF' },
    { name: 'Đen quý phái', hex: '#1C1917' },
  ],
  hostName: 'Minh Trí & Phương Anh',
  contactLabel: 'Ban Tổ Chức (Hotline / Zalo)',
  contactUrl: 'https://zalo.me/0987654321',
  envelopeGreeting: 'Trân trọng kính mời',
  sealHintText: 'Chạm vào dấu sáp để mở thiệp',
  letterSalutation: 'Thân gửi',
  generalInvitationText: [
    'Khi những ngọn nến lung linh được thắp sáng và từng phím đàn cất lên, chúng mình mong muốn được cùng bạn sẻ chia một đêm nhạc ấm áp, nơi những cảm xúc chân thành nhất được nâng niu.',
    'Sự hiện diện của bạn là mảnh ghép hoàn hảo tạo nên những khoảnh khắc đáng nhớ của đêm nay. Hãy để âm nhạc dẫn lối cho những rung động trái tim.',
  ],
  timeline: [
    {
      time: '19:00',
      title: 'Đón khách & Check-in',
      description: 'Thưởng thức đồ uống nhẹ, nhận quà kỷ niệm và chụp ảnh check-in',
    },
    {
      time: '19:30',
      title: 'Khai mạc đêm nhạc',
      description: 'Giai điệu mở màn & lời tri ân gửi tới những người bạn thân thương',
    },
    {
      time: '20:00',
      title: 'Giao lưu & Bản tình ca yêu cầu',
      description: 'Lắng nghe những câu chuyện cảm xúc và ca khúc acoustic theo yêu cầu',
    },
    {
      time: '21:30',
      title: 'Bế mạc & Lưu giữ kỷ niệm',
      description: 'Trao gửi lời cảm ơn và chụp hình kỷ niệm cùng ban nhạc',
    },
  ],
  gallery: [
    {
      src: '/images/photo-1.jpg',
      alt: 'Khoảnh khắc acoustic ấm cúng',
      caption: 'Khúc dạo đầu ngọt ngào',
    },
    {
      src: '/images/photo-2.jpg',
      alt: 'Ánh nến và phím đàn piano',
      caption: 'Giai điệu tình ca',
    },
    {
      src: '/images/photo-3.jpg',
      alt: 'Không gian lãng mạn đêm nhạc',
      caption: 'Lắng đọng từng cung bậc',
    },
    {
      src: '/images/photo-4.jpg',
      alt: 'Nụ cười và hoa tươi',
      caption: 'Khoảnh khắc trọn vẹn',
    },
  ],
  audio: {
    src: '/music/bg-love.mp3',
    defaultVolume: 0.4,
  },
  ogImage: '/images/cover.jpg',
  footerThankYou: 'Rất mong được gặp bạn trong đêm nhạc ấm áp này',
  rsvpHeading: 'Xác Nhận Tham Dự',
  rsvpSubheading: 'Sự hiện diện của bạn là niềm vinh hạnh lớn của chúng mình',
  showCountdown: true,
  showGallery: true,
  showSongRequest: true,
};
