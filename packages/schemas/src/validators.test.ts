import { describe, expect, it } from "vitest";
import { SchemaValidationError, validate, validateOrThrow } from "./validators.js";

describe("validateOrThrow — ADR-0012 fronteiras", () => {
  it("lança SchemaValidationError com detalhes do Ajv em payload inválido", () => {
    expect(() => validateOrThrow("workNode", { not: "a work node" })).toThrow(
      SchemaValidationError,
    );
  });

  it("retorna o próprio valor quando válido", () => {
    const workspace = {
      schema_version: "1.0.0",
      id: "0123456789abcdef",
      name: "Workspace de teste",
      version: 1,
      settings: {},
      root_node_ids: [],
      created_at: "2026-07-14T08:00:00Z",
      updated_at: "2026-07-14T08:00:00Z",
    };
    const result = validateOrThrow("workspace", workspace);
    expect(result).toBe(workspace);
  });
});

describe("validate — não lança, retorna boolean com type guard", () => {
  it("false para instância inválida", () => {
    expect(validate("command", {})).toBe(false);
  });
});
