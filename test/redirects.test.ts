import { describe, it, expect } from 'vitest';
import {
  absoluteRedirect,
  serveRelativeRedirects,
  serveMultipleRedirects,
  serveRedirectTo,
} from '../src/redirects.js';

describe('redirects', () => {
  describe('absoluteRedirect', () => {
    it('should redirect with absolute URL', async () => {
      const url = new URL('http://example.com/absolute-redirect/5');
      const response = absoluteRedirect('/absolute-redirect/5', url);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('http://example.com/absolute-redirect/4');

      const text = await response.text();
      expect(text).toBe('');
    });

    it('should return final response when count is 0', async () => {
      const url = new URL('http://example.com/absolute-redirect/0');
      const response = absoluteRedirect('/absolute-redirect/0', url);

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('Final redirect reached');
    });

    it('should return 400 for invalid redirect count', async () => {
      const url = new URL('http://example.com/absolute-redirect/invalid');
      const response = absoluteRedirect('/absolute-redirect/invalid', url);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Invalid number of redirects');
    });

    it('should return 400 for negative redirect count', async () => {
      const url = new URL('http://example.com/absolute-redirect/-1');
      const response = absoluteRedirect('/absolute-redirect/-1', url);

      expect(response.status).toBe(400);
    });

    it('should decrement redirect count correctly', async () => {
      const url = new URL('http://example.com/absolute-redirect/3');
      const response = absoluteRedirect('/absolute-redirect/3', url);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('http://example.com/absolute-redirect/2');
    });

    it('should handle redirect count of 1', async () => {
      const url = new URL('http://example.com/absolute-redirect/1');
      const response = absoluteRedirect('/absolute-redirect/1', url);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('http://example.com/absolute-redirect/0');
    });
  });

  describe('serveRelativeRedirects', () => {
    it('should redirect with relative URL', async () => {
      const url = new URL('http://example.com/relative-redirect/5');
      const response = serveRelativeRedirects('/relative-redirect/5', url);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/relative-redirect/4');
    });

    it('should return final response when count is 0', async () => {
      const url = new URL('http://example.com/relative-redirect/0');
      const response = serveRelativeRedirects('/relative-redirect/0', url);

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('Final Redirect');
    });

    it('should return 400 for invalid redirect count', async () => {
      const url = new URL('http://example.com/relative-redirect/invalid');
      const response = serveRelativeRedirects('/relative-redirect/invalid', url);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Invalid redirect count');
    });

    it('should return 400 for negative redirect count', async () => {
      const url = new URL('http://example.com/relative-redirect/-1');
      const response = serveRelativeRedirects('/relative-redirect/-1', url);

      expect(response.status).toBe(400);
    });

    it('should decrement redirect count correctly', async () => {
      const url = new URL('http://example.com/relative-redirect/3');
      const response = serveRelativeRedirects('/relative-redirect/3', url);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/relative-redirect/2');
    });
  });

  describe('serveMultipleRedirects', () => {
    it('should redirect with decremented count', async () => {
      const response = serveMultipleRedirects('/redirect/5');

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/redirect/4');
    });

    it('should return final response when count is 0', async () => {
      const response = serveMultipleRedirects('/redirect/0');

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('Final Redirect');
    });

    it('should return 400 for invalid redirect count', async () => {
      const response = serveMultipleRedirects('/redirect/invalid');

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Invalid redirect count');
    });

    it('should return 400 for negative redirect count', async () => {
      const response = serveMultipleRedirects('/redirect/-1');

      expect(response.status).toBe(400);
    });

    it('should handle redirect count of 1', async () => {
      const response = serveMultipleRedirects('/redirect/1');

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/redirect/0');
    });

    it('should handle large redirect counts', async () => {
      const response = serveMultipleRedirects('/redirect/100');

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/redirect/99');
    });
  });

  describe('serveRedirectTo', () => {
    it('should redirect to specified URL with default status', async () => {
      const params = new URLSearchParams({ url: 'https://example.com' });
      const response = serveRedirectTo(params);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('https://example.com');
    });

    it('should redirect with custom status code', async () => {
      const params = new URLSearchParams({
        url: 'https://example.com',
        status_code: '301',
      });
      const response = serveRedirectTo(params);

      expect(response.status).toBe(301);
      expect(response.headers.get('Location')).toBe('https://example.com');
    });

    it('should handle 307 temporary redirect', async () => {
      const params = new URLSearchParams({
        url: 'https://example.com/new-location',
        status_code: '307',
      });
      const response = serveRedirectTo(params);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('https://example.com/new-location');
    });

    it('should handle 308 permanent redirect', async () => {
      const params = new URLSearchParams({
        url: 'https://example.com/permanent',
        status_code: '308',
      });
      const response = serveRedirectTo(params);

      expect(response.status).toBe(308);
      expect(response.headers.get('Location')).toBe('https://example.com/permanent');
    });

    it('should return 400 when URL parameter is missing', async () => {
      const params = new URLSearchParams();
      const response = serveRedirectTo(params);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('URL parameter is missing');
    });

    it('should handle relative URLs', async () => {
      const params = new URLSearchParams({ url: '/relative/path' });
      const response = serveRedirectTo(params);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/relative/path');
    });

    it('should handle URLs with query parameters', async () => {
      const params = new URLSearchParams({ url: 'https://example.com?foo=bar&baz=qux' });
      const response = serveRedirectTo(params);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('https://example.com?foo=bar&baz=qux');
    });

    it('should handle URLs with fragments', async () => {
      const params = new URLSearchParams({ url: 'https://example.com#section' });
      const response = serveRedirectTo(params);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('https://example.com#section');
    });

    it('should handle valid numeric status_code as string', async () => {
      const params = new URLSearchParams({
        url: 'https://example.com',
        status_code: '303',
      });
      const response = serveRedirectTo(params);

      expect(response.status).toBe(303);
      expect(response.headers.get('Location')).toBe('https://example.com');
    });
  });
});
