/**
 * Image handlers
 */

import { decodeBase64Image } from './utils.js';

export function serveImageBasedOnHeader(request: Request): Response {
  const acceptHeader = request.headers.get('Accept') || '';
  if (acceptHeader.includes('image/jpeg')) {
    return serveJpegImage();
  } else if (acceptHeader.includes('image/png')) {
    return servePngImage();
  } else if (acceptHeader.includes('image/svg+xml')) {
    return serveSvgImage();
  } else if (acceptHeader.includes('image/webp')) {
    return serveWebpImage();
  } else {
    return new Response('Unsupported image format', { status: 415 });
  }
}

export function serveJpegImage(): Response {
  const base64JPEG =
    '/9j/4AAQSkZJRgABAQAAZABkAAD/2wCEABQQEBkSGScXFycyJh8mMi4mJiYmLj41NTU1NT5EQUFBQUFBREREREREREREREREREREREREREREREREREREREQBFRkZIBwgJhgYJjYmICY2RDYrKzZERERCNUJERERERERERERERERERERERERERERERERERERERERERERERERERP/AABEIAAEAAQMBIgACEQEDEQH/xABMAAEBAAAAAAAAAAAAAAAAAAAABQEBAQAAAAAAAAAAAAAAAAAABQYQAQAAAAAAAAAAAAAAAAAAAAARAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJQA9Yv/2Q==';
  const uint8Array = decodeBase64Image(base64JPEG);
  return new Response(uint8Array, { headers: { 'Content-Type': 'image/jpeg' } });
}

export function servePngImage(): Response {
  const base64PNG =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/6o06a0AAAAASUVORK5CYII=';
  const uint8Array = decodeBase64Image(base64PNG);
  return new Response(uint8Array, { headers: { 'Content-Type': 'image/png' } });
}

export function serveSvgImage(): Response {
  const svg = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
      </svg>
    `;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
}

export function serveWebpImage(): Response {
  const base64WEBP = 'UklGRhIAAABXRUJQVlA4IBwAAAAwAQCdASoBAAEAAwA0JaQAA3AA/v7lpTDyAAAA';
  const uint8Array = decodeBase64Image(base64WEBP);
  return new Response(uint8Array, { headers: { 'Content-Type': 'image/webp' } });
}
