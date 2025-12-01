import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create DOMPurify instance for server-side sanitization
const window = new JSDOM('').window;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const purify = DOMPurify(window as any);

/**
 * Middleware to validate request body against a Zod schema
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize input before validation
      const sanitizedBody = sanitizeInput(req.body);

      // Validate against schema
      const validated = schema.parse(sanitizedBody);

      // Replace request body with validated and sanitized data
      req.body = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details: error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        });
      }

      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid request data',
        },
      });
    }
  };
}

/**
 * Middleware to validate request query parameters against a Zod schema
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize input before validation
      const sanitizedQuery = sanitizeInput(req.query);

      // Validate against schema
      const validated = schema.parse(sanitizedQuery);

      // Replace request query with validated and sanitized data
      req.query = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details: error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        });
      }

      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid query parameters',
        },
      });
    }
  };
}

/**
 * Middleware to validate request params against a Zod schema
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate against schema (params don't need sanitization as they're from URL)
      const validated = schema.parse(req.params);

      // Replace request params with validated data
      req.params = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details: error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        });
      }

      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid URL parameters',
        },
      });
    }
  };
}

/**
 * Recursively sanitize input to prevent XSS attacks
 * Uses DOMPurify to clean HTML/script content
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Sanitize string input to prevent XSS
    return purify.sanitize(input, {
      ALLOWED_TAGS: [], // Strip all HTML tags
      ALLOWED_ATTR: [], // Strip all attributes
      KEEP_CONTENT: true, // Keep text content
    });
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item));
  }

  if (input !== null && typeof input === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitized: any = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }

  // Return primitive values as-is (numbers, booleans, null, undefined)
  return input;
}

/**
 * Sanitize HTML content while preserving safe formatting
 * Used for rich text fields like descriptions
 */
export function sanitizeHtml(html: string): string {
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Middleware to validate UUID params
 */
export function validateUUIDParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const uuid = req.params[paramName];

    if (!uuid || !isValidUUID(uuid)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: `Invalid ${paramName} format`,
        },
      });
    }

    next();
  };
}

export default {
  validateBody,
  validateQuery,
  validateParams,
  validateUUIDParam,
  sanitizeHtml,
  isValidUUID,
};
