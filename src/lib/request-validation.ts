/**
 * Request validation utilities for API routes
 * Provides consistent validation and error handling
 */

export const REQUEST_SIZE_LIMITS = {
  // Maximum request body sizes by endpoint type
  DEFAULT: 1024 * 1024, // 1MB
  CODE_SNIPPET: 1024 * 100, // 100KB for code
  NOTES: 1024 * 10, // 10KB for notes/text
  FILENAME: 200, // 200 chars for filenames
  TITLE: 500, // 500 chars for titles
  URL: 2000, // 2KB for URLs
} as const;

export interface ValidationError {
  field: string;
  message: string;
  maxSize?: number;
  actualSize?: number;
}

/**
 * Validates the size of a string field
 */
export function validateStringSize(
  value: string | undefined | null,
  fieldName: string,
  maxSize: number
): ValidationError | null {
  if (!value) return null;
  
  const actualSize = new Blob([value]).size;
  
  if (actualSize > maxSize) {
    return {
      field: fieldName,
      message: `${fieldName} exceeds maximum size`,
      maxSize,
      actualSize
    };
  }
  
  return null;
}

/**
 * Validates multiple fields
 */
export function validateFields(fields: Array<{
  value: string | undefined | null;
  name: string;
  maxSize: number;
}>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const field of fields) {
    const error = validateStringSize(field.value, field.name, field.maxSize);
    if (error) {
      errors.push(error);
    }
  }
  
  return errors;
}

/**
 * Validates problem data before saving
 */
export function validateProblemData(data: any): ValidationError[] {
  return validateFields([
    { value: data.title, name: 'title', maxSize: REQUEST_SIZE_LIMITS.TITLE },
    { value: data.url, name: 'url', maxSize: REQUEST_SIZE_LIMITS.URL },
    { value: data.notes, name: 'notes', maxSize: REQUEST_SIZE_LIMITS.NOTES },
    { value: data.codeSnippet, name: 'codeSnippet', maxSize: REQUEST_SIZE_LIMITS.CODE_SNIPPET },
    { value: data.codeLanguage, name: 'codeLanguage', maxSize: 50 },
    { value: data.codeFilename, name: 'codeFilename', maxSize: REQUEST_SIZE_LIMITS.FILENAME },
  ]);
}

/**
 * Formats validation errors for API response
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(err => {
    if (err.maxSize && err.actualSize) {
      const maxKB = (err.maxSize / 1024).toFixed(1);
      const actualKB = (err.actualSize / 1024).toFixed(1);
      return `${err.field}: ${actualKB}KB exceeds limit of ${maxKB}KB`;
    }
    return `${err.field}: ${err.message}`;
  }).join('; ');
}

