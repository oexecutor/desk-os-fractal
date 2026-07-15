import type { BlobStore } from "./blob-store.js";

/**
 * architecture/DEPLOYMENT.md — layout lógico de chaves. O adapter concreto
 * decide como isso vira armazenamento real; o domínio nunca vê estas chaves.
 */
export class JsonRepository<T> {
  constructor(
    private readonly blobs: BlobStore,
    private readonly keyOf: (id: string) => string,
  ) {}

  async save(id: string, value: T): Promise<void> {
    await this.blobs.set(this.keyOf(id), JSON.stringify(value));
  }

  async get(id: string): Promise<T | null> {
    const raw = await this.blobs.get(this.keyOf(id));
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async delete(id: string): Promise<void> {
    await this.blobs.delete(this.keyOf(id));
  }
}

export interface Repositories<
  TWorkspace,
  TPlanVersion,
  TQrToken,
  TPrintSnapshot,
  TIngestionJob,
> {
  workspaces: JsonRepository<TWorkspace>;
  planVersions: JsonRepository<TPlanVersion>;
  qrTokens: JsonRepository<TQrToken>;
  printSnapshots: JsonRepository<TPrintSnapshot>;
  ingestionJobs: JsonRepository<TIngestionJob>;
  /** Ponteiro para a versão de plano ativa de um workspace/projeto. */
  setActivePlanVersion(workspaceId: string, planVersionId: string): Promise<void>;
  getActivePlanVersion(workspaceId: string): Promise<string | null>;
}

export function createRepositories<
  TWorkspace = unknown,
  TPlanVersion = unknown,
  TQrToken = unknown,
  TPrintSnapshot = unknown,
  TIngestionJob = unknown,
>(
  blobs: BlobStore,
): Repositories<TWorkspace, TPlanVersion, TQrToken, TPrintSnapshot, TIngestionJob> {
  return {
    workspaces: new JsonRepository(blobs, (id) => `workspaces/${id}`),
    planVersions: new JsonRepository(blobs, (id) => `plan-versions/${id}`),
    qrTokens: new JsonRepository(blobs, (id) => `qr-tokens/${id}`),
    printSnapshots: new JsonRepository(blobs, (id) => `print-snapshots/${id}`),
    ingestionJobs: new JsonRepository(blobs, (id) => `ingestions/${id}`),
    async setActivePlanVersion(workspaceId, planVersionId) {
      await blobs.set(`workspaces/${workspaceId}/active-plan-version`, planVersionId);
    },
    async getActivePlanVersion(workspaceId) {
      return blobs.get(`workspaces/${workspaceId}/active-plan-version`);
    },
  };
}
