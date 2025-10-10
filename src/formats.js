/**
 * Data format handlers (JSON, XML, bytes, range, status)
 */

import { MAX_BYTES, generateBytesWithSeed } from './utils.js';

export function serveJSON() {
    const data = {
        message: "This is a simple JSON response.",
        status: "success"
    };
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
}

export function serveJSONValue(path) {
    const value = decodeURIComponent(path.split('/')[2]);
    if (!value) {
        return new Response('Invalid value', { status: 400 });
    }
    try {
        const jsonObject = JSON.parse(value);
        return new Response(JSON.stringify(jsonObject), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        return new Response(`Invalid JSON format: ${value}`, { status: 400 });
    }
}

export function serveXML() {
    const xmlData = `<?xml version="1.0"?>
    <note>
        <to>User</to>
        <from>Server</from>
        <heading>Reminder</heading>
        <body>Don't forget to study!</body>
    </note>`;

    return new Response(xmlData, {
        headers: { 'Content-Type': 'application/xml' }
    });
}

export function serveXMLValue(path) {
    const value = path.split('/')[2];
    if (!value) {
        return new Response('Invalid value', { status: 400 });
    }
    const decodedValue = decodeURIComponent(value);

    return new Response(decodedValue, {
        headers: { 'Content-Type': 'application/xml' },
    });
}

export function generateRandomBytes(path, url) {
    const numBytes = parseInt(path.split('/').pop(), 10);
    if (isNaN(numBytes) || numBytes <= 0) {
        return new Response('Invalid number of bytes', { status: 400 });
    }

    if (numBytes > MAX_BYTES) {
        return new Response('Number of bytes exceeds the limit', { status: 400 });
    }

    const seedParam = url.searchParams.get('seed');
    const seed = seedParam ? parseInt(seedParam, 10) : Math.random() * 1000;

    const randomBytes = generateBytesWithSeed(numBytes, seed);
    return new Response(randomBytes, {
        headers: { 'Content-Type': 'application/octet-stream' },
    });
}

export function serveRange(path, request) {
    const n = parseInt(path.split('/')[2]);
    if (isNaN(n)) {
        return new Response('Invalid number', { status: 400 });
    }

    // This example assumes ASCII text data, for simplicity
    if (n > MAX_BYTES) {
        return new Response('Number of bytes exceeds the limit', { status: 400 });
    }

    const data = "a".repeat(n);

    const rangeHeader = request.headers.get("Range");
    if (rangeHeader) {
        const match = rangeHeader.match(/bytes=(\d+)-(\d+)?/);
        if (match) {
            const start = parseInt(match[1]);
            const end = match[2] ? parseInt(match[2]) : data.length - 1;

            // Provide Content-Range header and 206 status for partial content
            const headers = {
                'Content-Range': `bytes ${start}-${end}/${data.length}`
            };

            return new Response(data.slice(start, end + 1), {
                status: 206,
                headers: headers
            });
        }
    }

    return new Response(data);
}

export function serveStatus(path) {
    const code = parseInt(path.split('/')[2]);

    if (isNaN(code)) {
        return new Response('Invalid status code', { status: 400 });
    }

    return new Response(`Returning status ${code}`, { status: code });
}

export function serveStatusNoResponse(path) {
    const code = parseInt(path.split('/')[2]);

    if (isNaN(code)) {
        return new Response('Invalid status code', { status: 400 });
    }

    return new Response(null, { status: code });
}

export function serveResponseHeaders(params) {
    const headers = {};

    for (const [key, value] of params.entries()) {
        headers[key] = value;
    }

    return new Response('Returning provided headers', {
        headers: headers
    });
}

export function serveWs(request) {
    const upgradeHeader = request.headers.get("Upgrade")
    if (upgradeHeader !== "websocket") {
        return new Response("Expected websocket", { status: 400 })
    }

    const [client, server] = Object.values(new WebSocketPair())

    server.accept()

    server.addEventListener("message", ({ data }) => {
        server.send(data);
    })

    return new Response(null, {
        status: 101,
        webSocket: client
    })
}
