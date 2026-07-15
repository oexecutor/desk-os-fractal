import { createStorage, type Storage } from "@desk-os/storage";
import { AnthropicModelClient, type StructuredModelClient } from "@desk-os/agents";
import type { PlanVersion } from "@desk-os/domain";
import type { QrTokenRecord } from "@desk-os/qr";
import type { PrintSnapshot } from "@desk-os/print";
import type { IngestionJob } from "@desk-os/ingestion";
import { createMockModelClient } from "./mock-model.js";

export type AppStorage = Storage<unknown, PlanVersion, QrTokenRecord, PrintSnapshot, IngestionJob>;

export interface AppContext {
  storage: AppStorage;
  modelClient: StructuredModelClient;
  qrBaseUrl: string;
  pilotBearerToken: string | null;
  maxUploadMb: number;
}

function isMockMode(): boolean {
  return (process.env.MOCK_MODE ?? "true").toLowerCase() !== "false";
}

function buildModelClient(): StructuredModelClient {
  if (isMockMode() || process.env.LLM_PROVIDER !== "anthropic") {
    return createMockModelClient();
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY ausente em produção com LLM_PROVIDER=anthropic.");
  }
  return new AnthropicModelClient({ apiKey, model: process.env.LLM_MODEL || "claude-sonnet-5" });
}

function buildStorage(): AppStorage {
  const adapter = isMockMode() ? "memory" : ((process.env.STORAGE_ADAPTER as "memory" | "netlify-blobs") ?? "memory");
  if (adapter === "netlify-blobs") {
    return createStorage<unknown, PlanVersion, QrTokenRecord, PrintSnapshot, IngestionJob>({
      adapter: "netlify-blobs",
      netlify: { storeName: "desk-os" },
    });
  }
  return createStorage<unknown, PlanVersion, QrTokenRecord, PrintSnapshot, IngestionJob>({ adapter: "memory" });
}

// Singleton por instância "quente" da Function — sobrevive entre invocações
// no mesmo processo (necessário para o adapter memory funcionar em dev/piloto).
let cached: AppContext | undefined;

export function getAppContext(): AppContext {
  cached ??= {
    storage: buildStorage(),
    modelClient: buildModelClient(),
    qrBaseUrl: process.env.QR_BASE_URL || "http://localhost:8888",
    pilotBearerToken: process.env.PILOT_BEARER_TOKEN || null,
    maxUploadMb: Number(process.env.MAX_UPLOAD_MB || "20"),
  };
  return cached;
}
