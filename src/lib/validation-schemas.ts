import { z } from 'zod';

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10), // Limit to prevent abuse
});

// Request-related schemas
export const requestQuerySchema = z.object({
  type: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'in-progress']).optional(),
  submittedBy: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10),
});

export const createRequestSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .trim(),
  type: z.enum(['document', 'access', 'general', 'technical'], { message: 'Invalid request type'}),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], { message: 'Invalid priority level'}),
  category: z.string().min(1, 'Category is required').max(50).trim().optional(),
  attachments: z.array(z.string()).max(5, 'Maximum 5 attachments allowed').optional(),
});

// Message-related schemas
export const messageQuerySchema = z.object({
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  unreadOnly: z.boolean().default(false),
  pinnedOnly: z.boolean().default(false),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10),
});

export const createMessageSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(5000, 'Content must not exceed 5000 characters')
    .trim(),
  category: z.string().min(1, 'Category is required').max(50).trim(),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], { message: 'Invalid priority level'}),
  targetAudience: z.enum(['all', 'members', 'board', 'officers'], { message: 'Invalid target audience'}),
  expirationDate: z.string().datetime().optional(),
  isPinned: z.boolean().default(false),
  attachments: z.array(z.string()).max(3, 'Maximum 3 attachments allowed').optional(),
});

// Document-related schemas
export const documentQuerySchema = z.object({
  category: z.string().optional(),
  type: z.enum(['pdf', 'doc', 'image', 'spreadsheet', 'other']).optional(),
  uploadedBy: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10),
});

export const uploadDocumentSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .trim()
    .optional(),
  category: z.string().min(1, 'Category is required').max(50).trim(),
  type: z.enum(['pdf', 'doc', 'image', 'spreadsheet', 'other'], { message: 'Invalid document type'}),
  visibility: z.enum(['public', 'members', 'board', 'officers'], { message: 'Invalid visibility level'}),
  tags: z.array(z.string().max(30)).max(10, 'Maximum 10 tags allowed').optional(),
});

// Activity log schema
export const activityQuerySchema = z.object({
  userId: z.string().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Meeting-related schemas
export const meetingQuerySchema = z.object({
  type: z.enum(['general', 'board', 'committee', 'special']).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10),
});

// Generic validation helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

// Helper for query parameter validation
export function validateQueryParams<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  const params: Record<string, unknown> = {};
  
  for (const [key, value] of searchParams.entries()) {
    // Handle boolean parameters
    if (value === 'true') params[key] = true;
    else if (value === 'false') params[key] = false;
    // Handle numeric parameters
    else if (/^\d+$/.test(value)) params[key] = parseInt(value, 10);
    else params[key] = value;
  }
  
  return validateRequest(schema, params);
}
