import type { ModelRequest, StructuredModelClient } from "./model-client.js";
import { ModelOutputInvalidError } from "./model-client.js";

export interface AnthropicModelClientOptions {
  apiKey: string;
  model: string;
  baseUrl?: string;
  maxTokens?: number;
}

/**
 * ADR-0016: adapter concreto usando a Anthropic Messages API diretamente
 * (sem SDK) via tool-use para forçar saída estruturada no schema pedido.
 * Nunca é exercitado em teste/CI (exige ANTHROPIC_API_KEY de servidor,
 * nunca no cliente — CLAUDE.md). Chamado apenas quando LLM_PROVIDER=anthropic.
 */
export class AnthropicModelClient implements StructuredModelClient {
  constructor(private readonly options: AnthropicModelClientOptions) {}

  async generate<T = unknown>(request: ModelRequest): Promise<T> {
    const toolName = "emit_structured_output";
    const response = await fetch(`${this.options.baseUrl ?? "https://api.anthropic.com"}/v1/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.options.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.options.model,
        max_tokens: this.options.maxTokens ?? 4096,
        system: request.system,
        messages: [
          {
            role: "user",
            content: request.previousErrors?.length
              ? `${request.prompt}\n\nA tentativa anterior falhou a validação de schema:\n${request.previousErrors.join("\n")}\nCorrija e responda novamente.`
              : request.prompt,
          },
        ],
        tools: [
          {
            name: toolName,
            description: "Emite a saída estruturada no schema fornecido.",
            input_schema: request.schema,
          },
        ],
        tool_choice: { type: "tool", name: toolName },
      }),
    });

    if (!response.ok) {
      throw new ModelOutputInvalidError([`Anthropic API respondeu ${response.status}`]);
    }

    const body = (await response.json()) as {
      content: Array<{ type: string; name?: string; input?: unknown }>;
    };
    const toolUse = body.content.find((block) => block.type === "tool_use" && block.name === toolName);
    if (!toolUse) {
      throw new ModelOutputInvalidError(["Resposta do modelo não incluiu tool_use esperado"]);
    }
    return toolUse.input as T;
  }
}
