const PT_STOPWORDS = new Set([
  "de", "a", "o", "que", "e", "do", "da", "em", "um", "para", "com", "não",
  "uma", "os", "no", "se", "na", "por", "mais", "as", "dos", "como", "mas",
  "ao", "ele", "das", "seu", "sua", "ou", "quando", "muito", "nos", "já",
]);
const EN_STOPWORDS = new Set([
  "the", "of", "and", "a", "to", "in", "is", "you", "that", "it", "he",
  "was", "for", "on", "are", "with", "as", "his", "they", "be", "at",
  "this", "have", "from", "or", "one", "had", "by",
]);

/**
 * Heurística leve de detecção de idioma (contagem de stopwords pt/en).
 * Não é um classificador robusto — quando o texto é curto demais ou
 * ambíguo, retorna `null` (LACUNA explícita) em vez de adivinhar.
 */
export function detectLanguageHeuristic(text: string): string | null {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length < 20) return null;

  let ptScore = 0;
  let enScore = 0;
  for (const word of words) {
    if (PT_STOPWORDS.has(word)) ptScore += 1;
    if (EN_STOPWORDS.has(word)) enScore += 1;
  }

  if (ptScore === 0 && enScore === 0) return null;
  if (ptScore === enScore) return null;
  return ptScore > enScore ? "pt" : "en";
}
