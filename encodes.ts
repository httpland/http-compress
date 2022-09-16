import { brotli as br, deflate as _deflate, gzip as _gzip } from "./deps.ts";

export interface Encoder {
  (input: Uint8Array): Uint8Array;
}

const gzip: Encoder = (input) => {
  return _gzip(input, undefined);
};

const deflate: Encoder = (input) => {
  return _deflate(input, undefined);
};

export const Encoders = {
  gzip,
  deflate,
  br,
} as const;
export const encodes = Object.keys(Encoders);
export type Encode = keyof typeof Encoders;
