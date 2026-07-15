import { describe, expect, it } from "vitest";
import { createId, isValidId } from "./ids.js";

describe("createId", () => {
  it("never derives from title, index or date — generates opaque monotonic IDs", () => {
    const ids = Array.from({ length: 50 }, () => createId());
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
    for (const id of ids) {
      expect(isValidId(id)).toBe(true);
    }
  });

  it("is strictly monotonically increasing lexicographically", () => {
    const ids = Array.from({ length: 20 }, () => createId());
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
  });

  it("rejects short/malformed ids via isValidId", () => {
    expect(isValidId("too-short")).toBe(false);
    expect(isValidId(123)).toBe(false);
    expect(isValidId(undefined)).toBe(false);
  });
});
