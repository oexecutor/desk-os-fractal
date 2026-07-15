import { getStore, type Store } from "@netlify/blobs";
import type { BlobStore } from "./blob-store.js";

export interface NetlifyBlobStoreOptions {
  storeName: string;
  /** Necessário fora do runtime Netlify (scripts locais/CI); em produção o
   * contexto é injetado automaticamente pela Function. */
  siteID?: string;
  token?: string;
}

/** ADR-0004: adapter piloto sobre Netlify Blobs, atrás da mesma interface BlobStore. */
export class NetlifyBlobStore implements BlobStore {
  private readonly store: Store;

  constructor(options: NetlifyBlobStoreOptions) {
    this.store =
      options.siteID && options.token
        ? getStore({ name: options.storeName, siteID: options.siteID, token: options.token })
        : getStore(options.storeName);
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key, { type: "text" });
  }

  async set(key: string, value: string): Promise<void> {
    await this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.store.delete(key);
  }

  async list(prefix: string): Promise<string[]> {
    const result = await this.store.list({ prefix });
    return result.blobs.map((blob) => blob.key).sort();
  }
}
