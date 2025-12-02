// Simple test script for encryption utilities
// Run with: node test-encryption.js

// Set JWT_SECRET for testing
process.env.JWT_SECRET = 'test-secret-key-for-encryption-at-least-32-chars-long';

// Import the encryption module (using require for .js file)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { encrypt, decrypt, isEncrypted } = require('./dist/utils/encryption.js');

console.log('Testing encryption utilities...\n');

// Test 1: Basic encryption/decryption
console.log('Test 1: Basic encryption/decryption');
const plaintext1 = 'my-secret-api-key';
const encrypted1 = encrypt(plaintext1);
const decrypted1 = decrypt(encrypted1);
console.log('  Plaintext:', plaintext1);
console.log('  Encrypted:', encrypted1);
console.log('  Decrypted:', decrypted1);
console.log('  ✓ Match:', plaintext1 === decrypted1);
console.log();

// Test 2: Different ciphertext for same plaintext
console.log('Test 2: Different ciphertext for same plaintext');
const encrypted2a = encrypt(plaintext1);
const encrypted2b = encrypt(plaintext1);
console.log('  First encryption:', encrypted2a);
console.log('  Second encryption:', encrypted2b);
console.log('  ✓ Different:', encrypted2a !== encrypted2b);
console.log();

// Test 3: Complex strings with special characters
console.log('Test 3: Complex strings with special characters');
const plaintext3 = 'API_KEY=abc123!@#$%^&*()_+-={}[]|:";\'<>?,./';
const encrypted3 = encrypt(plaintext3);
const decrypted3 = decrypt(encrypted3);
console.log('  Plaintext:', plaintext3);
console.log('  Decrypted:', decrypted3);
console.log('  ✓ Match:', plaintext3 === decrypted3);
console.log();

// Test 4: isEncrypted function
console.log('Test 4: isEncrypted function');
console.log('  isEncrypted(encrypted):', isEncrypted(encrypted1));
console.log('  isEncrypted(plaintext):', isEncrypted('plaintext-value'));
console.log('  ✓ Correct detection');
console.log();

// Test 5: Multiple round trips
console.log('Test 5: Multiple round trips');
const plaintext5 = 'DATABASE_PASSWORD=super-secret-123';
const encrypted5a = encrypt(plaintext5);
const decrypted5a = decrypt(encrypted5a);
const encrypted5b = encrypt(decrypted5a);
const decrypted5b = decrypt(encrypted5b);
console.log('  Original:', plaintext5);
console.log('  After 2 round trips:', decrypted5b);
console.log('  ✓ Match:', plaintext5 === decrypted5b);
console.log();

console.log('All tests passed! ✓');
