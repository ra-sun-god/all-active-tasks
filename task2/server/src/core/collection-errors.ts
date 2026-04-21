export abstract class DomainError extends Error {
  abstract statusCode: number;
  constructor(message: string) { super(message); }
}

export class NotFoundError extends DomainError {
  statusCode = 404;
  constructor(resource: string) { super(`${resource} not found`); }
}

export class ForbiddenError extends DomainError {
  statusCode = 403;
  constructor(message = 'Access denied') { super(message); }
}

export class ValidationError extends DomainError {
  statusCode = 400;
  constructor(message: string) { super(message); }
}

export class ConflictError extends DomainError {
  statusCode = 409;
  constructor(message: string) { super(message); }
}

export class InternalError extends DomainError {
  statusCode = 500;
  constructor(message: string = "Server Busy") { super(message); }
}

export class InvalidCredentialsError extends DomainError {
  statusCode = 401; // Unauthorized
  constructor(message: string) { super(message); }
}

export class UserAlreadyExistsError extends DomainError {
  statusCode = 409; // Conflict
  constructor(message: string) { super(message); }
}

export class WeakPasswordError extends DomainError {
  statusCode = 400;
  constructor(message: string) { super(message); }
}
