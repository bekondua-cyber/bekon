import { describe, it, expect } from "vitest";

describe("project smoke test", () => {
  it("basic math works", () => {
    expect(1 + 1).toBe(2);
  });

  it("environment is jsdom", () => {
    expect(typeof window).toBe("object");
    expect(typeof document).toBe("object");
  });
});
