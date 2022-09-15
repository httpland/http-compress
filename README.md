# http-compress

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/http_compress)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/http_compress/mod.ts)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/httpland/http_compress)](https://github.com/httpland/http-compress/releases)
[![GitHub](https://img.shields.io/github/license/httpland/http-compress)](https://github.com/httpland/http-compress/blob/main/LICENSE)

[![test](https://github.com/httpland/http-compress/actions/workflows/test.yaml/badge.svg)](https://github.com/httpland/http-compress/actions/workflows/test.yaml)
[![NPM](https://nodei.co/npm/@httpland/http-compress.png?mini=true)](https://nodei.co/npm/@httpland/http-compress/)

Compress HTTP response, supported Web standard compression methods

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

## Spec

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

Copyright © 2022-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
