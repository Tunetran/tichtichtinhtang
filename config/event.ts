export type ThemeName = 'candlelight' | 'vintage' | 'starlight' | 'tichtichtinhtang';

export interface TimelineItem {
  time: string;
  title: string;
  description?: string;
}

export interface DresscodeColor {
  name: string;
  hex: string;
}

export interface DresscodeOption {
  title: string;
  description: string;
  image: string;
  bgHex?: string;
}

export interface GalleryPhoto {
  src: string;
  alt: string;
  caption?: string;
}

export interface SponsorItem {
  id: string;
  name: string;
  logoUrl: string;
  category: 'sponsor' | 'companion'; // 'sponsor': Đơn vị tài trợ, 'companion': Đơn vị đồng hành
}

export interface EventConfig {
  theme: ThemeName;
  eventName: string;
  slogan: string;
  invitationBadge?: string;
  dedicationBadge?: string;
  poemQuote?: string[];
  eventDateLabel: string;
  eventDateIso?: string;
  checkinTime: string;
  startTime: string;
  endTime?: string;
  venueName: string;
  venueHall?: string;
  venueAddress: string;
  googleMapsUrl: string;
  dresscodeDescription: string;
  dresscodeColors: DresscodeColor[];
  dresscodeOptions?: DresscodeOption[];
  hostName: string;
  contactLabel: string;
  contactUrl: string;
  envelopeGreeting: string;
  sealHintText: string;
  letterSalutation: string;
  generalInvitationText: string[];
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
  sponsors?: SponsorItem[];
}

export const EVENT_CONFIG: EventConfig = {
  theme: 'tichtichtinhtang',
  eventName: 'Tịch Tịch Tình Tang',
  slogan: 'Vở ca nhạc kịch dân gian lấy cảm hứng từ truyện cổ tích “Cây Tre Trăm Đốt”',
  invitationBadge: 'Thư Mời Tham Dự',
  dedicationBadge: 'Trân trọng kính mời Quý Thầy/Cô',
  poemQuote: [
    'TÍCH XƯA KỂ LẠI CHUYỆN TÌNH',
    'TÍCH NÀO KỂ LẠI CHUYỆN TÌNH ĐÂY TA?',
  ],
  eventDateLabel: 'Thứ Bảy, ngày 05 tháng 12 năm 2026',
  eventDateIso: '2026-12-05T18:30:00+07:00',
  checkinTime: '18:00 - 18:30',
  startTime: '18:30',
  endTime: '19:30',
  venueHall: 'HỘI TRƯỜNG B',
  venueName: 'Trường Đại học Gia Định',
  venueAddress: '371 Nguyễn Kiệm, Phường Hạnh Thông, TP. Hồ Chí Minh',
  googleMapsUrl: 'https://maps.google.com/?q=371+Nguy%E1%BB%85n+Ki%E1%BB%87m+%C4%90%E1%BA%A1i+H%E1%BB%8Dc+Gia+%C4%90%E1%BB%8Bnh',
  dresscodeDescription: 'Khuyến khích lựa chọn trang phục theo 3 phong cách thanh nhã',
  dresscodeColors: [
    { name: 'Xanh tre / Ngọc bích', hex: '#006C3A' },
    { name: 'Hồng sen pastel', hex: '#F4A7BB' },
    { name: 'Vàng kem mây', hex: '#FFF4D6' },
    { name: 'Xanh cốm non', hex: '#A8D5BA' },
  ],
  dresscodeOptions: [
    {
      title: 'ĐỒ LỊCH SỰ',
      description: 'Trang phục công sở, thanh lịch, trang nhã',
      image: '/images/dresscode-1-smart.png',
      bgHex: '#C9E6C9',
    },
    {
      title: 'ÁO DÀI',
      description: 'Áo dài truyền thống hoặc áo dài cách tân',
      image: '/images/dresscode-2-aodai.png',
      bgHex: '#F8B4C4',
    },
    {
      title: 'TRANG PHỤC TRUYỀN THỐNG',
      description: 'Cổ phục Việt Nam, trang phục dân gian',
      image: '/images/dresscode-3-traditional.png',
      bgHex: '#FAD8C0',
    },
  ],
  hostName: 'The Light',
  contactLabel: 'Ban Tổ Chức (Hotline / Zalo)',
  contactUrl: 'https://zalo.me/0987654321',
  envelopeGreeting: 'Bạn nhận được một lá thư từ',
  sealHintText: 'Chạm vào con dấu The Light để mở thiệp',
  letterSalutation: 'Kính gửi',
  generalInvitationText: [
    'Trân trọng kính mời Thầy/Cô đến xem vở ca nhạc kịch dân gian được lấy cảm hứng từ truyện cổ tích “Cây Tre Trăm Đốt”.',
    'Sự có mặt của Thầy/Cô là niềm vinh dự và là lời động viên lớn nhất với The Light.',
  ],
  timeline: [
    {
      time: '18:00 - 18:30',
      title: 'Check-in',
      description: 'Đón tiếp Quý Thầy/Cô, nhận quà kỷ niệm & chụp hình lưu niệm',
    },
    {
      time: '18:30 - 19:30',
      title: 'Bắt đầu sự kiện',
      description: 'Công diễn vở ca nhạc kịch dân gian “Tịch Tịch Tình Tang”',
    },
    {
      time: '19:30',
      title: 'Kết thúc sự kiện',
      description: 'Trao gửi lời tri ân & chụp ảnh kỷ niệm cùng toàn thể đoàn kịch',
    },
  ],
  gallery: [
    {
      src: '/images/page-1.png',
      alt: 'Bìa thư Tịch Tịch Tình Tang',
      caption: 'Thư mời mở màn',
    },
    {
      src: '/images/page-3.png',
      alt: 'Lịch công diễn và địa điểm',
      caption: 'Lịch diễn 05/12/2026',
    },
    {
      src: '/images/page-4.png',
      alt: 'Dresscode và Lịch trình sự kiện',
      caption: 'Trang phục & Timeline',
    },
  ],
  audio: {
    src: '/music/bg-love.mp3',
    defaultVolume: 0.4,
  },
  ogImage: '/images/page-1.png',
  footerThankYou:
    'The Light xin chân thành cảm ơn Quý Thầy/Cô đã dành thời gian quý báu, gác lại những bận rộn để đến tham dự sự kiện của chúng em. Sự hiện diện của Quý Thầy/Cô không chỉ là niềm vinh dự mà còn là nguồn động viên lớn lao, tiếp thêm cho cả đoàn sự tự tin và cảm hứng để mang đến một buổi diễn trọn vẹn nhất. Kính chúc Quý Thầy/Cô thật nhiều sức khỏe, hạnh phúc và luôn thành công trên con đường gieo mầm tri thức.\nTrân trọng cảm ơn! 🎋',
  rsvpHeading: 'Xác Nhận Tham Dự',
  rsvpSubheading: 'Quý Thầy/Cô vui lòng gửi xác nhận để BTC sắp xếp chỗ ngồi và đón tiếp chu đáo nhất',
  showCountdown: true,
  showGallery: false,
  showSongRequest: false,
  sponsors: [
    {
      id: 'sp-1',
      name: 'The Light',
      logoUrl: '/images/logo-the-light.png',
      category: 'companion',
    },
  ],
};
