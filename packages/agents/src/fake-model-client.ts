import type { ModelRequest, StructuredModelClient } from "./model-client.js";

/**
 * BACKLOG T030: cliente determinístico para testes e MOCK_MODE, sem
 * chamada de rede. O chamador decide exatamente o que cada requisição
 * retorna — nada é inventado.
 */
export class FakeModelClient implements StructuredModelClient {
  private callCount = 0;

  constructor(private readonly resolver: (request: ModelRequest, callIndex: number) => unknown) {}

  async generate<T = unknown>(request: ModelRequest): Promise<T> {
    const result = this.resolver(request, this.callCount);
    this.callCount += 1;
    return result as T;
  }
}
