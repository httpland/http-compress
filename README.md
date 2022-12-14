# http-compress

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/http_compress)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/http_compress/mod.ts)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/httpland/http-compress)](https://github.com/httpland/http-compress/releases)
[![codecov](https://codecov.io/github/httpland/http-compress/branch/main/graph/badge.svg?token=9TOU2NJC20)](https://codecov.io/github/httpland/http-compress)
[![GitHub](https://img.shields.io/github/license/httpland/http-compress)](https://github.com/httpland/http-compress/blob/main/LICENSE)

[![test](https://github.com/httpland/http-compress/actions/workflows/test.yaml/badge.svg)](https://github.com/httpland/http-compress/actions/workflows/test.yaml)
[![NPM](https://nodei.co/npm/@httpland/http-compress.png?mini=true)](https://nodei.co/npm/@httpland/http-compress/)

Compress HTTP response, supported Web standard compression methods

gzip, deflate and brotli is built-in.

## Packages

The package supports multiple platforms.

- deno.land/x - `https://deno.land/x/http_compress/mod.ts`
- npm - `@httpland/http-compress`

## Compress with handler

Takes a handler and returns a handler with the response body compressed.

```ts
import { withCompress } from "https://deno.land/x/http_compress@$VERSION/mod.ts";

function handler(req: Request): Response {
  return new Response("Huge content");
}
Deno.serve(withCompress(handler));
```

## Filter compression targets

You have complete control over what is compressed.

Various factors such as content length, media type, CPU usage, etc. can be used
as filtering criteria.

The `filter` field is a function that takes a `boolean`. If `true`, responses
containing that content will be compressed.

By default, If the content is more than 10kb and its media type is compressible,
compress it.

The following example compresses when the content is more than 10kb, the media
type is `text/html`, and request method is `GET`.

```ts
import { withCompress } from "https://deno.land/x/http_compress@$VERSION/mod.ts";

const handler = withCompress(() => new Response("Huge content"), {
  filter: (content, { request, response }) => {
    return 1024_0 < content.byteLength && // 10kb
      request.method === "GET" &&
      response.headers.get("Content-Type") === "text/html";
  },
});
Deno.serve(handler);
```

## isCompressible

Whether the media type is compressible or not.

This refers to the [mime-db](https://github.com/jshttp/mime-db).

```ts
import { isCompressible } from "https://deno.land/x/http_compress@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std@$VERSION/testing/asserts.ts";

assertEquals(isCompressible("text/html"), true);
assertEquals(isCompressible("image/png"), false);
```

## Spec

Supported compression method is follow:

- gzip
- deflate
- brotli

Create a new `Response` object with the compressed value of the response body.

No destructive changes are made to the original `Response` object.

For the `Response` header, the following fields may be added:

- Content-Encoding
- Vary

## Definition of Terms

- Handler - It is a function that takes a `Request` object as its first argument
  and returns a `Response` or `Promise<Response>` object.

  ```ts
  type Handler = (request: Request) => Promise<Response> | Response;
  ```

## License

Copyright ?? 2022-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
