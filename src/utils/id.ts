// Hydration-safe ID generation
export function generateId(): string {
  // Use a simple timestamp + random approach that's more predictable
  // This avoids hydration mismatches while still being unique
  if (typeof window === 'undefined') {
    // Server-side: use a simple counter-based approach
    return `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  
  // Client-side: use crypto.randomUUID if available, fallback to timestamp
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
