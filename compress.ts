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

/** Compress options. */
export interface CompressOptions {
  /** Filters compression targets.
   * Only if `true` is returned, the response is compressed.
   *
   * By default, only content larger than 10kb will be compressed.
   *
   * @defaultValue {@link defaultFilter}
   */
  readonly filter: (input: Uint8Array, context: FilterContext) => boolean;
}

/** Filter context. */
export interface FilterContext {
  /** A cloned actual `Request` object. */
  readonly request: Request;

  /** A cloned actual `Response` object. */
  readonly response: Response;
}

const defaultFilter: CompressOptions["filter"] = (input) => {
  return 1024_0 < input.byteLength;
};

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
export function withCompress(
  handler: Handler,
  options: CompressOptions = { filter: defaultFilter },
): Handler {
  const supportedEncodings = Object.keys(SupportedEncodes);

  return async (req) => {
    const preferEncode = acceptsEncodings(
      req,
      ...supportedEncodings,
      "identity",
    ) as SupportedEncode | "identity" | undefined;

    if (!preferEncode || !isSupportedEncode(preferEncode)) return handler(req);

    return await safeResponse(async () => {
      const res = await handler(req.clone());
      const encoder = SupportedEncodes[preferEncode];

      function encode(input: Uint8Array): Uint8Array {
        return encoder(input, undefined);
      }

      const hasCompressed = res.headers.has("Content-Encoding");

      if (hasCompressed || res.bodyUsed) return res;

      const newRes = res.clone();
      const text = await newRes.text();
      const u8 = new TextEncoder().encode(text);
      const context: FilterContext = {
        request: req.clone(),
        response: res.clone(),
      };
      const result = options.filter(u8, context);

      if (!result) return res;

      const body = encode(u8);
      const headers = mergeHeaders(
        res.headers,
        new Headers({
          "Content-Encoding": preferEncode,
          Vary: "Accept-Encoding",
        }),
      );

      return new Response(body, { ...newRes, headers });
    });
  };
}

function isSupportedEncode(value: string): value is SupportedEncode {
  const supportedEncodings = Object.keys(SupportedEncodes);

  return supportedEncodings.includes(value);
}
