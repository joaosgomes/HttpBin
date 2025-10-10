/**
 * UI/HTML rendering handlers
 */

export function serveAvailableMethods(): Response {
  const htmlContent = `<!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HTTPBin Cloudflare Worker</title>

        <style type="text/css">
            /*!
            * Writ v1.0.4
            *
            * Copyright © 2015, Curtis McEnroe <curtis@cmcenroe.me>
            *
            * https://cmcenroe.me/writ/LICENSE (ISC)
            */dd,hr,ol ol,ol ul,ul ol,ul ul{margin:0}pre,table{overflow-x:auto}a,ins{text-decoration:none}html{font-family:Palatino,Georgia,Lucida Bright,Book Antiqua,serif;font-size:16px;line-height:1.5rem}code,kbd,pre,samp{font-family:Consolas,Liberation Mono,Menlo,Courier,monospace;font-size:.833rem;color:#111}kbd{font-weight:700}h1,h2,h3,h4,h5,h6,th{font-weight:400}h1{font-size:2.488em}h2{font-size:2.074em}h3{font-size:1.728em}h4{font-size:1.44em}h5{font-size:1.2em}h6{font-size:1em}small{font-size:.833em}h1,h2,h3{line-height:3rem}blockquote,dl,h1,h2,h3,h4,h5,h6,ol,p,pre,table,ul{margin:1.5rem 0 0}pre,table{margin-bottom:-1px}hr{border:none;padding:1.5rem 0 0}table{line-height:calc(1.5rem - 1px);width:100%;border-collapse:collapse}pre{margin-top:calc(1.5rem - 1px)}body{color:#222;margin:1.5rem 1ch}a,a code,header nav a:visited{color:#00e}a:visited,a:visited code{color:#60b}mark{color:inherit;background-color:#fe0}code,pre,samp,tfoot,thead{background-color:rgba(0,0,0,.05)}blockquote,ins,main aside{border:rgba(0,0,0,.05) solid}blockquote,main aside{border-width:0 0 0 .5ch}code,pre,samp{border:rgba(0,0,0,.1) solid}td,th{border:solid #dbdbdb}body>header{text-align:center}body>footer,main{display:block;max-width:78ch;margin:auto}main aside,main figure{float:right;margin:1.5rem 0 0 1ch}main aside{max-width:26ch;padding:0 0 0 .5ch}blockquote{margin-right:3ch;margin-left:1.5ch;padding:0 0 0 1ch}pre{border-width:1px;border-radius:2px;padding:0 .5ch}pre code{border:none;padding:0;background-color:transparent;white-space:inherit}code,ins,samp,td,th{border-width:1px}img{max-width:100%}dd,ol,ul{padding:0 0 0 3ch}ul>li{list-style-type:disc}li ul>li{list-style-type:circle}li li ul>li{list-style-type:square}ol>li{list-style-type:decimal}li ol>li{list-style-type:lower-roman}li li ol>li{list-style-type:lower-alpha}nav ul{padding:0;list-style-type:none}nav ul li{display:inline;padding-left:1ch;white-space:nowrap}nav ul li:first-child{padding-left:0}ins,mark{padding:1px}td,th{padding:calc(.75rem - .5px)}
        </style>
    </head>

    <body>
        <header>
            <h1>HTTPBin</h1>
            <p>
                Cloudflare Worker version.
            </p>

            <nav>
                <ul>
                    <li><a href="https://adguard.com/">Made by AdGuard</a></li>
                    <li><a href="https://github.com/AdguardTeam/HttpBin">Github Repo</a></li>
                </ul>
            </nav>
        </header>

        <main>
            <h2>What is it?</h2>

            <p>
                This is a Cloudflare Worker port of httpbin.org HTTP request & response testing service.
            </p>

            <h3>Endpoints</h3>
            <ul>
                <li><a href="absolute-redirect/2">/absolute-redirect/:n</a> - Absolute redirects n times.</li>
                <li><a href="anything/test">/anything/:anything</a> - Returns anything that is passed to request.</li>
                <li><a href="base64/decode/aGVsbG8gd29ybGQ=">/base64/decode/:value</a> - Decodes a Base64 encoded string.
                </li>
                <li><a href="base64/encode/hello%20world">/base64/encode/:value</a> - Encodes a string into Base64.</li>
                <li><a href="basic-auth/admin/password">/basic-auth/:user/:passwd</a> - Challenges HTTPBasic Auth.</li>
                <li><a href="bytes/1024?seed=5">/bytes/:n</a> - Generates n random bytes of binary data, accepts optional
                    seed
                    integer parameter.</li>
                <li><a href="cache">/cache</a> - Returns 200 unless an If-Modified-Since or If-None-Match header is
                    provided,
                    when it returns a 304.</li>
                <li><a href="cache/60">/cache/:n</a> - Sets a Cache-Control header for n seconds.</li>
                <li><a href="cookies">/cookies</a> - Returns cookie data.</li>
                <li><a href="cookies/set?k1=v1&k2=v2">/cookies/set?name=value</a> - Sets one or more simple cookies.</li>
                <li><a href="cookies/delete?k1=&k2=">/cookies/delete?name</a> - Deletes one or more simple cookies.</li>
                <li><a href="delay/5">/delay/:n</a> - Delays responding for min(n, 10) seconds.</li>
                <li><a href="delete">/delete</a> - Returns request data. Allows only DELETE requests.</li>
                <li><a href="forms/post">/forms/post</a> - HTML form that submits to /post.</li>
                <li><a href="get">/get</a> - Returns request data. Allows only GET requests.</li>
                <li><a href="head">/head</a> - Returns request data. Allows only HEAD requests.</li>
                <li><a href="headers">/headers</a> - Returns request header dict.</li>
                <li><a href="html">/html</a> - Renders an HTML Page.</li>
                <li><a href="hostname">/hostname</a> - Returns the name of the host serving the request.</li>
                <li><a href="image">/image</a> - Returns page containing an image based on sent Accept header.</li>
                <li><a href="image/jpeg">/image/jpeg</a> - Returns a JPEG image.</li>
                <li><a href="image/png">/image/png</a> - Returns a PNG image.</li>
                <li><a href="image/svg">/image/svg</a> - Returns a SVG image.</li>
                <li><a href="image/webp">/image/webp</a> - Returns a WEBP image.</li>
                <li><a href="ip">/ip</a> - Returns Origin IP.</li>
                <li><a href="json">/json</a> - Returns JSON.</li>
                <li><a href="json/%7B%22test%22%3A1%7D">/json/:value</a> - Returns the specified JSON..</li>
                <li><a href="links/:n">/links/:n</a> - Returns page containing n HTML links.</li>
                <li><a href="patch">/patch</a> - Returns request data. Allows only PATCH requests.</li>
                <li><a href="post">/post</a> - Returns request data. Allows only POST requests.</li>
                <li><a href="put">/put</a> - Returns request data. Allows only PUT requests.</li>
                <li><a href="range/1024">/range/:n</a> - Streams n bytes, and allows specifying a Range header to select a
                    subset of the data.</li>
                <li><a
                        href="redirect-to?status_code=307&url=http%3A%2F%2Fexample.com%2F">/redirect-to?url=foo&status_code=307</a>
                    - Redirects to the foo URL.</li>
                <li><a href="redirect-to?url=http%3A%2F%2Fexample.com%2F">/redirect-to?url=foo</a> - 302 Redirects to the
                    foo
                    URL.</li>
                <li><a href="redirect/3">/redirect/:n</a> - 302 Redirects n times.</li>
                <li><a
                        href="response-headers?Servername=httpbin&Content-Type=text%2Fplain%3B+charset%3DUTF-8">/response-headers?key=val</a>
                    - Returns given response headers.</li>
                <li><a href="status/200">/status/:code</a> - Returns given HTTP Status code.</li>
                <li><a href="status-no-response/200">/status-no-response/:code</a> - Returns given HTTP Status code with empty body.</li>
                <li><a href="user-agent">/user-agent</a> - Returns user-agent.</li>
                <li><a href="ws">/ws</a> - Creates connection with websocket echo server. Allows only requests with upgrade header.</li>
                <li><a href="xml">/xml</a> - Returns some XML.</li>
                <li><a href="xml/%3Ctest%2F%3E">/xml/:value</a> - Returns some XML.</li>
            </ul>
        </main>
    </body>

    </html>
    `;

  return new Response(htmlContent, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

export function renderHTMLPage(): Response {
  const html = `
      <html>
        <head><title>Sample HTML Page</title></head>
        <body><h1>Welcome to the Sample Page!</h1></body>
      </html>
    `;
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

export function renderHtmlForm(): Response {
  const html = `
      <form action="/post" method="post">
        <input type="text" name="sampleInput" placeholder="Enter something...">
        <input type="submit" value="Submit">
      </form>
    `;
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

export function serveLinks(path: string): Response {
  const n = parseInt(path.split('/')[2]);
  if (isNaN(n)) {
    return new Response('Invalid number', { status: 400 });
  }

  let linksHTML = '<html><body>';
  for (let i = 0; i < n; i++) {
    linksHTML += `<a href="#link${i}">Link ${i}</a><br>`;
  }
  linksHTML += '</body></html>';
  return new Response(linksHTML, { headers: { 'Content-Type': 'text/html' } });
}
