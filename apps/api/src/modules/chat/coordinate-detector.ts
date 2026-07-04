const EMAIL_REGEX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const URL_REGEX = /\b((https?:\/\/)|(www\.))[^\s]+/i;
// French phone numbers written as digits, with optional separators (0612345678, 06 12 34 56 78, +33 6...).
const PHONE_DIGITS_REGEX = /(?:\+33|0)\s*[1-9](?:[\s.-]?\d{2}){4}/;

const FRENCH_DIGIT_WORDS =
  "(?:zero|zéro|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf)";
// Catches evasions like "zéro six douze trente quarante..." spelled out to dodge digit regexes.
const SPELLED_PHONE_REGEX = new RegExp(`(?:${FRENCH_DIGIT_WORDS}[\\s,-]+){5,}`, "i");

export interface DetectionResult {
  flagged: boolean;
  reason: string | null;
}

/**
 * Regex-only heuristics for Phase 3. LLM-assisted evasion detection (Module G, Phase 6) will
 * layer on top of this for harder-to-catch obfuscations without replacing this fast path.
 */
export function detectLeakedCoordinates(body: string): DetectionResult {
  if (EMAIL_REGEX.test(body)) return { flagged: true, reason: "Adresse email détectée" };
  if (URL_REGEX.test(body)) return { flagged: true, reason: "Lien externe détecté" };
  if (PHONE_DIGITS_REGEX.test(body)) return { flagged: true, reason: "Numéro de téléphone détecté" };
  if (SPELLED_PHONE_REGEX.test(body)) {
    return { flagged: true, reason: "Numéro de téléphone possiblement épelé détecté" };
  }
  return { flagged: false, reason: null };
}
