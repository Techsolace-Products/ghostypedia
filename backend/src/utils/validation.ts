/**
 * Validation utilities for request data
 */

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationException extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Validation failed');
    this.name = 'ValidationException';
    this.errors = errors;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements: at least 8 characters
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Validate username format
 * Requirements: 3-100 characters, alphanumeric and underscores only
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,100}$/;
  return usernameRegex.test(username);
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate registration data
 */
export function validateRegistrationData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (!isValidPassword(data.password)) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }

  if (!data.username) {
    errors.push({ field: 'username', message: 'Username is required' });
  } else if (!isValidUsername(data.username)) {
    errors.push({
      field: 'username',
      message: 'Username must be 3-100 characters and contain only letters, numbers, and underscores',
    });
  }

  return errors;
}

/**
 * Validate login data
 */
export function validateLoginData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
}

/**
 * Validate password reset request data
 */
export function validatePasswordResetRequest(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  return errors;
}

/**
 * Validate password reset data
 */
export function validatePasswordReset(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.token) {
    errors.push({ field: 'token', message: 'Reset token is required' });
  }

  if (!data.newPassword) {
    errors.push({ field: 'newPassword', message: 'New password is required' });
  } else if (!isValidPassword(data.newPassword)) {
    errors.push({ field: 'newPassword', message: 'Password must be at least 8 characters' });
  }

  return errors;
}
