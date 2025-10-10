import { describe, it, expect } from 'vitest';
import { challengeBasicAuth } from '../src/auth.js';

describe('auth', () => {
  describe('challengeBasicAuth', () => {
    it('should return 401 when no Authorization header is provided', async () => {
      const request = new Request('http://example.com/basic-auth/user/pass');
      const response = challengeBasicAuth(request, '/basic-auth/user/pass');

      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBe('Basic realm="Secure Area"');

      const text = await response.text();
      expect(text).toBe('Unauthorized');
    });

    it('should return 401 when Authorization header is not Basic', async () => {
      const request = new Request('http://example.com/basic-auth/user/pass', {
        headers: { Authorization: 'Bearer token123' },
      });
      const response = challengeBasicAuth(request, '/basic-auth/user/pass');

      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBe('Basic realm="Secure Area"');
    });

    it('should return 200 with correct credentials', async () => {
      const credentials = btoa('testuser:testpass');
      const request = new Request('http://example.com/basic-auth/testuser/testpass', {
        headers: { Authorization: `Basic ${credentials}` },
      });
      const response = challengeBasicAuth(request, '/basic-auth/testuser/testpass');

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('Authorized');
    });

    it('should return 401 with incorrect username', async () => {
      const credentials = btoa('wronguser:testpass');
      const request = new Request('http://example.com/basic-auth/testuser/testpass', {
        headers: { Authorization: `Basic ${credentials}` },
      });
      const response = challengeBasicAuth(request, '/basic-auth/testuser/testpass');

      expect(response.status).toBe(401);
      const text = await response.text();
      expect(text).toContain('Unauthorized');
      expect(text).toContain('expected testuser:testpass');
      expect(text).toContain('got wronguser:testpass');
    });

    it('should return 401 with incorrect password', async () => {
      const credentials = btoa('testuser:wrongpass');
      const request = new Request('http://example.com/basic-auth/testuser/testpass', {
        headers: { Authorization: `Basic ${credentials}` },
      });
      const response = challengeBasicAuth(request, '/basic-auth/testuser/testpass');

      expect(response.status).toBe(401);
      const text = await response.text();
      expect(text).toContain('Unauthorized');
      expect(text).toContain('expected testuser:testpass');
      expect(text).toContain('got testuser:wrongpass');
    });

    it('should handle special characters in credentials', async () => {
      const username = 'user';
      const password = 'pass123';
      const credentials = btoa(`${username}:${password}`);
      const request = new Request(`http://example.com/basic-auth/${username}/${password}`, {
        headers: { Authorization: `Basic ${credentials}` },
      });
      const response = challengeBasicAuth(request, `/basic-auth/${username}/${password}`);

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('Authorized');
    });

    it('should handle empty password', async () => {
      const credentials = btoa('testuser:');
      const request = new Request('http://example.com/basic-auth/testuser/', {
        headers: { Authorization: `Basic ${credentials}` },
      });
      const response = challengeBasicAuth(request, '/basic-auth/testuser/');

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('Authorized');
    });

    it('should handle simple alphanumeric credentials', async () => {
      const username = 'user123';
      const password = 'password123';
      const credentials = btoa(`${username}:${password}`);
      const request = new Request(`http://example.com/basic-auth/${username}/${password}`, {
        headers: { Authorization: `Basic ${credentials}` },
      });
      const response = challengeBasicAuth(request, `/basic-auth/${username}/${password}`);

      expect(response.status).toBe(200);
    });
  });
});
