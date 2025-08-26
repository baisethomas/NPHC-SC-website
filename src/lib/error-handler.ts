/**
 * Secure error handling utility that prevents information disclosure
 * while providing useful feedback for development and logging.
 */

// Types of errors that are safe to expose to users
const SAFE_ERROR_TYPES = [
  'ValidationError',
  'AuthenticationError',
  'AuthorizationError',
  'NotFoundError',
  'BadRequestError',
] as const;

type SafeErrorType = typeof SAFE_ERROR_TYPES[number];

interface ErrorDetails {
  type: string;
  message: string;
  statusCode: number;
  userMessage: string;
  shouldLog: boolean;
}

/**
 * Sanitizes errors for production use, preventing sensitive information disclosure
 */
export function sanitizeError(error: unknown, context?: string): ErrorDetails {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Default error details
  let details: ErrorDetails = {
    type: 'InternalServerError',
    message: 'An unexpected error occurred',
    statusCode: 500,
    userMessage: 'Something went wrong. Please try again later.',
    shouldLog: true,
  };

  if (error instanceof Error) {
    details.message = error.message;
    
    // Handle known error types
    if (error.name === 'ValidationError') {
      details.type = 'ValidationError';
      details.statusCode = 400;
      details.userMessage = isProduction 
        ? 'The provided information is invalid. Please check your input.'
        : error.message;
    } else if (error.message.includes('Unauthorized') || error.message.includes('authentication')) {
      details.type = 'AuthenticationError';
      details.statusCode = 401;
      details.userMessage = 'You must be logged in to access this resource.';
    } else if (error.message.includes('Forbidden') || error.message.includes('admin')) {
      details.type = 'AuthorizationError';
      details.statusCode = 403;
      details.userMessage = 'You do not have permission to access this resource.';
    } else if (error.message.includes('Not found') || error.message.includes('not found')) {
      details.type = 'NotFoundError';
      details.statusCode = 404;
      details.userMessage = 'The requested resource could not be found.';
    } else if (error.message.includes('Bad request') || error.message.includes('Invalid')) {
      details.type = 'BadRequestError';
      details.statusCode = 400;
      details.userMessage = isProduction 
        ? 'The request is invalid. Please check your input.'
        : error.message;
    } else if (isProduction) {
      // In production, don't expose internal error messages
      details.userMessage = 'An internal error occurred. Please try again later.';
      details.message = `Internal error in ${context || 'unknown context'}`;
    }
  }

  return details;
}

/**
 * Logs errors securely with context information
 */
export function logError(error: unknown, context: string, userId?: string, additionalInfo?: Record<string, unknown>): void {
  const details = sanitizeError(error, context);
  
  if (!details.shouldLog) {
    return;
  }

  const logData = {
    timestamp: new Date().toISOString(),
    context,
    userId: userId || 'anonymous',
    errorType: details.type,
    message: details.message,
    statusCode: details.statusCode,
    stack: error instanceof Error ? error.stack : undefined,
    additionalInfo,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
  };

  // In production, use structured logging
  if (process.env.NODE_ENV === 'production') {
    console.error(JSON.stringify(logData));
  } else {
    console.error(`[${context}] ${details.message}`, logData);
  }
}

/**
 * Creates a standardized error response for API routes
 */
export function createErrorResponse(error: unknown, context: string): {
  error: string;
  statusCode: number;
  type: string;
} {
  const details = sanitizeError(error, context);
  
  return {
    error: details.userMessage,
    statusCode: details.statusCode,
    type: details.type,
  };
}

/**
 * Wrapper for API route error handling
 */
export function handleApiError(error: unknown, context: string, userId?: string): Response {
  const errorResponse = createErrorResponse(error, context);
  logError(error, context, userId);
  
  return new Response(JSON.stringify({ error: errorResponse.error }), {
    status: errorResponse.statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Safe error boundary for React components
 */
export class ErrorBoundaryError extends Error {
  public readonly userMessage: string;
  
  constructor(message: string, userMessage?: string) {
    super(message);
    this.name = 'ErrorBoundaryError';
    this.userMessage = userMessage || 'Something went wrong. Please refresh the page.';
  }
}