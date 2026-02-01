// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
}

// Pagination
export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface JwtPayload {
  sub: string; // userId
  email: string;
  organizationId?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  organizationId?: string;
  role?: string;
}

// Event types
export interface EventSummary {
  id: string;
  name: string;
  slug: string;
  type: 'IN_PERSON' | 'VIRTUAL' | 'HYBRID';
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  startDate: string;
  endDate: string;
  coverImageUrl?: string;
  attendeeCount: number;
  ticketsSold: number;
  revenue: number;
}

export interface EventStats {
  totalAttendees: number;
  checkedIn: number;
  ticketsSold: number;
  revenue: number;
  pageViews: number;
  registrationsToday: number;
}

// Registration types
export interface RegistrationData {
  ticketTypeId: string;
  quantity: number;
  attendees: AttendeeData[];
  couponCode?: string;
}

export interface AttendeeData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  customFields?: Record<string, unknown>;
}

// Check-in types
export interface CheckInRequest {
  qrCode: string;
  checkpointId?: string;
  deviceId?: string;
  latitude?: number;
  longitude?: number;
}

export interface CheckInResult {
  success: boolean;
  attendee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    ticketType: string;
    photoUrl?: string;
  };
  message?: string;
  alreadyCheckedIn?: boolean;
  checkedInAt?: string;
}

// Badge types
export interface BadgeElement {
  type: 'text' | 'image' | 'qrcode' | 'barcode' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, unknown>;
}

export interface BadgeData {
  attendeeId: string;
  firstName: string;
  lastName: string;
  company?: string;
  jobTitle?: string;
  ticketType: string;
  qrCode: string;
  photoUrl?: string;
}

// Payment types
export type PaymentProvider = 'STRIPE' | 'PAYPAL' | 'ADYEN' | 'PAYU' | 'WOMPI' | 'MERCADOPAGO' | 'FREE';

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
}

// WebSocket event types
export interface WsEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
}

export type WsEventType =
  | 'checkin:new'
  | 'chat:message'
  | 'poll:started'
  | 'poll:ended'
  | 'poll:vote'
  | 'qna:question'
  | 'qna:answer'
  | 'meeting:request'
  | 'meeting:accepted'
  | 'stream:started'
  | 'stream:ended';

// License tier features
export interface TierFeatures {
  maxAttendeesPerEvent: number;
  maxEvents: number;
  customForms: boolean;
  advancedAnalytics: boolean;
  virtualEvents: boolean;
  whiteLabel: boolean;
  sso: boolean;
  apiAccess: 'none' | 'readonly' | 'full';
  customDomain: boolean;
  prioritySupport: boolean;
  paymentGateways: PaymentProvider[];
}

export const TIER_FEATURES: Record<'STANDARD' | 'PROFESSIONAL' | 'ENTERPRISE', TierFeatures> = {
  STANDARD: {
    maxAttendeesPerEvent: 1000,
    maxEvents: 10,
    customForms: true,
    advancedAnalytics: false,
    virtualEvents: false,
    whiteLabel: false,
    sso: false,
    apiAccess: 'none',
    customDomain: false,
    prioritySupport: false,
    paymentGateways: ['STRIPE', 'FREE'],
  },
  PROFESSIONAL: {
    maxAttendeesPerEvent: 5000,
    maxEvents: 50,
    customForms: true,
    advancedAnalytics: true,
    virtualEvents: true,
    whiteLabel: false,
    sso: false,
    apiAccess: 'readonly',
    customDomain: true,
    prioritySupport: true,
    paymentGateways: ['STRIPE', 'PAYPAL', 'ADYEN', 'FREE'],
  },
  ENTERPRISE: {
    maxAttendeesPerEvent: -1, // unlimited
    maxEvents: -1, // unlimited
    customForms: true,
    advancedAnalytics: true,
    virtualEvents: true,
    whiteLabel: true,
    sso: true,
    apiAccess: 'full',
    customDomain: true,
    prioritySupport: true,
    paymentGateways: ['STRIPE', 'PAYPAL', 'ADYEN', 'PAYU', 'WOMPI', 'MERCADOPAGO', 'FREE'],
  },
};
