import { BuildOptions } from "https://deno.land/x/dnt@0.30.0/mod.ts";

export const makeOptions = (version: string): BuildOptions => ({
  test: false,
  shims: {
    undici: true,
    deno: true,
    custom: [{
      globalNames: ["TextEncoder"],
      module: "util",
    }],
  },
  typeCheck: false,
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  scriptModule: false,
  package: {
    name: "@httpland/http-compress",
    version,
    description:
      "Compress HTTP response, supported Web standard compression methods",
    keywords: [
      "http",
      "handler",
      "compress",
      "encode",
      "accept-encoding",
      "content-encoding",
      "gzip",
      "br",
      "request",
      "response",
    ],
    license: "MIT",
    homepage: "https://github.com/httpland/http-compress",
    repository: {
      type: "git",
      url: "git+https://github.com/httpland/http-compress.git",
    },
    bugs: {
      url: "https://github.com/httpland/http-compress/issues",
    },
    sideEffects: false,
    type: "module",
    publishConfig: {
      access: "public",
    },
  },
  packageManager: "pnpm",
});
