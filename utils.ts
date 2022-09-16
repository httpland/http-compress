// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { db } from "./deps.ts";

type DB = typeof db;

interface DBEntry {
  source: string;
  compressible?: boolean;
  charset?: string;
  extensions?: string[];
}

/** Whether the media type is compressible or not.
 *
 * This refers to the {@link https://github.com/jshttp/mime-db mime-db}.
 *
 * ```ts
 * import { isCompressible } from "https://deno.land/x/http_compress@$VERSION/mod.ts";
 * import { assertEquals } from "https://deno.land/std@$VERSION/testing/asserts.ts";
 *
 * assertEquals(isCompressible("text/html"), true);
 * assertEquals(isCompressible("image/png"), false);
 * ```
 */
export function isCompressible(mediaType: string): boolean {
  const entry = db[mediaType as keyof DB] as DBEntry | undefined;

  return entry?.compressible ?? false;
}
