import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt, isEncrypted } from './encryption';

describe('Encryption Utilities', () => {
  beforeAll(() => {
    // Set encryption key for tests
    process.env.JWT_SECRET = 'test-secret-key-for-encryption-at-least-32-chars-long';
  });

  describe('encrypt', () => {
    it('should encrypt a plaintext string', () => {
      const plaintext = 'my-secret-api-key';
      const encrypted = encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.split(':')).toHaveLength(4);
    });

    it('should produce different ciphertext for same plaintext', () => {
      const plaintext = 'my-secret-api-key';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should throw error for empty plaintext', () => {
      expect(() => encrypt('')).toThrow('Cannot encrypt empty value');
    });
  });

  describe('decrypt', () => {
    it('should decrypt an encrypted string', () => {
      const plaintext = 'my-secret-api-key';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt complex strings with special characters', () => {
      const plaintext = 'API_KEY=abc123!@#$%^&*()_+-={}[]|:";\'<>?,./';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error for invalid encrypted data format', () => {
      expect(() => decrypt('invalid-format')).toThrow('Invalid encrypted data format');
    });

    it('should throw error for empty encrypted data', () => {
      expect(() => decrypt('')).toThrow('Cannot decrypt empty value');
    });
  });

  describe('isEncrypted', () => {
    it('should return true for encrypted data', () => {
      const plaintext = 'my-secret-api-key';
      const encrypted = encrypt(plaintext);

      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('should return false for plaintext', () => {
      expect(isEncrypted('plaintext-value')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isEncrypted('')).toBe(false);
    });
  });

  describe('round-trip encryption', () => {
    it('should maintain data integrity through multiple encrypt/decrypt cycles', () => {
      const plaintext = 'DATABASE_PASSWORD=super-secret-123';

      // First cycle
      const encrypted1 = encrypt(plaintext);
      const decrypted1 = decrypt(encrypted1);
      expect(decrypted1).toBe(plaintext);

      // Second cycle
      const encrypted2 = encrypt(decrypted1);
      const decrypted2 = decrypt(encrypted2);
      expect(decrypted2).toBe(plaintext);
    });
  });
});
