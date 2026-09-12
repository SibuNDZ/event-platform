import { api } from './client';

export interface CheckInResult {
  success: boolean;
  message?: string;
  alreadyCheckedIn?: boolean;
  checkedInAt?: string;
  attendee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    ticketType: string;
    photoUrl?: string;
  };
}

export interface CheckInStats {
  totalAttendees: number;
  checkedIn: number;
  notCheckedIn: number;
  checkInRate: number;
}

export const checkInApi = {
  checkIn: (qrCode: string, eventHint?: string) =>
    api.post<CheckInResult>('/check-in', { qrCode, deviceId: eventHint }),
  stats: (eventId: string) => api.get<CheckInStats>(`/check-in/stats/${eventId}`),
};
