/**
 * Input Validation and Sanitization Utilities
 * Prevents injection attacks and ensures data integrity
 */

/**
 * Validate MongoDB ObjectId format
 * Prevents invalid ID injection and database errors
 */
export function isValidObjectId(id: string): boolean {
  if (typeof id !== 'string') {
    return false;
  }
  // MongoDB ObjectId is a 24-character hex string
  return /^[a-fA-F0-9]{24}$/.test(id);
}

/**
 * Validate and sanitize MongoDB ObjectId
 * Throws an error if invalid
 */
export function sanitizeObjectId(id: string, fieldName: string = 'ID'): string {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
  return id;
}

/**
 * Sanitize email input to prevent NoSQL injection
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    throw new Error('Email must be a string');
  }
  
  // Remove any MongoDB operators
  const sanitized = email.replace(/[${}]/g, '');
  
  // Basic email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized.toLowerCase().trim();
}

/**
 * Sanitize username to prevent injection and XSS
 */
export function sanitizeUsername(username: string): string {
  if (typeof username !== 'string') {
    throw new Error('Username must be a string');
  }
  
  // Remove any MongoDB operators and special characters
  const sanitized = username.replace(/[<>${}'"\\]/g, '');
  
  // Only allow alphanumeric, underscore, hyphen
  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  if (sanitized.length < 3 || sanitized.length > 30) {
    throw new Error('Username must be between 3 and 30 characters');
  }
  
  return sanitized.trim();
}

/**
 * Validate password strength
 * Requirements: min 8 chars, uppercase, lowercase, number, special character
 */
export function validatePassword(password: string): void {
  if (typeof password !== 'string') {
    throw new Error('Password must be a string');
  }
  
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    throw new Error('Password must not exceed 128 characters');
  }
  
  // Check for at least one uppercase, one lowercase, one number, and one special character
  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    throw new Error('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(password)) {
    throw new Error('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  }
}

/**
 * Sanitize string input to prevent NoSQL injection
 */
export function sanitizeString(input: string, fieldName: string = 'Input'): string {
  if (typeof input !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  
  // Remove MongoDB operators
  const sanitized = input.replace(/[${}]/g, '');
  
  return sanitized.trim();
}

/**
 * Sanitize and validate URL
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    throw new Error('URL must be a string');
  }
  
  // Remove whitespace
  const sanitized = url.trim();
  
  // Validate URL format
  try {
    const urlObj = new URL(sanitized);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('URL must use HTTP or HTTPS protocol');
    }
    
    return sanitized;
  } catch {
    throw new Error('Invalid URL format');
  }
}

/**
 * Sanitize MongoDB query parameters
 */
export function sanitizeQueryParam(param: unknown): string | undefined {
  if (param === null || param === undefined) {
    return undefined;
  }
  
  if (typeof param !== 'string') {
    throw new Error('Query parameter must be a string');
  }
  
  // Remove MongoDB operators
  return param.replace(/[${}]/g, '').trim();
}

/**
 * Validate and sanitize integer input
 */
export function sanitizeInteger(input: string | number, min?: number, max?: number): number {
  const num = typeof input === 'string' ? parseInt(input, 10) : input;
  
  if (isNaN(num)) {
    throw new Error('Value must be a valid number');
  }
  
  if (min !== undefined && num < min) {
    throw new Error(`Value must be at least ${min}`);
  }
  
  if (max !== undefined && num > max) {
    throw new Error(`Value must not exceed ${max}`);
  }
  
  return num;
}

/**
 * Sanitize array of strings
 */
export function sanitizeStringArray(arr: unknown, fieldName: string = 'Array'): string[] {
  if (!Array.isArray(arr)) {
    return [];
  }
  
  return arr
    .filter(item => typeof item === 'string')
    .map(item => sanitizeString(item, fieldName))
    .slice(0, 50); // Limit array size to prevent DoS
}

