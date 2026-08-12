/**
 * Batch page-translation support.
 *
 * Multiple paragraphs are joined into a single translation request with a
 * separator, cutting the number of HTTP round-trips from N to ~N/10 (this is
 * the dominant cost of page translation). The separator must survive machine
 * translation verbatim — Google / Bing / Baidu pass it through unchanged — so
 * the result can be split back 1:1 per paragraph.
 *
 * LLM engines are excluded from joining (see apiWithPort.pageTransBatch):
 * LLMs don't reliably preserve the separator, so batching would trigger the
 * slow per-paragraph fallback.
 */

/** Separator joining paragraphs inside a batch request. Unique enough that it
 *  never appears in page text, and short enough to keep URL overhead low. */
export const BATCH_SEP = '\n@QY_SEP@\n'

/**
 * Split a batch translation result back into per-paragraph texts.
 * @returns the parts, or null when the translator mangled the separators
 *          (count mismatch) — the caller must fall back to individual calls.
 */
export function splitBatchResult(translated: string, count: number): string[] | null {
  if (typeof translated !== 'string' || !translated) return null
  const parts = translated.split(BATCH_SEP)
  if (parts.length !== count) return null
  return parts
}
