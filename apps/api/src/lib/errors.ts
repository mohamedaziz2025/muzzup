export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational = true;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Requête invalide", details?: unknown) {
    super(400, "BAD_REQUEST", message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentification requise") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Accès refusé") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Ressource introuvable") {
    super(404, "NOT_FOUND", message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflit détecté", details?: unknown) {
    super(409, "CONFLICT", message, details);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = "Contenu non conforme", details?: unknown) {
    super(422, "UNPROCESSABLE_ENTITY", message, details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Trop de requêtes, réessayez plus tard") {
    super(429, "TOO_MANY_REQUESTS", message);
  }
}
