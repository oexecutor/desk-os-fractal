import { afterEach, describe, expect, it, vi } from "vitest";
import { createDeskOsClient } from "./client.js";
import { ApiError } from "./types.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createDeskOsClient", () => {
  it("getPlan retorna o corpo JSON em caso de sucesso", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ id: "plan-1" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const client = createDeskOsClient({ baseUrl: "https://api.example/api" });
    const plan = await client.getPlan("plan-1");
    expect(plan).toEqual({ id: "plan-1" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example/api/plans/plan-1",
      expect.objectContaining({ headers: expect.anything() }),
    );
  });

  it("lança ApiError estruturado com o código do specs/API_ERROR_MODEL.md em caso de falha", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            error: { code: "PLAN_NOT_ACTIVE", message: "não ativo", correlation_id: "c1", retryable: false },
          }),
          { status: 409 },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createDeskOsClient({ baseUrl: "https://api.example/api" });
    await expect(client.getPlan("plan-1")).rejects.toMatchObject({
      code: "PLAN_NOT_ACTIVE",
      status: 409,
    });
    await expect(client.getPlan("plan-1")).rejects.toBeInstanceOf(ApiError);
  });

  it("inclui Authorization Bearer quando getAuthToken retorna um token", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({}), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const client = createDeskOsClient({ baseUrl: "https://api.example/api", getAuthToken: () => "tok123" });
    await client.getPlan("plan-1");
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    expect(init?.headers).toMatchObject({ authorization: "Bearer tok123" });
  });
});
