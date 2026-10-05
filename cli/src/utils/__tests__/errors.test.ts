import { describe, expect, it } from "vitest";
import { errorFactories } from "../errors.js";

describe("not-found error suggestions", () => {
  it("suggests a close stack name while retaining existing guidance", () => {
    const error = errorFactories.stackNotFound("shp", ["shop", "api"]);

    expect(error.message).toBe('Stack "shp" not found');
    expect(error.suggestions).toEqual([
      'Did you mean "shop"?',
      "Run `tdk stacks` to see available stacks",
      "Run `tdk stack` to assign resources to a stack",
    ]);
  });

  it("suggests a close resource name while retaining existing guidance", () => {
    const error = errorFactories.resourceNotFound("aip", ["api", "web"]);

    expect(error.message).toBe('Resource "aip" not found');
    expect(error.suggestions).toEqual([
      'Did you mean "api"?',
      "Run `tdk resources` to list all resources",
      "Check the resource name spelling",
    ]);
  });

  it("keeps the current suggestions when no candidate is close", () => {
    const error = errorFactories.stackNotFound("missing", ["api", "web"]);

    expect(error.suggestions).toEqual([
      "Run `tdk stacks` to see available stacks",
      "Run `tdk stack` to assign resources to a stack",
    ]);
  });
});
