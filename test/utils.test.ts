import { describe, it, expect } from 'vitest';
import { sleep, generateBytesWithSeed, decodeBase64Image, MAX_BYTES } from '../src/utils.js';

describe('utils', () => {
  describe('MAX_BYTES', () => {
    it('should be defined as 10MB', () => {
      expect(MAX_BYTES).toBe(10 * 1024 * 1024);
    });
  });

  describe('sleep', () => {
    it('should resolve after specified milliseconds', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(95); // Allow small margin
    });

    it('should resolve immediately for 0ms', async () => {
      const start = Date.now();
      await sleep(0);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(50);
    });
  });

  describe('generateBytesWithSeed', () => {
    it('should generate bytes of specified length', () => {
      const result = generateBytesWithSeed(100, 12345);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(100);
    });

    it('should generate deterministic output with same seed', () => {
      const result1 = generateBytesWithSeed(50, 42);
      const result2 = generateBytesWithSeed(50, 42);
      expect(result1).toEqual(result2);
    });

    it('should generate different output with different seeds', () => {
      const result1 = generateBytesWithSeed(50, 42);
      const result2 = generateBytesWithSeed(50, 43);
      expect(result1).not.toEqual(result2);
    });

    it('should generate bytes in valid range (0-255)', () => {
      const result = generateBytesWithSeed(100, 12345);
      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(255);
      }
    });

    it('should handle length of 0', () => {
      const result = generateBytesWithSeed(0, 12345);
      expect(result.length).toBe(0);
    });
  });

  describe('decodeBase64Image', () => {
    it('should decode valid base64 string', () => {
      const base64 = 'SGVsbG8gV29ybGQ='; // "Hello World"
      const result = decodeBase64Image(base64);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should decode PNG base64 correctly', () => {
      const base64PNG =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/6o06a0AAAAASUVORK5CYII=';
      const result = decodeBase64Image(base64PNG);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
      // Check PNG signature
      expect(result[0]).toBe(0x89);
      expect(result[1]).toBe(0x50);
      expect(result[2]).toBe(0x4e);
      expect(result[3]).toBe(0x47);
    });

    it('should decode JPEG base64 correctly', () => {
      const base64JPEG =
        '/9j/4AAQSkZJRgABAQAAZABkAAD/2wCEABQQEBkSGScXFycyJh8mMi4mJiYmLj41NTU1NT5EQUFBQUFBREREREREREREREREREREREREREREREREREREREQBFRkZIBwgJhgYJjYmICY2RDYrKzZERERCNUJERERERERERERERERERERERERERERERERERERERERERERERERERP/AABEIAAEAAQMBIgACEQEDEQH/xABMAAEBAAAAAAAAAAAAAAAAAAAABQEBAQAAAAAAAAAAAAAAAAAABQYQAQAAAAAAAAAAAAAAAAAAAAARAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJQA9Yv/2Q==';
      const result = decodeBase64Image(base64JPEG);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
      // Check JPEG signature
      expect(result[0]).toBe(0xff);
      expect(result[1]).toBe(0xd8);
    });

    it('should handle empty string', () => {
      const result = decodeBase64Image('');
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(0);
    });
  });
});
