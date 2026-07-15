import { describe, expect, it } from "vitest";
import {
  InvalidLifecycleTransitionError,
  assertTransition,
  canAcceptExecutionEvents,
  canEmitOperationalPrint,
  canIssueMutableQr,
  canTransition,
} from "./lifecycle.js";

describe("plan lifecycle — specs/PLAN_LIFECYCLE.md", () => {
  it("permite a sequência de aprovação padrão", () => {
    expect(canTransition("GENERATED", "IN_REVIEW")).toBe(true);
    expect(canTransition("IN_REVIEW", "APPROVED")).toBe(true);
    expect(canTransition("APPROVED", "ACTIVE")).toBe(true);
  });

  it("rejeita pular etapas (GENERATED -> ACTIVE)", () => {
    expect(canTransition("GENERATED", "ACTIVE")).toBe(false);
    expect(() => assertTransition("GENERATED", "ACTIVE")).toThrow(
      InvalidLifecycleTransitionError,
    );
  });

  it("estados terminais não aceitam nenhuma transição", () => {
    for (const terminal of ["BLOCKED", "REJECTED", "SUPERSEDED", "ARCHIVED"] as const) {
      expect(canTransition(terminal, "ACTIVE")).toBe(false);
    }
  });

  it("somente ACTIVE aceita eventos de execução, impressão operacional e QR mutável", () => {
    for (const state of [
      "GENERATED",
      "IN_REVIEW",
      "APPROVED",
      "BLOCKED",
      "REJECTED",
      "SUPERSEDED",
      "COMPLETED",
      "ARCHIVED",
    ] as const) {
      expect(canAcceptExecutionEvents(state)).toBe(false);
      expect(canEmitOperationalPrint(state)).toBe(false);
      expect(canIssueMutableQr(state)).toBe(false);
    }
    expect(canAcceptExecutionEvents("ACTIVE")).toBe(true);
    expect(canEmitOperationalPrint("ACTIVE")).toBe(true);
    expect(canIssueMutableQr("ACTIVE")).toBe(true);
  });
});
