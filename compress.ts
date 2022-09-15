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

      const encoder = SupportedEncodes[preferEncode];

      function encode(input: Uint8Array): Uint8Array {
        return encoder(input, undefined);
      }

      return compressResponse(res, encode, preferEncode);
    });
  };
}

export async function compressResponse(
  res: Response,
  encoder: (input: Uint8Array) => Uint8Array,
  format: string,
): Promise<Response> {
  const hasCompressed = res.headers.has("Content-Encoding");

  if (hasCompressed || res.bodyUsed) return res;

  const newRes = res.clone();
  const text = await newRes.text();
  const u8 = new TextEncoder().encode(text);
  const body = encoder(u8);
  const headers = mergeHeaders(
    res.headers,
    new Headers({
      "Content-Encoding": format,
      Vary: "Accept-Encoding",
    }),
  );

  return new Response(body, { ...newRes, headers });
}
