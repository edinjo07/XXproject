import { z } from 'zod'

/**
 * Validation schemas for API routes
 * Uses Zod for runtime type checking and validation
 */

// User registration
export const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

// User login
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Video upload
export const videoUploadSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must not exceed 100 characters'),
  description: z
    .string()
    .max(5000, 'Description must not exceed 5000 characters')
    .optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  isAdult: z.boolean().default(false),
  tags: z.array(z.string().max(50)).max(20, 'Maximum 20 tags allowed').optional(),
})

// Video update
export const videoUpdateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(5000).optional(),
  categoryId: z.string().uuid().optional(),
  isAdult: z.boolean().optional(),
})

// Comment creation
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must not exceed 1000 characters'),
  videoId: z.string().uuid('Invalid video ID'),
})

// Report submission
export const reportSchema = z.object({
  videoId: z.string().uuid('Invalid video ID'),
  reason: z.enum([
    'SPAM',
    'INAPPROPRIATE',
    'COPYRIGHT',
    'MISLEADING',
    'VIOLENCE',
    'HATE_SPEECH',
    'OTHER',
  ]),
  details: z.string().max(1000).optional(),
})

// Admin - User action
export const userActionSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  reason: z.string().min(1).max(500),
  duration: z.number().int().positive().optional(), // Duration in days for suspension
})

// Admin - Video approval/rejection
export const videoModerationSchema = z.object({
  videoId: z.string().uuid('Invalid video ID'),
  reason: z.string().max(500).optional(),
})

// Admin - Add earnings
export const addEarningsSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().max(255),
})

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// Search query
export const searchSchema = z.object({
  q: z.string().min(1).max(100),
  category: z.string().uuid().optional(),
  sortBy: z.enum(['relevance', 'recent', 'popular', 'views']).default('relevance'),
}).merge(paginationSchema)

// Category creation/update
export const categorySchema = z.object({
  name: z.string().min(1).max(50),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional(),
})

/**
 * Validation helper function
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(e => e.message).join(', ')
      return { success: false, error: message }
    }
    return { success: false, error: 'Validation failed' }
  }
}

/**
 * Safe parse helper for query parameters
 */
export function parseQueryParams<T>(
  schema: z.ZodSchema<T>,
  params: URLSearchParams | Record<string, string>
): T | null {
  try {
    const data = params instanceof URLSearchParams 
      ? Object.fromEntries(params.entries())
      : params
    return schema.parse(data)
  } catch {
    return null
  }
}
