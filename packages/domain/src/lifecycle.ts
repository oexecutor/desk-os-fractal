import type { PlanLifecycleState } from "./types.js";

/** specs/PLAN_LIFECYCLE.md */
const TRANSITIONS: Record<PlanLifecycleState, readonly PlanLifecycleState[]> = {
  GENERATED: ["IN_REVIEW", "BLOCKED"],
  IN_REVIEW: ["APPROVED", "REJECTED", "BLOCKED"],
  APPROVED: ["ACTIVE"],
  ACTIVE: ["SUPERSEDED", "COMPLETED", "BLOCKED"],
  BLOCKED: [],
  REJECTED: [],
  SUPERSEDED: [],
  COMPLETED: ["ARCHIVED"],
  ARCHIVED: [],
};

export class InvalidLifecycleTransitionError extends Error {
  constructor(
    public readonly from: PlanLifecycleState,
    public readonly to: PlanLifecycleState,
  ) {
    super(`Transição de plano inválida: ${from} -> ${to}`);
    this.name = "InvalidLifecycleTransitionError";
  }
}

export function canTransition(from: PlanLifecycleState, to: PlanLifecycleState): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: PlanLifecycleState, to: PlanLifecycleState): void {
  if (!canTransition(from, to)) {
    throw new InvalidLifecycleTransitionError(from, to);
  }
}

/**
 * ADR-0007 / PRD §9: somente ACTIVE pode criar sprint executável, aceitar
 * conclusão de ações, emitir dashboard físico operacional ou gerar QR mutável.
 */
export function isActive(state: PlanLifecycleState): boolean {
  return state === "ACTIVE";
}

export function canAcceptExecutionEvents(state: PlanLifecycleState): boolean {
  return isActive(state);
}

export function canEmitOperationalPrint(state: PlanLifecycleState): boolean {
  return isActive(state);
}

export function canIssueMutableQr(state: PlanLifecycleState): boolean {
  return isActive(state);
}
