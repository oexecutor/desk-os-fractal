import { createId, isValidId } from "@desk-os/domain";
import { validateOrThrow } from "@desk-os/schemas";
import { sha256Hex } from "./checksum.js";
import { detectKind, mediaTypeFor, type SourceArtifactKind } from "./mime.js";

export interface SourceArtifact {
  schema_version: "1.0.0";
  id: string;
  workspace_id: string;
  kind: SourceArtifactKind;
  filename: string;
  media_type: string;
  size_bytes: number;
  sha256: string;
  language: string | null;
  created_at: string;
  retention: { keep_original: boolean; delete_after: string | null };
  warnings: string[];
}

export class PayloadTooLargeError extends Error {
  constructor(sizeBytes: number, maxBytes: number) {
    super(`PAYLOAD_TOO_LARGE: ${sizeBytes} bytes excede o limite de ${maxBytes} bytes`);
    this.name = "PayloadTooLargeError";
  }
}

export interface CreateSourceArtifactInput {
  workspaceId: string;
  filename: string;
  buffer: Uint8Array;
  maxUploadMb: number;
  /** ADR: piloto descarta original após extração bem-sucedida, salvo escolha explícita. */
  keepOriginal?: boolean;
}

/** specs/INGESTION_PIPELINE.md passos 1-3. */
export function createSourceArtifact(input: CreateSourceArtifactInput): SourceArtifact {
  if (!isValidId(input.workspaceId)) {
    throw new Error("workspace_id inválido");
  }

  const maxBytes = input.maxUploadMb * 1024 * 1024;
  if (input.buffer.byteLength > maxBytes) {
    throw new PayloadTooLargeError(input.buffer.byteLength, maxBytes);
  }

  const kind = detectKind(input.filename, input.buffer);

  const artifact: SourceArtifact = {
    schema_version: "1.0.0",
    id: createId(),
    workspace_id: input.workspaceId,
    kind,
    filename: input.filename,
    media_type: mediaTypeFor(kind),
    size_bytes: input.buffer.byteLength,
    sha256: sha256Hex(input.buffer),
    language: null,
    created_at: new Date().toISOString(),
    retention: {
      keep_original: input.keepOriginal ?? false,
      delete_after: null,
    },
    warnings: [],
  };

  return validateOrThrow("sourceArtifact", artifact);
}
