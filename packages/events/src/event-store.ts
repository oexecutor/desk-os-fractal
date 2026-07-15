import { createId, type DomainEvent } from "@desk-os/domain";
import { VersionConflictError } from "./errors.js";

export interface NewEventInput<TData extends Record<string, unknown> = Record<string, unknown>> {
  event_type: DomainEvent["event_type"];
  workspace_id: string;
  data: TData;
  actor: { type: "USER" | "SYSTEM" | "QR"; id: string };
  correlation_id: string;
  causation_id?: string | null;
}

export interface AppendInput {
  streamId: string;
  expectedVersion: number;
  idempotencyKey?: string | null;
  events: NewEventInput[];
}

export interface AppendResult {
  events: DomainEvent[];
  replayed: boolean;
  streamVersion: number;
}

/** ADR-0006: log de eventos append-only por stream, com snapshot materializado derivado. */
export interface EventStore {
  readStream(streamId: string): Promise<DomainEvent[]>;
  getVersion(streamId: string): Promise<number>;
  append(input: AppendInput): Promise<AppendResult>;
  /** Consulta o cache de idempotência sem validar expected_version — usado
   * para short-circuitar replay antes de qualquer checagem de negócio. */
  peekIdempotency(streamId: string, idempotencyKey: string): Promise<AppendResult | null>;
}

/**
 * Materializa `NewEventInput[]` em `DomainEvent[]` com IDs, timestamp de
 * servidor e stream_version sequencial. Compartilhado por todo adapter de
 * EventStore (memory aqui, Netlify Blobs em packages/storage) para que a
 * forma do evento nunca diverja entre adapters.
 */
export function materializeEvents(
  streamId: string,
  expectedVersion: number,
  idempotencyKey: string | null | undefined,
  events: readonly NewEventInput[],
): DomainEvent[] {
  const now = new Date().toISOString();
  return events.map((input, index) => ({
    schema_version: "1.0.0",
    event_id: createId(),
    event_type: input.event_type,
    workspace_id: input.workspace_id,
    stream_id: streamId,
    stream_version: expectedVersion + index + 1,
    occurred_at: now,
    actor: input.actor,
    data: input.data,
    correlation_id: input.correlation_id,
    causation_id: input.causation_id ?? null,
    idempotency_key: idempotencyKey ?? null,
  }));
}

export class InMemoryEventStore implements EventStore {
  private readonly streams = new Map<string, DomainEvent[]>();
  private readonly idempotencyCache = new Map<string, AppendResult>();

  async readStream(streamId: string): Promise<DomainEvent[]> {
    return [...(this.streams.get(streamId) ?? [])];
  }

  async getVersion(streamId: string): Promise<number> {
    return this.streams.get(streamId)?.length ?? 0;
  }

  async peekIdempotency(streamId: string, idempotencyKey: string): Promise<AppendResult | null> {
    const cached = this.idempotencyCache.get(`${streamId}::${idempotencyKey}`);
    return cached ? { ...cached, replayed: true } : null;
  }

  async append(input: AppendInput): Promise<AppendResult> {
    const { streamId, expectedVersion, idempotencyKey, events } = input;

    if (idempotencyKey) {
      const cached = await this.peekIdempotency(streamId, idempotencyKey);
      if (cached) {
        return cached;
      }
    }

    const current = this.streams.get(streamId) ?? [];
    if (current.length !== expectedVersion) {
      throw new VersionConflictError(streamId, expectedVersion, current.length);
    }

    const appended = materializeEvents(streamId, expectedVersion, idempotencyKey, events);
    this.streams.set(streamId, [...current, ...appended]);

    const result: AppendResult = {
      events: appended,
      replayed: false,
      streamVersion: expectedVersion + appended.length,
    };

    if (idempotencyKey) {
      this.idempotencyCache.set(`${streamId}::${idempotencyKey}`, result);
    }

    return result;
  }
}
