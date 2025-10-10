/**
 * Oblivious HTTP Gateway handlers
 * Implements RFC 9458: https://www.ietf.org/rfc/rfc9458.html
 */

import { Server, DeterministicKeyConfig } from 'ohttp-js';

// Use a deterministic key configuration with a fixed seed for stable keys across restarts
// In production, you may want to load this from environment variables or KV storage
export const KEY_ID = 1;
export const DETERMINISTIC_SEED = new Uint8Array([
  0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10,
  0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20,
]);

// Create the OHTTP server instance
export const keyConfig = new DeterministicKeyConfig(KEY_ID, DETERMINISTIC_SEED);
const ohttpServer = new Server(keyConfig);

/**
 * Serves the OHTTP KeyConfig endpoint
 * Returns the encoded key configuration that clients use to encapsulate requests
 */
export async function serveOhttpConfig(): Promise<Response> {
  try {
    const encodedConfig = await ohttpServer.encodeKeyConfig();

    return new Response(encodedConfig, {
      status: 200,
      headers: {
        'Content-Type': 'application/ohttp-keys',
      },
    });
  } catch (error) {
    console.error('Error encoding OHTTP config:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

/**
 * Handles OHTTP Gateway requests
 * Decapsulates incoming OHTTP requests, processes them internally, and returns encapsulated responses
 *
 * @param request The incoming OHTTP-encapsulated request
 * @param internalHandler Function to handle the decapsulated request internally
 */
export async function serveOhttpGateway(
  request: Request,
  internalHandler: (req: Request) => Promise<Response>,
): Promise<Response> {
  try {
    // Check content type
    const contentType = request.headers.get('content-type');
    if (contentType !== 'message/ohttp-req') {
      return new Response('Invalid content type. Expected: message/ohttp-req', {
        status: 400,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Read the encapsulated request body
    const encapsulatedRequest = new Uint8Array(await request.arrayBuffer());

    // Decapsulate the OHTTP request
    const responseContext = await ohttpServer.decodeAndDecapsulate(encapsulatedRequest);

    // Get the original request
    const originalRequest = responseContext.request();

    // Instead of forwarding to the target origin, we route it internally to httpbin
    // We need to modify the request URL to point to the current worker
    const currentUrl = new URL(request.url);
    const originalUrl = new URL(originalRequest.url);

    // Create a new URL using the current worker's origin and the original path
    const internalUrl = new URL(originalUrl.pathname + originalUrl.search, currentUrl.origin);

    // Create a new Request object with the internal URL
    // Note: duplex option is required for Node.js/undici when sending a body
    const internalRequest = new Request(internalUrl.toString(), {
      method: originalRequest.method,
      headers: originalRequest.headers,
      body: originalRequest.body,
      // @ts-expect-error - duplex is required for Node.js but not in TypeScript definitions
      duplex: 'half',
    });

    // Process the request using the internal handler
    const internalResponse = await internalHandler(internalRequest);

    // Encapsulate the response back into OHTTP format
    const ohttpResponse = await responseContext.encapsulateResponse(internalResponse);

    return ohttpResponse;
  } catch (error) {
    console.error('Error processing OHTTP gateway request:', error);
    return new Response('Internal server error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
