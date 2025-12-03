/**
 * Safely checks if a value can be rendered as a React child
 */
export function isRenderableValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  const type = typeof value;
  return type === 'string' || type === 'number' || type === 'boolean';
}

/**
 * Safely converts a value to a string for rendering
 */
export function toRenderableString(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  // For objects and arrays, return JSON string
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '[Complex Object]';
  }
}

/**
 * Checks if a value is a plain object (not an array or null)
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

/**
 * Validates that an AI response has the expected structure
 */
export function validateAIResponse<T extends Record<string, unknown>>(
  data: unknown,
  expectedKeys: string[]
): { valid: boolean; data?: T; missing?: string[] } {
  if (!isPlainObject(data)) {
    return { valid: false };
  }

  const missing = expectedKeys.filter((key) => !(key in data));

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  return { valid: true, data: data as T };
}
