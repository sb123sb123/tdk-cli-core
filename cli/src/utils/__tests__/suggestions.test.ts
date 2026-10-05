import { describe, expect, it } from "vitest";
import { suggestClosest } from "../suggestions.js";

describe("suggestClosest", () => {
  it("does not suggest a candidate that already matches", () => {
    expect(suggestClosest("api", ["api", "web"])).toBeUndefined();
  });

  it("recognizes an adjacent transposition", () => {
    expect(suggestClosest("aip", ["api", "web"])).toBe("api");
  });

  it("returns no suggestion when nothing is close", () => {
    expect(suggestClosest("database", ["api", "web"])).toBeUndefined();
  });

  it("returns no suggestion for an empty candidate list", () => {
    expect(suggestClosest("api", [])).toBeUndefined();
  });

  it("suggests the canonical case for a case-only mismatch", () => {
    expect(suggestClosest("API", ["api"])).toBe("api");
  });

  it("breaks equal-distance ties alphabetically", () => {
    expect(suggestClosest("ap", ["app", "api"])).toBe("api");
  });
});
