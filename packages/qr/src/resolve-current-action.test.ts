import { describe, expect, it } from "vitest";
import { resolveCurrentAction } from "./resolve-current-action.js";
import { buildTwoBlockPlan, emptyState, withNodeState } from "./test-fixtures.js";

describe("resolveCurrentAction — specs/QR_SEMANTIC_CURRENT_ACTION.md", () => {
  it("passo 5: nenhuma ação iniciada -> primeira TODO elegível do primeiro bloco", () => {
    const plan = buildTwoBlockPlan();
    const resolution = resolveCurrentAction(plan, emptyState());
    expect(resolution.resolved_kind).toBe("ACTION");
    expect(resolution.target_id).toBe("segaction0000000001");
    expect(resolution.action_status).toBe("TODO");
    expect(resolution.confirmation_required).toBe(true);
  });

  it("passo 4: ação IN_PROGRESS tem prioridade sobre TODO", () => {
    let state = emptyState();
    state = withNodeState(state, "segaction0000000002", "IN_PROGRESS");
    const resolution = resolveCurrentAction(buildTwoBlockPlan(), state);
    expect(resolution.target_id).toBe("segaction0000000002");
    expect(resolution.action_status).toBe("IN_PROGRESS");
  });

  it("passo 4: mais de uma IN_PROGRESS é conflito de domínio, não escolhe silenciosamente", () => {
    let state = emptyState();
    state = withNodeState(state, "segaction0000000001", "IN_PROGRESS");
    state = withNodeState(state, "segaction0000000002", "IN_PROGRESS");
    const resolution = resolveCurrentAction(buildTwoBlockPlan(), state);
    expect(resolution.resolved_kind).toBe("AMBIGUOUS_IN_PROGRESS");
    expect(resolution.target_id).toBeNull();
  });

  it("ação bloqueada não impede uma ação paralela elegível de ser oferecida", () => {
    let state = emptyState();
    state = withNodeState(state, "segaction0000000001", "DONE");
    state = withNodeState(state, "segaction0000000002", "BLOCKED");
    // segaction...003 continua TODO e sem dependências pendentes: é elegível.
    const resolution = resolveCurrentAction(buildTwoBlockPlan(), state);
    expect(resolution.resolved_kind).toBe("ACTION");
    expect(resolution.target_id).toBe("segaction0000000003");
  });

  it("bloco totalmente bloqueado (sem nenhuma ação elegível) não avança silenciosamente para o próximo bloco", () => {
    let state = emptyState();
    state = withNodeState(state, "segaction0000000001", "DONE");
    state = withNodeState(state, "segaction0000000002", "BLOCKED");
    state = withNodeState(state, "segaction0000000003", "BLOCKED");
    const resolution = resolveCurrentAction(buildTwoBlockPlan(), state);
    expect(resolution.resolved_kind).toBe("NO_ACTIONABLE_TARGET");
    expect(resolution.block_id).toBe("blockseg000000000001");
  });

  it("passo 6: as três ações concluídas -> alvo é o LINK do bloco", () => {
    let state = emptyState();
    for (const id of ["segaction0000000001", "segaction0000000002", "segaction0000000003"]) {
      state = withNodeState(state, id, "DONE");
    }
    const resolution = resolveCurrentAction(buildTwoBlockPlan(), state);
    expect(resolution.resolved_kind).toBe("SYNTHESIS");
    expect(resolution.target_id).toBe("segsynthesis00000001");
  });

  it("passo 7/8: LINK concluído -> fechamento do bloco pendente", () => {
    let state = emptyState();
    for (const id of [
      "segaction0000000001",
      "segaction0000000002",
      "segaction0000000003",
      "segsynthesis00000001",
    ]) {
      state = withNodeState(state, id, "DONE");
    }
    const resolution = resolveCurrentAction(buildTwoBlockPlan(), state);
    expect(resolution.resolved_kind).toBe("CLOSE_DAY");
    expect(resolution.target_id).toBe("blockseg000000000001");
  });

  it("passo 8: bloco fechado (block DONE) avança para o próximo bloco", () => {
    let state = emptyState();
    state = withNodeState(state, "blockseg000000000001", "DONE");
    const resolution = resolveCurrentAction(buildTwoBlockPlan(), state);
    expect(resolution.resolved_kind).toBe("ACTION");
    expect(resolution.target_id).toBe("teraction0000000001");
  });

  it("passo 9: todos os blocos fechados -> RECYCLE", () => {
    let state = emptyState();
    state = withNodeState(state, "blockseg000000000001", "DONE");
    state = withNodeState(state, "blockter000000000001", "DONE");
    const resolution = resolveCurrentAction(buildTwoBlockPlan(), state);
    expect(resolution.resolved_kind).toBe("RECYCLE");
    expect(resolution.confirmation_required).toBe(true);
  });

  it("plano não ACTIVE nunca resolve um alvo executável", () => {
    const plan = buildTwoBlockPlan({ lifecycle_state: "SUPERSEDED" });
    const resolution = resolveCurrentAction(plan, emptyState());
    expect(resolution.resolved_kind).toBe("PLAN_NOT_ACTIVE");
    expect(resolution.confirmation_required).toBe(false);
  });

  it("AT-036: concluir a primeira ação no app e resolver de novo avança o alvo sem mudar o token impresso", () => {
    const plan = buildTwoBlockPlan();
    const before = resolveCurrentAction(plan, emptyState());
    expect(before.target_id).toBe("segaction0000000001");

    let state = emptyState(1);
    state = withNodeState(state, "segaction0000000001", "DONE");
    const after = resolveCurrentAction(plan, state);
    expect(after.target_id).toBe("segaction0000000002");
    expect(after.target_id).not.toBe(before.target_id);
    // o "token impresso" nunca aparece nesta função — ele é estável no registry (registry.test.ts).
  });
});
