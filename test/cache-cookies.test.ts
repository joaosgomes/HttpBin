import { describe, it, expect } from 'vitest';
import {
  checkCacheHeaders,
  setCacheControl,
  getCookies,
  deleteCookies,
  setCookies,
} from '../src/cache-cookies.js';

describe('cache-cookies', () => {
  describe('checkCacheHeaders', () => {
    it('should return 304 when If-Modified-Since header is present', async () => {
      const request = new Request('http://example.com/cache', {
        headers: { 'If-Modified-Since': 'Wed, 21 Oct 2015 07:28:00 GMT' },
      });
      const response = checkCacheHeaders(request);

      expect(response.status).toBe(304);
      const text = await response.text();
      expect(text).toBe('');
    });

    it('should return 304 when If-None-Match header is present', async () => {
      const request = new Request('http://example.com/cache', {
        headers: { 'If-None-Match': '"etag-value"' },
      });
      const response = checkCacheHeaders(request);

      expect(response.status).toBe(304);
    });

    it('should return 200 when no cache headers are present', async () => {
      const request = new Request('http://example.com/cache');
      const response = checkCacheHeaders(request);

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('Cache Endpoint');
    });

    it('should return 304 when both cache headers are present', async () => {
      const request = new Request('http://example.com/cache', {
        headers: {
          'If-Modified-Since': 'Wed, 21 Oct 2015 07:28:00 GMT',
          'If-None-Match': '"etag-value"',
        },
      });
      const response = checkCacheHeaders(request);

      expect(response.status).toBe(304);
    });
  });

  describe('setCacheControl', () => {
    it('should set Cache-Control header with specified seconds', async () => {
      const request = new Request('http://example.com/cache/3600');
      const response = setCacheControl(request, '/cache/3600');

      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600');

      const text = await response.text();
      expect(text).toBe('Cache-Control set');
    });

    it('should handle zero seconds', async () => {
      const request = new Request('http://example.com/cache/0');
      const response = setCacheControl(request, '/cache/0');

      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=0');
    });

    it('should return 400 for invalid cache time', async () => {
      const request = new Request('http://example.com/cache/invalid');
      const response = setCacheControl(request, '/cache/invalid');

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Invalid cache time');
    });

    it('should handle large cache times', async () => {
      const request = new Request('http://example.com/cache/86400');
      const response = setCacheControl(request, '/cache/86400');

      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=86400');
    });
  });

  describe('getCookies', () => {
    it('should parse and return cookies as JSON', async () => {
      const request = new Request('http://example.com/cookies', {
        headers: { Cookie: 'session=abc123; user=john' },
      });
      const response = getCookies(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(data).toEqual({
        session: 'abc123',
        user: 'john',
      });
    });

    it('should return empty object when no cookies are present', async () => {
      const request = new Request('http://example.com/cookies');
      const response = getCookies(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({});
    });

    it('should handle URL encoded cookie values', async () => {
      const request = new Request('http://example.com/cookies', {
        headers: { Cookie: 'name=John%20Doe; city=New%20York' },
      });
      const response = getCookies(request);

      const data = await response.json();
      expect(data).toEqual({
        name: 'John Doe',
        city: 'New York',
      });
    });

    it('should handle single cookie', async () => {
      const request = new Request('http://example.com/cookies', {
        headers: { Cookie: 'token=xyz789' },
      });
      const response = getCookies(request);

      const data = await response.json();
      expect(data).toEqual({ token: 'xyz789' });
    });

    it('should handle cookies with special characters', async () => {
      const request = new Request('http://example.com/cookies', {
        headers: { Cookie: 'data=test%40example.com' },
      });
      const response = getCookies(request);

      const data = await response.json();
      expect(data).toEqual({ data: 'test@example.com' });
    });
  });

  describe('deleteCookies', () => {
    it('should set expired cookies for deletion', async () => {
      const url = new URL('http://example.com/cookies/delete?session&user');
      const request = new Request(url);
      const response = deleteCookies(request, url);

      expect(response.status).toBe(200);

      const setCookieHeaders = response.headers.get('Set-Cookie');
      expect(setCookieHeaders).toBeTruthy();

      const text = await response.text();
      expect(text).toContain('Cookies deleted');
      expect(text).toContain('session');
      expect(text).toContain('user');
    });

    it('should handle single cookie deletion', async () => {
      const url = new URL('http://example.com/cookies/delete?token');
      const request = new Request(url);
      const response = deleteCookies(request, url);

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('Cookies deleted: token');
    });

    it('should handle no cookies to delete', async () => {
      const url = new URL('http://example.com/cookies/delete');
      const request = new Request(url);
      const response = deleteCookies(request, url);

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('Cookies deleted: ');
    });

    it('should set correct expiration date for deleted cookies', async () => {
      const url = new URL('http://example.com/cookies/delete?test');
      const request = new Request(url);
      const response = deleteCookies(request, url);

      const setCookie = response.headers.get('Set-Cookie');
      expect(setCookie).toContain('expires=Thu, 01 Jan 1970 00:00:00 GMT');
      expect(setCookie).toContain('path=/');
    });
  });

  describe('setCookies', () => {
    it('should set cookies from query parameters', async () => {
      const url = new URL('http://example.com/cookies/set?session=abc123&user=john');
      const request = new Request(url);
      const response = setCookies(request, url);

      expect(response.status).toBe(200);

      const text = await response.text();
      expect(text).toBe('Cookies set');
    });

    it('should handle single cookie', async () => {
      const url = new URL('http://example.com/cookies/set?token=xyz789');
      const request = new Request(url);
      const response = setCookies(request, url);

      expect(response.status).toBe(200);
      const setCookie = response.headers.get('Set-Cookie');
      expect(setCookie).toBeTruthy();
    });

    it('should handle no cookies to set', async () => {
      const url = new URL('http://example.com/cookies/set');
      const request = new Request(url);
      const response = setCookies(request, url);

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('Cookies set');
    });

    it('should URL encode cookie values', async () => {
      const url = new URL('http://example.com/cookies/set?name=John Doe&email=test@example.com');
      const request = new Request(url);
      const response = setCookies(request, url);

      expect(response.status).toBe(200);
      const setCookie = response.headers.get('Set-Cookie');
      expect(setCookie).toBeTruthy();
    });

    it('should set path for all cookies', async () => {
      const url = new URL('http://example.com/cookies/set?test=value');
      const request = new Request(url);
      const response = setCookies(request, url);

      const setCookie = response.headers.get('Set-Cookie');
      expect(setCookie).toContain('path=/');
    });
  });
});
