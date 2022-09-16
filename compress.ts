import { Encode, Encoders, encodes } from "./encodes.ts";
import { isCompressible } from "./utils.ts";
import {
  acceptsEncodings,
  Handler,
  mergeHeaders,
  parseMediaType,
  safeResponse,
} from "./deps.ts";

/** Compress options. */
export interface CompressOptions {
  /** Filters compression targets.
   * Only if `true` is returned, the response is compressed.
   *
   * By default, only content larger than 10kb will be compressed.
   *
   * @defaultValue {@link defaultFilter}
   */
  readonly filter: (content: Uint8Array, context: FilterContext) => boolean;
}

/** Filter context. */
export interface FilterContext {
  /** A cloned actual `Request` object. */
  readonly request: Request;

  /** A cloned actual `Response` object. */
  readonly response: Response;
}

export const defaultFilter: CompressOptions["filter"] = (
  content,
  { response },
) => {
  if (content.byteLength < 1024_0) return false;

  const type = response.headers.get("content-type");

  if (!type) return false;

  try {
    const [mediaType] = parseMediaType(type);
    return isCompressible(mediaType);
  } catch {
    return false;
  }
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
  return async (req) => {
    const preferEncode = acceptsEncodings(
      req,
      ...encodes,
      "identity",
    ) as Encode | "identity" | undefined;

    if (!preferEncode || !isSupportedEncode(preferEncode)) return handler(req);

    return await safeResponse(async () => {
      const res = await handler(req.clone());
      const encoder = Encoders[preferEncode];
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

      const body = encoder(u8);
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

function isSupportedEncode(value: string): value is Encode {
  return encodes.includes(value);
}
