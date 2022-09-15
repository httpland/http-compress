import { compressResponse } from "./compress.ts";
import { expect, Fn } from "./dev_deps.ts";
import { deflate, gzip } from "./deps.ts";

Deno.test("compressResponse should pass", async () => {
  const loadedResponse = new Response("text");

  await loadedResponse.text();

  const table: Fn<typeof compressResponse>[] = [
    [
      new Response("test"),
      (input) => gzip(input, undefined),
      "gzip",
      Promise.resolve(
        new Response("test", {
          headers: {
            "content-encoding": "gzip",
            vary: "Accept-Encoding",
          },
        }),
      ),
    ],
    [
      new Response("test"),
      (input) => deflate(input, undefined),
      "deflate",
      Promise.resolve(
        new Response("test", {
          headers: {
            "content-encoding": "deflate",
            vary: "Accept-Encoding",
          },
        }),
      ),
    ],
    [
      new Response("test", {
        headers: {
          "content-encoding": "",
        },
      }),
      (input) => deflate(input, undefined),
      "deflate",
      Promise.resolve(
        new Response("test", {
          headers: {
            "content-encoding": "",
          },
        }),
      ),
    ],
    [
      new Response("test", {
        headers: {
          vary: "test",
        },
      }),
      (input) => deflate(input, undefined),
      "deflate",
      Promise.resolve(
        new Response("test", {
          headers: {
            "content-encoding": "deflate",
            vary: "test, Accept-Encoding",
          },
        }),
      ),
    ],
    [
      loadedResponse,
      (input) => deflate(input, undefined),
      "deflate",
      Promise.resolve(loadedResponse),
    ],
  ];

  await Promise.all(table.map(async ([res, encoder, format, result]) => {
    expect(await compressResponse(res, encoder, format)).toEqualResponse(
      await result,
    );
  }));
});

Deno.test("compressResponse should not change original response object", async () => {
  const res = new Response("test");

  const newRes = await compressResponse(
    res,
    (input) => gzip(input, undefined),
    "gzip",
  );

  expect(res.headers.has("vary")).toBeFalsy();
  expect(res.bodyUsed).toBeFalsy();

  expect(newRes.headers.has("vary")).toBeTruthy();
  expect(newRes.bodyUsed).toBeFalsy();
});
