import type { DomainEvent } from "@desk-os/domain";
import type { AppendInput, AppendResult, EventStore } from "@desk-os/events";
import { VersionConflictError, materializeEvents } from "@desk-os/events";
import type { BlobStore } from "./blob-store.js";

/**
 * ADR-0004/ADR-0006: adapter de EventStore sobre BlobStore (memory ou
 * Netlify Blobs). Cada stream é persistido como um único blob JSON — mais
 * simples que um objeto por evento, ao custo de reescrever o stream inteiro
 * a cada append. Netlify Blobs não oferece transação multi-chave: sob
 * escrita concorrente real no mesmo stream, a checagem de expected_version
 * ainda impede sobrescrita silenciosa (read-then-compare-then-write), mas
 * uma corrida entre duas escritas simultâneas pode, em tese, intercalar
 * (ver RISK_REGISTER R-007) — aceitável para o piloto de usuário único.
 */
export class BlobEventStore implements EventStore {
  constructor(
    private readonly blobs: BlobStore,
    private readonly workspaceId: string,
  ) {}

  private streamKey(streamId: string): string {
    return `workspaces/${this.workspaceId}/events/${streamId}`;
  }

  private idempotencyKeyOf(streamId: string, idempotencyKey: string): string {
    return `workspaces/${this.workspaceId}/idempotency/${streamId}/${idempotencyKey}`;
  }

  async readStream(streamId: string): Promise<DomainEvent[]> {
    const raw = await this.blobs.get(this.streamKey(streamId));
    return raw ? (JSON.parse(raw) as DomainEvent[]) : [];
  }

  async getVersion(streamId: string): Promise<number> {
    const events = await this.readStream(streamId);
    return events.length;
  }

  async peekIdempotency(streamId: string, idempotencyKey: string): Promise<AppendResult | null> {
    const raw = await this.blobs.get(this.idempotencyKeyOf(streamId, idempotencyKey));
    if (!raw) return null;
    const cached = JSON.parse(raw) as AppendResult;
    return { ...cached, replayed: true };
  }

  async append(input: AppendInput): Promise<AppendResult> {
    const { streamId, expectedVersion, idempotencyKey, events } = input;

    if (idempotencyKey) {
      const cached = await this.peekIdempotency(streamId, idempotencyKey);
      if (cached) return cached;
    }

    const current = await this.readStream(streamId);
    if (current.length !== expectedVersion) {
      throw new VersionConflictError(streamId, expectedVersion, current.length);
    }

    const appended: DomainEvent[] = materializeEvents(streamId, expectedVersion, idempotencyKey, events);

    await this.blobs.set(this.streamKey(streamId), JSON.stringify([...current, ...appended]));

    const result: AppendResult = {
      events: appended,
      replayed: false,
      streamVersion: expectedVersion + appended.length,
    };

    if (idempotencyKey) {
      await this.blobs.set(
        this.idempotencyKeyOf(streamId, idempotencyKey),
        JSON.stringify(result),
      );
    }

    return result;
  }
}
