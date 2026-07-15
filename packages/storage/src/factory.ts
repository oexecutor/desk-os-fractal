import type { EventStore } from "@desk-os/events";
import { BlobEventStore } from "./blob-event-store.js";
import { MemoryBlobStore, type BlobStore } from "./blob-store.js";
import { NetlifyBlobStore } from "./netlify-blob-store.js";
import { createRepositories, type Repositories } from "./repositories.js";

export type StorageAdapterKind = "memory" | "netlify-blobs";

export interface StorageConfig {
  adapter: StorageAdapterKind;
  netlify?: { storeName: string; siteID?: string; token?: string };
}

export interface Storage<
  TWorkspace = unknown,
  TPlanVersion = unknown,
  TQrToken = unknown,
  TPrintSnapshot = unknown,
  TIngestionJob = unknown,
> extends Repositories<TWorkspace, TPlanVersion, TQrToken, TPrintSnapshot, TIngestionJob> {
  blobs: BlobStore;
  eventStoreFor(workspaceId: string): EventStore;
}

/** ADR-0004: único ponto de escolha do adapter de storage (memory | netlify-blobs). */
export function createStorage<
  TWorkspace = unknown,
  TPlanVersion = unknown,
  TQrToken = unknown,
  TPrintSnapshot = unknown,
  TIngestionJob = unknown,
>(
  config: StorageConfig,
): Storage<TWorkspace, TPlanVersion, TQrToken, TPrintSnapshot, TIngestionJob> {
  const blobs: BlobStore =
    config.adapter === "netlify-blobs"
      ? new NetlifyBlobStore(
          config.netlify ?? {
            storeName: "desk-os",
          },
        )
      : new MemoryBlobStore();

  return {
    blobs,
    ...createRepositories<TWorkspace, TPlanVersion, TQrToken, TPrintSnapshot, TIngestionJob>(blobs),
    eventStoreFor(workspaceId: string): EventStore {
      return new BlobEventStore(blobs, workspaceId);
    },
  };
}
