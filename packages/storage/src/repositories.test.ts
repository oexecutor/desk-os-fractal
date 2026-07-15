import { describe, expect, it } from "vitest";
import { MemoryBlobStore } from "./blob-store.js";
import { createRepositories } from "./repositories.js";

describe("JsonRepository over MemoryBlobStore", () => {
  it("salva, lê e apaga por id", async () => {
    const blobs = new MemoryBlobStore();
    const repos = createRepositories<{ id: string; name: string }>(blobs);

    await repos.workspaces.save("ws-1", { id: "ws-1", name: "Piloto" });
    expect(await repos.workspaces.get("ws-1")).toEqual({ id: "ws-1", name: "Piloto" });

    await repos.workspaces.delete("ws-1");
    expect(await repos.workspaces.get("ws-1")).toBeNull();
  });

  it("get retorna null quando a chave não existe", async () => {
    const blobs = new MemoryBlobStore();
    const repos = createRepositories(blobs);
    expect(await repos.planVersions.get("nao-existe")).toBeNull();
  });

  it("ponteiro de versão de plano ativa por workspace", async () => {
    const blobs = new MemoryBlobStore();
    const repos = createRepositories(blobs);
    expect(await repos.getActivePlanVersion("ws-1")).toBeNull();
    await repos.setActivePlanVersion("ws-1", "plan-v2");
    expect(await repos.getActivePlanVersion("ws-1")).toBe("plan-v2");
  });
});
