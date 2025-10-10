import { describe, it, expect } from 'vitest';
import { decodeBase64, encodeBase64 } from '../src/encoding.js';

describe('encoding', () => {
  describe('decodeBase64', () => {
    it('should decode valid base64 string', async () => {
      const path = '/base64/decode/SGVsbG8gV29ybGQ='; // "Hello World"
      const response = decodeBase64(path);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/plain');

      const text = await response.text();
      expect(text).toBe('Hello World');
    });

    it('should decode URL encoded base64 string', async () => {
      const path = '/base64/decode/SGVsbG8lMjBXb3JsZA%3D%3D'; // URL encoded "Hello World"
      const response = decodeBase64(path);

      expect(response.status).toBe(200);
      const text = await response.text();
      // The function decodes URL encoding, resulting in "Hello%20World" being decoded from base64
      expect(text).toBe('Hello%20World');
    });

    it('should handle empty base64 string', async () => {
      const path = '/base64/decode/';
      const response = decodeBase64(path);

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('');
    });

    it('should return error for invalid base64', async () => {
      const path = '/base64/decode/invalid!!!base64';
      const response = decodeBase64(path);

      expect(response.status).toBe(400);
      const text = await response.text();

      expect(text).toBe('Error decoding base64: InvalidCharacterError: Invalid character');
    });
  });

  describe('encodeBase64', () => {
    it('should encode plain text to base64', async () => {
      const path = '/base64/encode/Hello World';
      const response = encodeBase64(path);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/plain');

      const text = await response.text();
      expect(text).toBe('SGVsbG8gV29ybGQ=');
    });

    it('should encode URL encoded string', async () => {
      const path = '/base64/encode/Hello%20World';
      const response = encodeBase64(path);

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('SGVsbG8gV29ybGQ=');
    });

    it('should handle empty string', async () => {
      const path = '/base64/encode/';
      const response = encodeBase64(path);

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('');
    });

    it('should encode special characters', async () => {
      const path = '/base64/encode/test@123!';
      const response = encodeBase64(path);

      expect(response.status).toBe(200);
      const text = await response.text();
      // Verify it's valid base64
      expect(text).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
    });

    it('should handle ASCII characters', async () => {
      const path = '/base64/encode/TestString123';
      const response = encodeBase64(path);

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
    });
  });

  describe('encode-decode roundtrip', () => {
    it('should successfully roundtrip encode and decode', async () => {
      const original = 'Test String 123';
      const encodePath = `/base64/encode/${original}`;
      const encodeResponse = encodeBase64(encodePath);
      const encoded = await encodeResponse.text();

      const decodePath = `/base64/decode/${encoded}`;
      const decodeResponse = decodeBase64(decodePath);
      const decoded = await decodeResponse.text();

      expect(decoded).toBe(original);
    });
  });
});
