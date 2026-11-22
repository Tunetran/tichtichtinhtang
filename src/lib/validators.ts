import { z } from 'zod';
import { EVENT_CONFIG } from '@/config/event';

export const rsvpSchema = z
  .object({
    status: z.enum(['ACCEPTED', 'DECLINED'], {
      required_error: 'Vui lòng chọn xác nhận tham dự hoặc từ chối',
    }),
    attendees_count: z.number().int().min(0).max(4).optional(),
    phone: z.string().trim().max(50, 'Số điện thoại tối đa 50 ký tự').optional().nullable(),
    email: z.string().trim().max(150, 'Email tối đa 150 ký tự').optional().nullable(),
    song_request: z.string().trim().max(200, 'Tên bài hát tối đa 200 ký tự').optional().nullable(),
    wish_message: z.string().trim().max(1000, 'Lời chúc tối đa 1000 ký tự').optional().nullable(),
  })
  .refine(
    (data) =>
      data.status === 'DECLINED' ||
      (data.attendees_count !== undefined && data.attendees_count >= 1 && data.attendees_count <= 4),
    {
      message: 'Vui lòng chọn số người tham dự từ 1 đến 4',
      path: ['attendees_count'],
    }
  );

export type RsvpInput = z.infer<typeof rsvpSchema>;

export const adminLoginSchema = z.object({
  password: z.string().min(1, 'Vui lòng nhập mật khẩu quản trị'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const createGuestSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'Tên khách mời không được để trống')
    .max(150, 'Tên tối đa 150 ký tự'),
  custom_message: z
    .string()
    .trim()
    .max(1000, 'Lời nhắn riêng tối đa 1000 ký tự')
    .optional()
    .nullable(),
});

export type CreateGuestInput = z.infer<typeof createGuestSchema>;

export const bulkCreateGuestsSchema = z.object({
  items: z
    .array(createGuestSchema)
    .min(1, 'Danh sách tối thiểu 1 người')
    .max(200, 'Tối đa 200 người mỗi lần tạo'),
});

export type BulkCreateGuestsInput = z.infer<typeof bulkCreateGuestsSchema>;

export const updateGuestSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'Tên không được để trống')
    .max(150, 'Tên tối đa 150 ký tự')
    .optional(),
  custom_message: z
    .string()
    .trim()
    .max(1000, 'Lời nhắn riêng tối đa 1000 ký tự')
    .optional()
    .nullable(),
  status: z.enum(['NOT_OPENED', 'OPENED', 'ACCEPTED', 'DECLINED']).optional(),
  attendees_count: z.number().int().min(0).max(4).optional(),
  song_request: z.string().trim().max(200).optional().nullable(),
  wish_message: z.string().trim().max(500).optional().nullable(),
});

export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;

export const eventSettingsSchema = z.object({
  theme: z.enum(['candlelight', 'vintage', 'starlight', 'tichtichtinhtang']).default('tichtichtinhtang'),
  eventName: z.string().trim().min(1, 'Tên sự kiện không được để trống').max(200),
  slogan: z.string().trim().min(1, 'Câu slogan không được để trống').max(300),
  invitationBadge: z.string().trim().optional().default('Thư Mời Tham Dự'),
  dedicationBadge: z.string().trim().optional().default('Trân trọng kính mời Quý Thầy/Cô'),
  eventDateLabel: z.string().trim().min(1, 'Ngày tổ chức không được để trống').max(150),
  eventDateIso: z.string().trim().optional(),
  checkinTime: z.string().trim().min(1, 'Giờ đón khách không được để trống').max(50),
  startTime: z.string().trim().min(1, 'Giờ bắt đầu không được để trống').max(50),
  venueName: z.string().trim().min(1, 'Tên địa điểm không được để trống').max(200),
  venueAddress: z.string().trim().min(1, 'Địa chỉ chi tiết không được để trống').max(300),
  googleMapsUrl: z.string().trim().url('Đường dẫn Google Maps không hợp lệ').or(z.string().trim()),
  dresscodeDescription: z.string().trim().max(300),
  dresscodeColors: z.array(
    z.object({
      name: z.string().trim().min(1),
      hex: z.string().trim().min(4).max(9),
    })
  ).min(1, 'Cần ít nhất 1 màu trang phục'),
  hostName: z.string().trim().min(1, 'Tên người chủ trì không được để trống').max(150),
  contactLabel: z.string().trim().min(1).max(100),
  contactUrl: z.string().trim().min(1),
  envelopeGreeting: z.string().trim().default('Bạn nhận được một lá thư từ'),
  sealHintText: z.string().trim().default('Chạm vào dấu sáp để mở thiệp'),
  letterSalutation: z.string().trim().default('Kính gửi'),
  generalInvitationText: z
    .union([
      z.array(z.string().trim()),
      z.string().trim().transform((val) => val.split('\n').map((s) => s.trim()).filter(Boolean)),
    ])
    .optional()
    .default(() => EVENT_CONFIG.generalInvitationText),
  timeline: z.array(
    z.object({
      time: z.string().trim().min(1),
      title: z.string().trim().min(1),
      description: z.string().trim().optional(),
    })
  ).min(1, 'Cần ít nhất 1 mốc thời gian'),
  gallery: z
    .array(
      z.object({
        src: z.string().trim().min(1, 'Đường dẫn ảnh không được để trống'),
        alt: z.string().trim().min(1, 'Mô tả ảnh không được để trống'),
        caption: z.string().trim().optional(),
      })
    )
    .default([]),
  audio: z.object({
    src: z.string().trim().min(1),
    defaultVolume: z.number().min(0).max(1),
  }),
  ogImage: z.string().trim().min(1).default('/images/cover.jpg'),
  footerThankYou: z.string().trim().default('Rất mong được gặp bạn trong đêm nhạc ấm áp này'),
  rsvpHeading: z.string().trim().default('Xác Nhận Tham Dự'),
  rsvpSubheading: z.string().trim().default('Sự hiện diện của bạn là niềm vinh hạnh lớn của chúng mình'),
  showCountdown: z.boolean().optional().default(true),
  showGallery: z.boolean().optional().default(true),
  showSongRequest: z.boolean().optional().default(true),
  sponsors: z
    .array(
      z.object({
        id: z.string().trim(),
        name: z.string().trim().default(''),
        logoUrl: z.string().trim().min(1, 'Đường dẫn logo không được để trống'),
        category: z.enum(['sponsor', 'companion']),
      })
    )
    .optional()
    .default([]),
});

export type EventSettingsInput = z.infer<typeof eventSettingsSchema>;
