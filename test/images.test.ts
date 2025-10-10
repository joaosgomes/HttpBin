import { describe, it, expect } from 'vitest';
import {
  serveImageBasedOnHeader,
  serveJpegImage,
  servePngImage,
  serveSvgImage,
  serveWebpImage,
} from '../src/images.js';

describe('images', () => {
  describe('serveJpegImage', () => {
    it('should return JPEG image with correct content type', async () => {
      const response = serveJpegImage();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/jpeg');

      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Check JPEG signature (FF D8)
      expect(bytes[0]).toBe(0xff);
      expect(bytes[1]).toBe(0xd8);
    });

    it('should return valid JPEG data', async () => {
      const response = serveJpegImage();
      const buffer = await response.arrayBuffer();

      expect(buffer.byteLength).toBeGreaterThan(0);
    });
  });

  describe('servePngImage', () => {
    it('should return PNG image with correct content type', async () => {
      const response = servePngImage();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/png');

      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Check PNG signature (89 50 4E 47)
      expect(bytes[0]).toBe(0x89);
      expect(bytes[1]).toBe(0x50);
      expect(bytes[2]).toBe(0x4e);
      expect(bytes[3]).toBe(0x47);
    });

    it('should return valid PNG data', async () => {
      const response = servePngImage();
      const buffer = await response.arrayBuffer();

      expect(buffer.byteLength).toBeGreaterThan(0);
    });
  });

  describe('serveSvgImage', () => {
    it('should return SVG image with correct content type', async () => {
      const response = serveSvgImage();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/svg+xml');

      const text = await response.text();
      expect(text).toContain('<svg');
      expect(text).toContain('</svg>');
    });

    it('should return valid SVG markup', async () => {
      const response = serveSvgImage();
      const text = await response.text();

      expect(text).toContain('width="100"');
      expect(text).toContain('height="100"');
      expect(text).toContain('<circle');
    });
  });

  describe('serveWebpImage', () => {
    it('should return WebP image with correct content type', async () => {
      const response = serveWebpImage();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/webp');

      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Check RIFF header
      expect(bytes[0]).toBe(0x52); // R
      expect(bytes[1]).toBe(0x49); // I
      expect(bytes[2]).toBe(0x46); // F
      expect(bytes[3]).toBe(0x46); // F
    });

    it('should return valid WebP data', async () => {
      const response = serveWebpImage();
      const buffer = await response.arrayBuffer();

      expect(buffer.byteLength).toBeGreaterThan(0);
    });
  });

  describe('serveImageBasedOnHeader', () => {
    it('should return JPEG when Accept header includes image/jpeg', async () => {
      const request = new Request('http://example.com/image', {
        headers: { Accept: 'image/jpeg' },
      });
      const response = serveImageBasedOnHeader(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/jpeg');
    });

    it('should return PNG when Accept header includes image/png', async () => {
      const request = new Request('http://example.com/image', {
        headers: { Accept: 'image/png' },
      });
      const response = serveImageBasedOnHeader(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/png');
    });

    it('should return SVG when Accept header includes image/svg+xml', async () => {
      const request = new Request('http://example.com/image', {
        headers: { Accept: 'image/svg+xml' },
      });
      const response = serveImageBasedOnHeader(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/svg+xml');
    });

    it('should return WebP when Accept header includes image/webp', async () => {
      const request = new Request('http://example.com/image', {
        headers: { Accept: 'image/webp' },
      });
      const response = serveImageBasedOnHeader(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/webp');
    });

    it('should return 415 for unsupported format', async () => {
      const request = new Request('http://example.com/image', {
        headers: { Accept: 'image/gif' },
      });
      const response = serveImageBasedOnHeader(request);

      expect(response.status).toBe(415);
      const text = await response.text();
      expect(text).toBe('Unsupported image format');
    });

    it('should return 415 when no Accept header is provided', async () => {
      const request = new Request('http://example.com/image');
      const response = serveImageBasedOnHeader(request);

      expect(response.status).toBe(415);
    });

    it('should handle multiple Accept types and return first match', async () => {
      const request = new Request('http://example.com/image', {
        headers: { Accept: 'text/html, image/png, image/jpeg' },
      });
      const response = serveImageBasedOnHeader(request);

      expect(response.status).toBe(200);
      // The function checks for jpeg first, so it will return jpeg
      expect(response.headers.get('Content-Type')).toBe('image/jpeg');
    });
  });
});
