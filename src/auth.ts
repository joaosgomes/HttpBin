/**
 * Authentication handlers
 */

export function challengeBasicAuth(request: Request, path: string): Response {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, __, user, passwd] = path.split('/');
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = atob(base64Credentials).split(':');
  if (credentials[0] === user && credentials[1] === passwd) {
    return new Response('Authorized');
  }

  return new Response(
    `Unauthorized, expected ${user}:${passwd}, got ${credentials[0]}:${credentials[1]}`,
    { status: 401 },
  );
}
