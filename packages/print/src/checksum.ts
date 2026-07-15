import { createHash } from "node:crypto";
import type { PrintFace1, PrintFace2 } from "./print-snapshot.js";

/** JSON.stringify com chaves ordenadas recursivamente — necessário para que
 * o mesmo conteúdo produza sempre o mesmo checksum, independente da ordem
 * de inserção de propriedades. */
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/** specs/PHYSICAL_DASHBOARD_FOLDED_WEEKLY.md §8: "manter checksum
 * determinístico do payload normalizado" — mesmo conteúdo -> mesmo checksum. */
export function computePrintChecksum(face1: PrintFace1, face2: PrintFace2): string {
  const digest = createHash("sha256")
    .update(stableStringify({ face1, face2 }))
    .digest("hex")
    .toUpperCase();
  const groups = digest.slice(0, 16).match(/.{1,4}/g) ?? [];
  return groups.join("-");
}
