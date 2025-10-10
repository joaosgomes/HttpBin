/**
 * HTTP method handlers (GET, POST, PUT, PATCH, DELETE, HEAD)
 */

export function handleGet(request) {
    if (request.method !== 'GET') {
        return new Response('Only GET method is allowed', { status: 405 });
    }
    return returnRequestData(request);
}

export function handlePost(request) {
    if (request.method !== 'POST') {
        return new Response('Only POST method is allowed', { status: 405 });
    }
    return returnRequestData(request);
}

export function handlePut(request) {
    if (request.method !== 'PUT') {
        return new Response('Only PUT method is allowed', { status: 405 });
    }
    return returnRequestData(request);
}

export function handlePatch(request) {
    if (request.method !== 'PATCH') {
        return new Response('Only PATCH method is allowed', { status: 405 });
    }
    return returnRequestData(request);
}

export function handleDelete(request) {
    if (request.method !== 'DELETE') {
        return new Response('Only DELETE method is allowed', { status: 405 });
    }
    return new Response(JSON.stringify({
        method: request.method,
        headers: [...request.headers]
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

export function handleHead(request) {
    if (request.method !== 'HEAD') {
        return new Response('Only HEAD method is allowed', { status: 405 });
    }
    return new Response(null, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain'
        }
    });
}

async function returnRequestData(request) {
    const body = await request.text();
    const headers = [...request.headers].filter(([key]) => !key.startsWith('cf-'));
    const ip = request.headers.get('cf-connecting-ip');
    const country = request.headers.get('cf-ipcountry');

    return new Response(JSON.stringify({
        headers: headers,
        method: request.method,
        url: request.url,
        ip: ip,
        country: country,
        body: body,
        cf: request.cf
    }, 0, 4), {
        headers: { 'Content-Type': 'application/json' }
    });
}

export function getIp(request) {
    const ip = request.headers.get('cf-connecting-ip');
    const responseBody = {
        origin: ip || 'unknown',
    };
    return new Response(JSON.stringify(responseBody), {
        headers: { 'Content-Type': 'application/json' },
    });
}

export function getHeaders(request) {
    const headersObj = {};
    for (const [key, value] of request.headers) {
        headersObj[key] = value;
    }
    return new Response(JSON.stringify(headersObj), {
        headers: { 'Content-Type': 'application/json' },
    });
}

export function getUserAgent(request) {
    const userAgent = request.headers.get('user-agent');
    const responseBody = {
        'user-agent': userAgent || 'unknown',
    };
    return new Response(JSON.stringify(responseBody), {
        headers: { 'Content-Type': 'application/json' },
    });
}

export function getHostname(request) {
    const hostname = new URL(request.url).hostname;
    return new Response(hostname, { headers: { 'Content-Type': 'text/plain' } });
}

export async function anythingResponse(request) {
    if (!request || !request.url) {
        return new Response('Invalid request URL', { status: 400 });
    }

    let url;
    try {
        url = new URL(request.url);
    } catch (e) {
        return new Response('Invalid URL string', { status: 400 });
    }

    const method = request.method;

    // Maintaining the case of header keys
    const headers = {};
    for (let [key, value] of request.headers.entries()) {
        headers[key.charAt(0).toUpperCase() + key.slice(1)] = [value];
    }

    const queryParams = Array.from(url.searchParams.entries()).reduce((acc, [key, value]) => {
        acc[key] = [value];
        return acc;
    }, {});

    let body = null;
    if (method === "POST") {
        body = await request.text();
    }

    const responseObj = {
        args: queryParams,
        headers: headers,
        method: method,
        origin: headers['X-Forwarded-For'] ? headers['X-Forwarded-For'][0].split(',')[0] : "",
        url: request.url,
        data: body,
        files: {},
        form: {},
        json: null
    };

    return new Response(JSON.stringify(responseObj, null, 2), {
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function delayResponse(path) {
    const { sleep } = await import('./utils.js');
    const delayTime = parseInt(path.split('/').pop(), 10);
    const actualDelay = Math.min(isNaN(delayTime) ? 0 : delayTime, 10);
    await sleep(actualDelay * 1000);
    return new Response(`Delayed for ${actualDelay} seconds`, { status: 200 });
}

export function serveOptions() {
    return new Response(null, { status: 204, headers: {
        'Access-Control-Allow-Methods': 'GET, POST, HEAD, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
    } });
}
