import { z } from 'zod';

export const rsvpSchema = z
  .object({
    status: z.enum(['ACCEPTED', 'DECLINED'], {
      required_error: 'Vui lòng chọn xác nhận tham dự hoặc từ chối',
    }),
    attendees_count: z.number().int().min(0).max(4).optional(),
    song_request: z.string().trim().max(200, 'Tên bài hát tối đa 200 ký tự').optional().nullable(),
    wish_message: z.string().trim().max(500, 'Lời chúc tối đa 500 ký tự').optional().nullable(),
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
});

export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
