import { describe, expect, it } from "vitest";
import { FakeModelClient } from "./fake-model-client.js";
import { withSchemaRetry } from "./schema-retry.js";
import { ModelOutputInvalidError } from "./model-client.js";

describe("withSchemaRetry — DECOMPOSITION_ENGINE.md 'JSON inválido: retry com limite'", () => {
  it("retorna no primeiro sucesso sem retry", async () => {
    const client = new FakeModelClient(() => ({ ok: true }));
    const retrying = withSchemaRetry(client, () => []);
    const result = await retrying.generate({ system: "s", prompt: "p", schema: {} });
    expect(result).toEqual({ ok: true });
  });

  it("tenta novamente até maxRetries e então lança ModelOutputInvalidError", async () => {
    let calls = 0;
    const client = new FakeModelClient(() => {
      calls += 1;
      return { ok: false };
    });
    const retrying = withSchemaRetry(client, () => ["campo inválido"], { maxRetries: 2 });

    await expect(retrying.generate({ system: "s", prompt: "p", schema: {} })).rejects.toThrow(
      ModelOutputInvalidError,
    );
    expect(calls).toBe(3); // tentativa inicial + 2 retries
  });

  it("recupera em uma tentativa posterior", async () => {
    let attempt = 0;
    const client = new FakeModelClient(() => {
      attempt += 1;
      return { valid: attempt >= 2 };
    });
    const retrying = withSchemaRetry(
      client,
      (value) => ((value as { valid: boolean }).valid ? [] : ["ainda inválido"]),
      { maxRetries: 2 },
    );
    const result = await retrying.generate<{ valid: boolean }>({ system: "s", prompt: "p", schema: {} });
    expect(result.valid).toBe(true);
  });
});
