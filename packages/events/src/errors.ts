/** specs/STATE_AND_EVENT_MODEL.md — "Não usar last-write-wins silencioso." */
export class VersionConflictError extends Error {
  constructor(
    public readonly streamId: string,
    public readonly expectedVersion: number,
    public readonly actualVersion: number,
  ) {
    super(
      `VERSION_CONFLICT em ${streamId}: esperado ${expectedVersion}, atual ${actualVersion}`,
    );
    this.name = "VersionConflictError";
  }
}

export class PlanNotActiveError extends Error {
  constructor(public readonly planVersionId: string) {
    super(`PLAN_NOT_ACTIVE: ${planVersionId} não está ACTIVE`);
    this.name = "PlanNotActiveError";
  }
}

export class NodeNotFoundError extends Error {
  constructor(public readonly nodeId: string) {
    super(`Nó inexistente no plano ativo: ${nodeId}`);
    this.name = "NodeNotFoundError";
  }
}
