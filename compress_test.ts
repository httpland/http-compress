import { defaultFilter, withCompress } from "./compress.ts";
import { describe, expect, Fn, it } from "./dev_deps.ts";

const url = `http://test.test`;

Deno.test("defaultFilter should pass", () => {
  const input = new Uint8Array(new Array(10240).fill(null));
  const request = new Request(url);
  const table: Fn<typeof defaultFilter>[] = [
    [input, {
      request,
      response: new Response(null, {
        headers: {
          "content-type": "text/plain",
        },
      }),
    }, true],
    [input, {
      request,
      response: new Response(null, {
        headers: {
          "content-type": "application/json; charset=UTF-8",
        },
      }),
    }, true],
    [input, {
      request,
      response: new Response(null, {
        headers: {
          "content-type": ";a",
        },
      }),
    }, false],
    [input, {
      request,
      response: new Response(null, {
        headers: {
          "content-type": "unknown",
        },
      }),
    }, false],
    [input, {
      request,
      response: new Response(null, {
        headers: {
          "content-type": "image/png",
        },
      }),
    }, false],
    [input, {
      request,
      response: new Response(null),
    }, false],
    [new Uint8Array(new Array(10239).fill(null)), {
      request,
      response: new Response(""),
    }, false],
  ];

  table.forEach(([content, context, expected]) => {
    expect(defaultFilter(content, context)).toBe(expected);
  });
});

describe("withCompress", () => {
  it("should compress when body size is greater than 10kb by default", async () => {
    const handler = withCompress(() => new Response("a".repeat(10240)));

    const res = await handler(
      new Request("http://localhost", {
        headers: {
          "accept-encoding": "gzip",
        },
      }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-type": "text/plain;charset=UTF-8",
          "content-encoding": "gzip",
          vary: "accept-encoding",
        },
      }),
    );
  });

  it("should compress when the request does not have accept-encoding header", async () => {
    const handler = withCompress(() => new Response("a".repeat(10241)));

    const res = await handler(
      new Request("http://localhost"),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-type": "text/plain;charset=UTF-8",
          "content-encoding": "gzip",
          vary: "accept-encoding",
        },
      }),
    );
  });

  it("should not compress when the request accept-encoding header is identity", async () => {
    const handler = withCompress(() => new Response("a".repeat(10241)));

    const res = await handler(
      new Request("http://localhost", {
        headers: {
          "accept-encoding": "abc",
        },
      }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-type": "text/plain;charset=UTF-8",
        },
      }),
    );
  });

  it("should override compress filter", async () => {
    const handler = withCompress(() => new Response("test"), {
      filter: () => true,
    });

    const res = await handler(
      new Request("http://localhost", {
        headers: {
          "accept-encoding": "gzip",
        },
      }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-type": "text/plain;charset=UTF-8",
          "content-encoding": "gzip",
          vary: "accept-encoding",
        },
      }),
    );
  });

  it("should not compress when the filter value is false", async () => {
    const handler = withCompress(() => new Response("a".repeat(100000)), {
      filter: () => false,
    });

    const res = await handler(
      new Request("http://localhost", {
        headers: {
          "accept-encoding": "gzip",
        },
      }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-type": "text/plain;charset=UTF-8",
        },
      }),
    );
  });

  it("should not compress when the response has compressed", async () => {
    const handler = withCompress(() =>
      new Response("", {
        headers: {
          "content-encoding": "",
        },
      }), {
      filter: () => true,
    });

    const res = await handler(
      new Request("http://localhost", {
        headers: {
          "accept-encoding": "gzip",
        },
      }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-type": "text/plain;charset=UTF-8",
          "content-encoding": "",
        },
      }),
    );
  });

  it("should not compress when body size is less than or equal to 10kb by default", async () => {
    const handler = withCompress(() => new Response("a".repeat(10239)));

    const res = await handler(
      new Request("http://localhost", {
        headers: {
          "accept-encoding": "gzip",
        },
      }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-type": "text/plain;charset=UTF-8",
        },
      }),
    );
  });

  it("should not compress when the media type is not compressible by default", async () => {
    const handler = withCompress(() =>
      new Response("a".repeat(10240), {
        headers: {
          "Content-Type": "image/jpeg",
        },
      })
    );

    const res = await handler(
      new Request("http://localhost", {
        headers: {
          "accept-encoding": "gzip",
        },
      }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-type": "image/jpeg",
        },
      }),
    );
  });

  it("should compress by deflate", async () => {
    const handler = withCompress(() => new Response(""), {
      filter: () => true,
    });

    const res = await handler(
      new Request("http://localhost", {
        headers: {
          "accept-encoding": "deflate",
        },
      }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-encoding": "deflate",
          "content-type": "text/plain;charset=UTF-8",
          vary: "accept-encoding",
        },
      }),
    );
  });

  it("should compress by br", async () => {
    const handler = withCompress(() => new Response(""), {
      filter: () => true,
    });

    const res = await handler(
      new Request("http://localhost", {
        headers: {
          "accept-encoding": "br",
        },
      }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-encoding": "br",
          "content-type": "text/plain;charset=UTF-8",
          vary: "accept-encoding",
        },
      }),
    );
  });

  it("should compress in order of priority", async () => {
    const handler = withCompress(() => new Response(""), {
      filter: () => true,
    });

    const res = await handler(
      new Request("http://localhost", {
        headers: {
          "accept-encoding": "deflate, br, gzip",
        },
      }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-encoding": "deflate",
          "content-type": "text/plain;charset=UTF-8",
          vary: "accept-encoding",
        },
      }),
    );
  });
});
