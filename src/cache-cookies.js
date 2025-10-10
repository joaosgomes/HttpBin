/**
 * Cache and Cookie handlers
 */

export function checkCacheHeaders(request) {
    if (request.headers.get('If-Modified-Since') || request.headers.get('If-None-Match')) {
        return new Response(null, { status: 304 });
    }
    return new Response('Cache Endpoint');
}

export function setCacheControl(request, path) {
    const seconds = parseInt(path.split('/').pop(), 10);
    if (isNaN(seconds)) {
        return new Response('Invalid cache time', { status: 400 });
    }
    return new Response('Cache-Control set', {
        headers: { 'Cache-Control': `public, max-age=${seconds}` },
    });
}

export function getCookies(request) {
    const cookies = request.headers.get('Cookie');
    const cookiesObj = {};
    if (cookies) {
        cookies.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            cookiesObj[name] = decodeURIComponent(value);
        });
    }
    return new Response(JSON.stringify(cookiesObj), {
        headers: { 'Content-Type': 'application/json' },
    });
}

export function deleteCookies(request, url) {
    const searchParams = url.searchParams;
    const cookiesToDelete = [];
    for (const key of searchParams.keys()) {
        cookiesToDelete.push(key);
    }

    const responseHeaders = new Headers();
    cookiesToDelete.forEach(cookieName => {
        responseHeaders.append('Set-Cookie', `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`);
    });

    return new Response(`Cookies deleted: ${cookiesToDelete.join(',')}`, { headers: responseHeaders });
}

export function setCookies(request, url) {
    const searchParams = url.searchParams;
    const responseHeaders = new Headers();

    for (const [key, value] of searchParams.entries()) {
        responseHeaders.append('Set-Cookie', `${key}=${encodeURIComponent(value)}; path=/`);
    }

    return new Response('Cookies set', { headers: responseHeaders });
}
