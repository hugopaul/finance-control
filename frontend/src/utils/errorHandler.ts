import { ApiError } from '../interfaces/api';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants/api';

// Custom Error Classes
export class AppError extends Error {
  public code: string;
  public status: number;
  public details?: Record<string, any>;

  constructor(message: string, code: string, status: number = 500, details?: Record<string, any>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends Error {
  public field: string;
  public code: string;

  constructor(field: string, message: string, code: string = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
  }
}

export class NetworkError extends Error {
  public code: string;

  constructor(message: string = ERROR_MESSAGES.NETWORK_ERROR) {
    super(message);
    this.name = 'NetworkError';
    this.code = 'NETWORK_ERROR';
  }
}

export class AuthError extends Error {
  public code: string;
  public status: number;

  constructor(message: string, status: number = HTTP_STATUS.UNAUTHORIZED) {
    super(message);
    this.name = 'AuthError';
    this.code = 'AUTH_ERROR';
    this.status = status;
  }
}

// Error Handler Functions
export const handleApiError = (error: any): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppError(ERROR_MESSAGES.NETWORK_ERROR, 'NETWORK_ERROR', HTTP_STATUS.BAD_REQUEST);
  }

  if (error.status) {
    switch (error.status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return new AppError(ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED', error.status);
      case HTTP_STATUS.FORBIDDEN:
        return new AppError(ERROR_MESSAGES.FORBIDDEN, 'FORBIDDEN', error.status);
      case HTTP_STATUS.NOT_FOUND:
        return new AppError(ERROR_MESSAGES.NOT_FOUND, 'NOT_FOUND', error.status);
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return new AppError(ERROR_MESSAGES.SERVER_ERROR, 'SERVER_ERROR', error.status);
      default:
        return new AppError(error.message || ERROR_MESSAGES.UNKNOWN_ERROR, 'API_ERROR', error.status);
    }
  }

  return new AppError(ERROR_MESSAGES.UNKNOWN_ERROR, 'UNKNOWN_ERROR');
};

export const handleValidationError = (field: string, message: string): ValidationError => {
  return new ValidationError(field, message);
};

export const handleNetworkError = (): NetworkError => {
  return new NetworkError();
};

export const handleAuthError = (message?: string, status?: number): AuthError => {
  return new AuthError(message || ERROR_MESSAGES.UNAUTHORIZED, status);
};

// Error Logger
export const logError = (error: Error, context?: Record<string, any>) => {
  const errorLog = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  console.error('Application Error:', errorLog);

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // sendToErrorTrackingService(errorLog);
  }
};

// Error Message Formatter
export const formatErrorMessage = (error: Error): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof ValidationError) {
    return `${error.field}: ${error.message}`;
  }

  if (error instanceof NetworkError) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (error instanceof AuthError) {
    return ERROR_MESSAGES.UNAUTHORIZED;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

// Error Recovery Helper
export const canRetry = (error: Error): boolean => {
  if (error instanceof NetworkError) {
    return true;
  }

  if (error instanceof AppError) {
    return error.status >= 500 || error.status === 429; // Server errors or rate limit
  }

  return false;
};

// Error Boundary Helper
export const isErrorBoundaryError = (error: Error): boolean => {
  return error instanceof Error && !(error instanceof AppError);
}; 