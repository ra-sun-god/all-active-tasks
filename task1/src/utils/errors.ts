export type ErrorCode =
  | 'USER_EXISTS'
  | 'AUTH_INVALID'
  | 'WEAK_PASSWORD'
  | 'INVALID_RATING'
  | 'COMMENT_TOO_LONG'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'UNKNOWN_ENTITY'
  | 'NOT_FOUND' 
  | 'FORBIDDEN'
  
  
export const ERRORS: Record<
  ErrorCode,
  { message: string; statusCode: number }
> = {
  USER_EXISTS: {
    message: 'User already exists',
    statusCode: 409
  },
  AUTH_INVALID: {
    message: 'Invalid email or password',
    statusCode: 401
  },
  WEAK_PASSWORD: {
    message: 'Password is too weak',
    statusCode: 400
  },
  INVALID_RATING: {
    message: 'Rating must be between 1 and 5',
    statusCode: 400
  },
  COMMENT_TOO_LONG: {
    message: 'Comment exceeds max length',
    statusCode: 400
  },
  VALIDATION_ERROR: {
    message: 'Validation error',
    statusCode: 400
  },
  INTERNAL_ERROR: {
    message: 'Internal server error',
    statusCode: 500
  },
  UNKNOWN_ENTITY: {
    message: 'Partner not found',
    statusCode: 404
  },
  
  NOT_FOUND: {
    statusCode: 404,
    message: 'Resource not found'
  },
  
  FORBIDDEN: {
    statusCode: 403,
    message: 'You do not have permission to perform this action'
  }
}
