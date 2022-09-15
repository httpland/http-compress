import { withCompress } from "./compress.ts";
import { describe, expect, it } from "./dev_deps.ts";

describe("withCompress", () => {
  it("should compress when body size is greater than 10kb by default", async () => {
    const handler = withCompress(() => new Response("a".repeat(10241)));

    const res = await handler(
      new Request("http://localhost", {
        headers: {
          "Accept-Encoding": "gzip",
        },
      }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-type": "text/plain;charset=UTF-8",
          "Content-Encoding": "gzip",
          Vary: "Accept-Encoding",
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
          "Content-Encoding": "gzip",
          Vary: "Accept-Encoding",
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
          "Accept-Encoding": "gzip",
        },
      }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-type": "text/plain;charset=UTF-8",
          "Content-Encoding": "gzip",
          Vary: "Accept-Encoding",
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
          "Accept-Encoding": "gzip",
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
          "Content-Encoding": "",
        },
      }), {
      filter: () => true,
    });

    const res = await handler(
      new Request("http://localhost", {
        headers: {
          "Accept-Encoding": "gzip",
        },
      }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-type": "text/plain;charset=UTF-8",
          "Content-Encoding": "",
        },
      }),
    );
  });

  it("should not compress when body size is less than or equal to 10kb by default", async () => {
    const handler = withCompress(() => new Response("a".repeat(10240)));

    const res = await handler(
      new Request("http://localhost", {
        headers: {
          "Accept-Encoding": "gzip",
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

  it("should compress by deflate", async () => {
    const handler = withCompress(() => new Response(""), {
      filter: () => true,
    });

    const res = await handler(
      new Request("http://localhost", {
        headers: {
          "Accept-Encoding": "deflate",
        },
      }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-encoding": "deflate",
          "content-type": "text/plain;charset=UTF-8",
          vary: "Accept-Encoding",
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
          "Accept-Encoding": "br",
        },
      }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-encoding": "br",
          "content-type": "text/plain;charset=UTF-8",
          vary: "Accept-Encoding",
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
          "Accept-Encoding": "deflate, br, gzip",
        },
      }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-encoding": "deflate",
          "content-type": "text/plain;charset=UTF-8",
          vary: "Accept-Encoding",
        },
      }),
    );
  });
});
