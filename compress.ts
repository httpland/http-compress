import {
  acceptsEncodings,
  deflate,
  gzip,
  Handler,
  mergeHeaders,
  safeResponse,
} from "./deps.ts";

const SupportedEncodes = {
  gzip,
  deflate,
} as const;

type SupportedEncode = keyof typeof SupportedEncodes;

/** Takes a handler and returns a handler with the response body compressed.
 *
 * ```ts
 * import { withCompress } from "https://deno.land/x/http_compress@$VERSION/mod.ts";
 *
 * function handler(req: Request): Response {
 *   return new Response("Huge content");
 * }
 * Deno.serve(withCompress(handler));
 * ```
 */
export function withCompress(handler: Handler): Handler {
  const supportedEncodings = Object.keys(SupportedEncodes);

  return async (req) => {
    const preferEncode = acceptsEncodings(
      req,
      ...supportedEncodings,
    ) as SupportedEncode | undefined;

    if (!preferEncode) return handler(req);

    return await safeResponse(async () => {
      const res = await handler(req);
      if (res.bodyUsed) return res;

      const encoder = SupportedEncodes[preferEncode];
      const newResponse = res.clone();
      const text = await newResponse.text();
      const u8 = new TextEncoder().encode(text);
      const body = encoder(u8, undefined);
      const headers = mergeHeaders(
        new Headers({
          "Content-Encoding": preferEncode,
          Vary: "Accept-Encoding",
        }),
        newResponse.headers,
      );

      return new Response(body, { ...newResponse, headers });
    });
  };
}
