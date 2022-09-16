import { isCompressible } from "./utils.ts";
import { expect, Fn } from "./dev_deps.ts";

Deno.test("isCompressible should pass", () => {
  const table: Fn<typeof isCompressible>[] = [
    ["text/html", true],
    ["text/plain", true],
    ["application/json", true],
    ["application/activity+json", true],

    ["image/png", false],
    ["image/jpeg", false],
    ["image/jpeg", false],
    ["video/webm", false],

    ["application/pdf", false],
    ["type/+json", false],
    ["unknown", false],
  ];

  table.forEach(([actual, expected]) => {
    expect(isCompressible(actual)).toBe(expected);
  });
});
