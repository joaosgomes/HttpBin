/**
 * Encoding/Decoding handlers (Base64)
 */

export function decodeBase64(path: string): Response {
  try {
    const encodedValue = decodeURIComponent(path.split('/').pop() || '');
    const decodedValue = atob(encodedValue);
    return new Response(decodedValue, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (err) {
    return new Response('Error decoding base64', { status: 400 });
  }
}

export function encodeBase64(path: string): Response {
  try {
    const value = decodeURIComponent(path.split('/').pop() || '');
    const encodedValue = btoa(value);
    return new Response(encodedValue, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (err) {
    return new Response('Error encoding to base64', { status: 400 });
  }
}
