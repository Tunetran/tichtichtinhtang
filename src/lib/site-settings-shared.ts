export const DEFAULT_THANK_YOU_BODY = `The Light xin chân thành cảm ơn Quý Thầy Cô đã dành thời gian quý báu, gác lại những bận rộn để đến tham dự sự kiện của chúng em. Sự hiện diện của Quý Thầy Cô không chỉ là niềm vinh dự mà còn là nguồn động viên lớn lao, tiếp thêm cho cả đoàn sự tự tin và cảm hứng để mang đến một buổi diễn trọn vẹn nhất. Kính chúc Quý Thầy Cô thật nhiều sức khỏe, hạnh phúc và luôn thành công trên con đường gieo mầm tri thức.`;

export interface OrganizerContact {
  name?: string;
  phone?: string;
  email?: string;
  social_url?: string;
  note?: string;
}

export interface SiteSettings {
  event_logo_url: string | null;
  event_bg_url: string | null;
  wax_seal_url: string | null;
  organizer_contact?: OrganizerContact | null;
  thank_you_body?: string | null;
  updated_at?: string;
}
