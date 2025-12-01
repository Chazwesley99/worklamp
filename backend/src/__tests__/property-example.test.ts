import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Example property-based test demonstrating the setup
// **Feature: worklamp-platform, Property Example: String concatenation associativity**
describe('Property-Based Testing Example', () => {
  it('string concatenation is associative', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), fc.string(), (a, b, c) => {
        // Property: (a + b) + c === a + (b + c)
        const left = a + b + c;
        const right = a + (b + c);
        expect(left).toBe(right);
      }),
      { numRuns: 100 }
    );
  });

  it('array length after push equals original length plus one', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), fc.integer(), (arr, item) => {
        const originalLength = arr.length;
        arr.push(item);
        expect(arr.length).toBe(originalLength + 1);
      }),
      { numRuns: 100 }
    );
  });
});
