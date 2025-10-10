/**
 * Redirect handlers
 */

export function absoluteRedirect(path: string, url: URL): Response {
  const numRedirects = parseInt(path.split('/').pop() || '', 10);
  if (isNaN(numRedirects) || numRedirects < 0) {
    return new Response('Invalid number of redirects', { status: 400 });
  }
  if (numRedirects === 0) {
    return new Response('Final redirect reached');
  }
  const newLocation = `${url.origin}/absolute-redirect/${numRedirects - 1}`;
  return new Response(null, {
    status: 302,
    headers: {
      Location: newLocation,
    },
  });
}

export function serveRelativeRedirects(path: string): Response {
  const n = parseInt(path.split('/')[2]);

  if (isNaN(n) || n < 0) {
    return new Response('Invalid redirect count', { status: 400 });
  }

  if (n === 0) {
    return new Response('Final Redirect', { status: 200 });
  }

  const nextRedirect = `/relative-redirect/${n - 1}`;
  return new Response('', {
    status: 302,
    headers: { Location: nextRedirect },
  });
}

export function serveMultipleRedirects(path: string): Response {
  const n = parseInt(path.split('/')[2]);

  if (isNaN(n) || n < 0) {
    return new Response('Invalid redirect count', { status: 400 });
  }

  if (n === 0) {
    return new Response('Final Redirect', { status: 200 });
  }

  const nextRedirect = `/redirect/${n - 1}`;
  return new Response('', {
    status: 302,
    headers: { Location: nextRedirect },
  });
}

export function serveRedirectTo(params: URLSearchParams): Response {
  const redirectUrl = params.get('url');
  const statusCode = parseInt(params.get('status_code') || '302', 10);

  if (!redirectUrl) {
    return new Response('URL parameter is missing', { status: 400 });
  }

  return new Response('', {
    status: statusCode,
    headers: { Location: redirectUrl },
  });
}
