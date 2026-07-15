import { describe, expect, it } from "vitest";
import { assertConsent, ConsentRequiredError } from "./consent.js";

describe("assertConsent — FR-003", () => {
  it("lança ConsentRequiredError quando não há consentimento", () => {
    expect(() => assertConsent(false)).toThrow(ConsentRequiredError);
  });

  it("não lança quando o consentimento foi dado", () => {
    expect(() => assertConsent(true)).not.toThrow();
  });
});
