export type GuestStatus = 'NOT_OPENED' | 'OPENED' | 'ACCEPTED' | 'DECLINED';

export interface GuestRecord {
  id: string;
  slug: string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  custom_message: string | null;
  status: GuestStatus;
  attendees_count: number;
  guests_count?: number;
  song_request: string | null;
  wish_message: string | null;
  opened_at: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicGuest {
  slug: string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  custom_message: string | null;
  status: GuestStatus;
  attendees_count: number;
  guests_count?: number;
  song_request: string | null;
  wish_message: string | null;
  responded_at: string | null;
}

export interface AdminStats {
  totalInvites: number;
  notOpened: number;
  openedOnly: number;
  acceptedInvites: number;
  totalAttendees: number;
  declinedInvites: number;
}

export interface AdminGuestsResponse {
  guests: GuestRecord[];
  stats: AdminStats;
}
