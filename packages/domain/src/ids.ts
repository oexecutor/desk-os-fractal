import { monotonicFactory } from "ulid";

/**
 * ADR-0014: IDs are system-generated (ULID, monotonic), never derived from
 * title, list index or date. The monotonic factory guarantees strictly
 * increasing IDs even for calls within the same millisecond, which is what
 * lets `order` and creation sequence stay independently meaningful.
 */
const nextUlid = monotonicFactory();

export type Branded<T, Tag extends string> = T & { readonly __brand: Tag };

export type WorkspaceId = Branded<string, "WorkspaceId">;
export type ProjectId = Branded<string, "ProjectId">;
export type PlanVersionId = Branded<string, "PlanVersionId">;
export type WorkNodeId = Branded<string, "WorkNodeId">;
export type SourceArtifactId = Branded<string, "SourceArtifactId">;
export type EventId = Branded<string, "EventId">;
export type StreamId = Branded<string, "StreamId">;
export type QrTokenId = Branded<string, "QrTokenId">;
export type IngestionJobId = Branded<string, "IngestionJobId">;
export type PrintSnapshotId = Branded<string, "PrintSnapshotId">;
export type CorrelationId = Branded<string, "CorrelationId">;

/** Generates a stable, monotonic, opaque identifier. Never pass in title/index/date. */
export function createId<Tag extends string>(): Branded<string, Tag> {
  return nextUlid().toLowerCase() as Branded<string, Tag>;
}

export function isValidId(value: unknown): value is string {
  return typeof value === "string" && value.length >= 16;
}
