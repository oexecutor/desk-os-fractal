/**
 * ADR-0016: o motor depende desta interface, nunca de um SDK específico.
 * `schema` é o JSON Schema (2020-12) que a saída precisa satisfazer —
 * quem implementa decide como forçar isso (tool-use, response_format, etc).
 */
export interface ModelRequest {
  system: string;
  prompt: string;
  schema: Record<string, unknown>;
  /** Eco de erros de validação de uma tentativa anterior, para retry guiado. */
  previousErrors?: string[];
}

export interface StructuredModelClient {
  generate<T = unknown>(request: ModelRequest): Promise<T>;
}

export class ModelOutputInvalidError extends Error {
  constructor(public readonly errors: string[]) {
    super(`MODEL_OUTPUT_INVALID: ${errors.join("; ")}`);
    this.name = "ModelOutputInvalidError";
  }
}
