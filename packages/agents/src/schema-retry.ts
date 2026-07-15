import type { ModelRequest, StructuredModelClient } from "./model-client.js";
import { ModelOutputInvalidError } from "./model-client.js";

export interface SchemaRetryOptions {
  maxRetries?: number;
}

/**
 * specs/DECOMPOSITION_ENGINE.md: "JSON inválido: retry de structured output
 * com limite"; specs/AGENT_CONTRACTS.md "Retry de schema": tentativas
 * recebem somente os erros de validação necessários.
 */
export function withSchemaRetry(
  client: StructuredModelClient,
  validate: (value: unknown) => string[] /* erros; vazio = válido */,
  options: SchemaRetryOptions = {},
): StructuredModelClient {
  const maxRetries = options.maxRetries ?? 2;

  return {
    async generate<T = unknown>(request: ModelRequest): Promise<T> {
      let lastErrors: string[] = [];
      for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        const previousErrors = lastErrors.length > 0 ? lastErrors : request.previousErrors;
        const output = await client.generate<unknown>({
          ...request,
          ...(previousErrors ? { previousErrors } : {}),
        });
        const errors = validate(output);
        if (errors.length === 0) {
          return output as T;
        }
        lastErrors = errors;
      }
      throw new ModelOutputInvalidError(lastErrors);
    },
  };
}
