import { z } from 'zod';

// Common field schemas
export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
  .optional();

export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(100, 'Slug must be less than 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens');

export const urlSchema = z.string().url('Invalid URL').optional();

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  organizationName: z.string().min(1, 'Organization name is required').max(100).optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Organization schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: slugSchema.optional(),
  timezone: z.string().default('UTC'),
  currency: z.string().length(3).default('USD'),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

// User schemas
export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: phoneSchema,
  avatarUrl: urlSchema,
});

export const inviteUserSchema = z.object({
  email: emailSchema,
  role: z.enum(['OWNER', 'ADMIN', 'STAFF', 'VIEWER']).default('STAFF'),
});

// Event schemas
const eventBaseSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200),
  slug: slugSchema.optional(),
  description: z.string().max(5000).optional(),
  shortDescription: z.string().max(300).optional(),
  type: z.enum(['IN_PERSON', 'VIRTUAL', 'HYBRID']).default('IN_PERSON'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  timezone: z.string().default('UTC'),
  venueName: z.string().max(200).optional(),
  venueAddress: z.string().max(500).optional(),
  venueCity: z.string().max(100).optional(),
  venueCountry: z.string().max(100).optional(),
  currency: z.string().length(3).default('USD'),
  maxAttendees: z.number().int().positive().optional(),
  isPublic: z.boolean().default(true),
});

export const createEventSchema = eventBaseSchema.refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const updateEventSchema = eventBaseSchema.partial();

// Session schemas
const sessionBaseSchema = z.object({
  eventId: z.string().cuid(),
  title: z.string().min(3).max(300),
  description: z.string().max(2000).optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  track: z.string().max(100).optional(),
  roomName: z.string().max(100).optional(),
  capacity: z.number().int().positive().optional(),
});

export const createSessionSchema = sessionBaseSchema.refine((data) => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const updateSessionSchema = sessionBaseSchema.omit({ eventId: true }).partial();

// Speaker schemas
export const createSpeakerSchema = z.object({
  eventId: z.string().cuid(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: emailSchema.optional(),
  phone: phoneSchema,
  title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  photoUrl: urlSchema,
  linkedinUrl: urlSchema,
  twitterUrl: urlSchema,
  websiteUrl: urlSchema,
});

export const updateSpeakerSchema = createSpeakerSchema.partial().omit({ eventId: true });

// Ticket type schemas
export const createTicketTypeSchema = z.object({
  eventId: z.string().cuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0),
  currency: z.string().length(3).default('USD'),
  quantity: z.number().int().positive().optional(),
  maxPerOrder: z.number().int().positive().default(10),
  minPerOrder: z.number().int().positive().default(1),
  salesStartDate: z.coerce.date().optional(),
  salesEndDate: z.coerce.date().optional(),
  earlyBirdPrice: z.number().min(0).optional(),
  earlyBirdEndDate: z.coerce.date().optional(),
  attendeeType: z.enum(['GENERAL', 'VIP', 'SPEAKER', 'SPONSOR', 'EXHIBITOR', 'STAFF', 'PRESS']).default('GENERAL'),
  isVisible: z.boolean().default(true),
  isTransferable: z.boolean().default(false),
});

export const updateTicketTypeSchema = createTicketTypeSchema.partial().omit({ eventId: true });

// Coupon schemas
export const createCouponSchema = z.object({
  eventId: z.string().cuid(),
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().max(200).optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().positive(),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerUser: z.number().int().positive().default(1),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
  minOrderAmount: z.number().min(0).optional(),
  applicableTicketTypes: z.array(z.string()).optional(),
});

export const updateCouponSchema = createCouponSchema.partial().omit({ eventId: true, code: true });

// Registration schemas
export const attendeeSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: phoneSchema,
  company: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const registrationSchema = z.object({
  eventId: z.string().cuid(),
  ticketTypeId: z.string().cuid(),
  quantity: z.number().int().positive().max(10),
  attendees: z.array(attendeeSchema).min(1),
  couponCode: z.string().optional(),
  billingAddress: z.object({
    line1: z.string().max(200),
    line2: z.string().max(200).optional(),
    city: z.string().max(100),
    state: z.string().max(100).optional(),
    postalCode: z.string().max(20),
    country: z.string().length(2),
  }).optional(),
});

// Check-in schemas
export const checkInSchema = z.object({
  qrCode: z.string().min(1),
  checkpointId: z.string().cuid().optional(),
  deviceId: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// Checkpoint schemas
export const createCheckpointSchema = z.object({
  eventId: z.string().cuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['MAIN_ENTRANCE', 'SESSION', 'ACTIVITY', 'BOOTH', 'CUSTOM']).default('CUSTOM'),
  location: z.string().max(200).optional(),
  allowedTicketTypes: z.array(z.string()).optional(),
});

export const updateCheckpointSchema = createCheckpointSchema.partial().omit({ eventId: true });

// Survey schemas
export const createSurveySchema = z.object({
  eventId: z.string().cuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  isAnonymous: z.boolean().default(false),
  questions: z.array(z.object({
    question: z.string().min(1).max(500),
    type: z.enum(['text', 'rating', 'single_choice', 'multiple_choice', 'scale']),
    options: z.array(z.string()).optional(),
    isRequired: z.boolean().default(false),
  })).min(1),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type CreateSpeakerInput = z.infer<typeof createSpeakerSchema>;
export type CreateTicketTypeInput = z.infer<typeof createTicketTypeSchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CreateCheckpointInput = z.infer<typeof createCheckpointSchema>;
export type CreateSurveyInput = z.infer<typeof createSurveySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
