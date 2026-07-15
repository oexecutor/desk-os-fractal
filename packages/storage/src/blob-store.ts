/**
 * ADR-0004: o domínio usa interfaces de repositório; nenhuma regra de
 * domínio conhece APIs Netlify. `BlobStore` é o único ponto que os adapters
 * concretos (memory / Netlify Blobs) precisam implementar.
 */
export interface BlobStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  /** Lista chaves com o prefixo dado (sem paginação — piloto). */
  list(prefix: string): Promise<string[]>;
}

export class MemoryBlobStore implements BlobStore {
  private readonly data = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }

  async list(prefix: string): Promise<string[]> {
    return [...this.data.keys()].filter((k) => k.startsWith(prefix)).sort();
  }

  /** Utilitário de teste/observabilidade — não faz parte da interface BlobStore. */
  clear(): void {
    this.data.clear();
  }
}
