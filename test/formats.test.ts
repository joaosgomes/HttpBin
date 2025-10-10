import { describe, it, expect } from 'vitest';
import {
  serveJSON,
  serveJSONValue,
  serveXML,
  serveXMLValue,
  generateRandomBytes,
  serveRange,
  serveStatus,
  serveStatusNoResponse,
  serveResponseHeaders,
} from '../src/formats.js';

describe('formats', () => {
  describe('serveJSON', () => {
    it('should return JSON response with correct content type', async () => {
      const response = serveJSON();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(data).toEqual({
        message: 'This is a simple JSON response.',
        status: 'success',
      });
    });
  });

  describe('serveJSONValue', () => {
    it('should parse and return valid JSON', async () => {
      const jsonObj = { test: 'value', number: 42 };
      const path = `/json/${encodeURIComponent(JSON.stringify(jsonObj))}`;
      const response = serveJSONValue(path);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(data).toEqual(jsonObj);
    });

    it('should return 400 for invalid JSON', async () => {
      const path = '/json/invalid-json{';
      const response = serveJSONValue(path);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toContain('Invalid JSON format');
    });

    it('should return 400 for empty value', async () => {
      const path = '/json/';
      const response = serveJSONValue(path);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Invalid value');
    });

    it('should handle URL encoded JSON', async () => {
      const path = '/json/' + encodeURIComponent('{"key":"value"}');
      const response = serveJSONValue(path);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ key: 'value' });
    });
  });

  describe('serveXML', () => {
    it('should return XML response with correct content type', async () => {
      const response = serveXML();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/xml');

      const text = await response.text();
      expect(text).toContain('<?xml version="1.0"?>');
      expect(text).toContain('<note>');
      expect(text).toContain('<to>User</to>');
    });
  });

  describe('serveXMLValue', () => {
    it('should return provided XML value', async () => {
      const xmlContent = '<root><item>test</item></root>';
      const path = `/xml/${encodeURIComponent(xmlContent)}`;
      const response = serveXMLValue(path);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/xml');

      const text = await response.text();
      expect(text).toBe(xmlContent);
    });

    it('should return 400 for empty value', async () => {
      const path = '/xml/';
      const response = serveXMLValue(path);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Invalid value');
    });
  });

  describe('generateRandomBytes', () => {
    it('should generate specified number of bytes', async () => {
      const url = new URL('http://example.com/bytes/100');
      const response = generateRandomBytes('/bytes/100', url);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/octet-stream');

      const buffer = await response.arrayBuffer();
      expect(buffer.byteLength).toBe(100);
    });

    it('should generate deterministic bytes with seed', async () => {
      const url1 = new URL('http://example.com/bytes/50?seed=12345');
      const response1 = generateRandomBytes('/bytes/50', url1);
      const buffer1 = await response1.arrayBuffer();

      const url2 = new URL('http://example.com/bytes/50?seed=12345');
      const response2 = generateRandomBytes('/bytes/50', url2);
      const buffer2 = await response2.arrayBuffer();

      expect(new Uint8Array(buffer1)).toEqual(new Uint8Array(buffer2));
    });

    it('should return 400 for invalid number', async () => {
      const url = new URL('http://example.com/bytes/invalid');
      const response = generateRandomBytes('/bytes/invalid', url);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Invalid number of bytes');
    });

    it('should return 400 for negative number', async () => {
      const url = new URL('http://example.com/bytes/-10');
      const response = generateRandomBytes('/bytes/-10', url);

      expect(response.status).toBe(400);
    });

    it('should return 400 for exceeding MAX_BYTES', async () => {
      const url = new URL('http://example.com/bytes/99999999');
      const response = generateRandomBytes('/bytes/99999999', url);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Number of bytes exceeds the limit');
    });
  });

  describe('serveRange', () => {
    it('should return full content without Range header', async () => {
      const request = new Request('http://example.com/range/100');
      const response = serveRange('/range/100', request);

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text.length).toBe(100);
      expect(text).toBe('a'.repeat(100));
    });

    it('should return partial content with Range header', async () => {
      const request = new Request('http://example.com/range/100', {
        headers: { Range: 'bytes=0-9' },
      });
      const response = serveRange('/range/100', request);

      expect(response.status).toBe(206);
      expect(response.headers.get('Content-Range')).toBe('bytes 0-9/100');

      const text = await response.text();
      expect(text).toBe('aaaaaaaaaa');
      expect(text.length).toBe(10);
    });

    it('should handle Range header without end', async () => {
      const request = new Request('http://example.com/range/50', {
        headers: { Range: 'bytes=10-' },
      });
      const response = serveRange('/range/50', request);

      expect(response.status).toBe(206);
      expect(response.headers.get('Content-Range')).toBe('bytes 10-49/50');

      const text = await response.text();
      expect(text.length).toBe(40);
    });

    it('should return 400 for invalid number', async () => {
      const request = new Request('http://example.com/range/invalid');
      const response = serveRange('/range/invalid', request);

      expect(response.status).toBe(400);
    });

    it('should return 400 for exceeding MAX_BYTES', async () => {
      const request = new Request('http://example.com/range/99999999');
      const response = serveRange('/range/99999999', request);

      expect(response.status).toBe(400);
    });
  });

  describe('serveStatus', () => {
    it('should return specified status code with message', async () => {
      const response = serveStatus('/status/200');

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('Returning status 200');
    });

    it('should handle 404 status', async () => {
      const response = serveStatus('/status/404');

      expect(response.status).toBe(404);
      const text = await response.text();
      expect(text).toBe('Returning status 404');
    });

    it('should handle 500 status', async () => {
      const response = serveStatus('/status/500');

      expect(response.status).toBe(500);
      const text = await response.text();
      expect(text).toBe('Returning status 500');
    });

    it('should return 400 for invalid status code', async () => {
      const response = serveStatus('/status/invalid');

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Invalid status code');
    });
  });

  describe('serveStatusNoResponse', () => {
    it('should return specified status code with no body', async () => {
      const response = serveStatusNoResponse('/status-no-response/204');

      expect(response.status).toBe(204);
      const text = await response.text();
      expect(text).toBe('');
    });

    it('should handle 404 status with no body', async () => {
      const response = serveStatusNoResponse('/status-no-response/404');

      expect(response.status).toBe(404);
      const text = await response.text();
      expect(text).toBe('');
    });

    it('should return 400 for invalid status code', async () => {
      const response = serveStatusNoResponse('/status-no-response/invalid');

      expect(response.status).toBe(400);
    });
  });

  describe('serveResponseHeaders', () => {
    it('should return provided headers', async () => {
      const params = new URLSearchParams({
        'X-Custom-Header': 'custom-value',
        'X-Another-Header': 'another-value',
      });
      const response = serveResponseHeaders(params);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-Custom-Header')).toBe('custom-value');
      expect(response.headers.get('X-Another-Header')).toBe('another-value');
    });

    it('should handle empty params', async () => {
      const params = new URLSearchParams();
      const response = serveResponseHeaders(params);

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('Returning provided headers');
    });

    it('should handle multiple values', async () => {
      const params = new URLSearchParams({
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
      });
      const response = serveResponseHeaders(params);

      expect(response.headers.get('Content-Type')).toBe('text/plain');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
    });
  });
});
