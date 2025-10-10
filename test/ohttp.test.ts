import { describe, it, expect } from 'vitest';
import { Client } from 'ohttp-js';
import { serveOhttpConfig, serveOhttpGateway, keyConfig } from '../src/ohttp.js';

// Mock handler that simulates the main router behavior
async function mockInternalHandler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/get') {
    return new Response(
      JSON.stringify({
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } else if (path === '/post') {
    const body = await request.text();
    return new Response(
      JSON.stringify({
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        body: body,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  return new Response('Not Found', { status: 404 });
}

// Helper to create an OHTTP client with the same config as the server
async function createOhttpClient(): Promise<Client> {
  const publicConfig = await keyConfig.publicConfig();
  return new Client(publicConfig);
}

describe('OHTTP endpoints', () => {
  it('should serve OHTTP config at /ohttp/config', async () => {
    const response = await serveOhttpConfig();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/ohttp-keys');

    const config = new Uint8Array(await response.arrayBuffer());
    expect(config.length).toBeGreaterThan(0);
  });

  it('should verify config structure', async () => {
    // Fetch the OHTTP config
    const configResponse = await serveOhttpConfig();
    const encodedConfig = new Uint8Array(await configResponse.arrayBuffer());

    // Verify basic structure of KeyConfig (RFC 9458)
    // First byte is key ID
    expect(encodedConfig[0]).toBe(1); // Our KEY_ID

    // Next 2 bytes are KEM ID (should be 0x0020 for X25519)
    const kemId = (encodedConfig[1] << 8) | encodedConfig[2];
    expect(kemId).toBe(0x0020);

    // Config should be at least 40 bytes (key ID + KEM ID + public key + symmetric algorithms)
    expect(encodedConfig.length).toBeGreaterThanOrEqual(40);
  });

  it('should process GET requests through OHTTP gateway end-to-end', async () => {
    // Create an OHTTP client
    const client = await createOhttpClient();

    // Create a test request to /get endpoint
    const targetRequest = new Request('https://example.com/get', {
      method: 'GET',
      headers: {
        'X-Test-Header': 'test-value',
      },
    });

    // Encapsulate the request using OHTTP
    const requestContext = await client.encapsulateRequest(targetRequest);
    const encodedClientRequest = requestContext.request.encode();

    // Send the encapsulated request to the gateway
    const gatewayRequest = new Request('http://localhost/ohttp/gateway', {
      method: 'POST',
      headers: {
        'Content-Type': 'message/ohttp-req',
      },
      body: encodedClientRequest,
    });

    const gatewayResponse = await serveOhttpGateway(gatewayRequest, mockInternalHandler);

    // Verify we got an OHTTP response
    expect(gatewayResponse.status).toBe(200);
    expect(gatewayResponse.headers.get('content-type')).toBe('message/ohttp-res');

    // Decapsulate the response
    const decapsulatedResponse = await requestContext.decapsulateResponse(gatewayResponse);

    // Verify the response is from the /get endpoint
    expect(decapsulatedResponse.status).toBe(200);
    const body = await decapsulatedResponse.json();
    expect(body).toHaveProperty('method', 'GET');
    expect(body.url).toContain('/get');
    expect(body.headers).toHaveProperty('x-test-header', 'test-value');
  });

  it('should process POST requests through OHTTP gateway end-to-end', async () => {
    // Create an OHTTP client
    const client = await createOhttpClient();

    // Create a POST request with JSON body
    const postData = { message: 'Hello, OHTTP!', timestamp: Date.now() };
    const targetRequest = new Request('https://example.com/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom-value',
      },
      body: JSON.stringify(postData),
    });

    // Encapsulate the request
    const requestContext = await client.encapsulateRequest(targetRequest);
    const encodedClientRequest = requestContext.request.encode();

    // Send to gateway
    const gatewayRequest = new Request('http://localhost/ohttp/gateway', {
      method: 'POST',
      headers: {
        'Content-Type': 'message/ohttp-req',
      },
      body: encodedClientRequest,
    });

    const gatewayResponse = await serveOhttpGateway(gatewayRequest, mockInternalHandler);

    // Verify OHTTP response
    expect(gatewayResponse.status).toBe(200);
    expect(gatewayResponse.headers.get('content-type')).toBe('message/ohttp-res');

    // Decapsulate the response
    const decapsulatedResponse = await requestContext.decapsulateResponse(gatewayResponse);

    // Verify the response
    expect(decapsulatedResponse.status).toBe(200);
    const body = await decapsulatedResponse.json();
    expect(body).toHaveProperty('method', 'POST');
    expect(body.url).toContain('/post');
    expect(body.headers).toHaveProperty('content-type', 'application/json');
    expect(body.headers).toHaveProperty('x-custom-header', 'custom-value');
    expect(body.body).toContain('Hello, OHTTP!');
  });

  it('should maintain request integrity through encapsulation', async () => {
    // Create an OHTTP client
    const client = await createOhttpClient();

    // Create a request with various headers and URL path
    const targetRequest = new Request('https://example.com/get', {
      method: 'GET',
      headers: {
        'User-Agent': 'OHTTP-Test/1.0',
        Accept: 'application/json',
        'X-Request-ID': '12345',
      },
    });

    // Encapsulate the request
    const requestContext = await client.encapsulateRequest(targetRequest);
    const encodedClientRequest = requestContext.request.encode();

    // Send to gateway
    const gatewayRequest = new Request('http://localhost/ohttp/gateway', {
      method: 'POST',
      headers: {
        'Content-Type': 'message/ohttp-req',
      },
      body: encodedClientRequest,
    });

    const gatewayResponse = await serveOhttpGateway(gatewayRequest, mockInternalHandler);

    // Decapsulate the response
    const decapsulatedResponse = await requestContext.decapsulateResponse(gatewayResponse);

    // Verify all headers and path are preserved
    expect(decapsulatedResponse.status).toBe(200);
    const body = await decapsulatedResponse.json();
    expect(body.method).toBe('GET');
    expect(body.url).toContain('/get');
    expect(body.headers).toHaveProperty('user-agent', 'OHTTP-Test/1.0');
    expect(body.headers).toHaveProperty('accept', 'application/json');
    expect(body.headers).toHaveProperty('x-request-id', '12345');
  });

  it('should reject requests with invalid content type', async () => {
    const request = new Request('http://localhost/ohttp/gateway', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'data' }),
    });

    const response = await serveOhttpGateway(request, mockInternalHandler);

    expect(response.status).toBe(400);
    const body = await response.text();
    expect(body).toContain('Invalid content type');
  });
});
