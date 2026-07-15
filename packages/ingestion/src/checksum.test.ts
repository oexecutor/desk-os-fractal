import { describe, expect, it } from "vitest";
import { sha256Hex } from "./checksum.js";

describe("sha256Hex", () => {
  it("é determinístico e usa o formato hex de 64 caracteres", () => {
    const hash = sha256Hex("desk-os");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(sha256Hex("desk-os")).toBe(hash);
  });

  it("entradas diferentes produzem hashes diferentes", () => {
    expect(sha256Hex("a")).not.toBe(sha256Hex("b"));
  });
});
