import { VERDICT } from "../domain/types.js";

function stripTldrLeadIn(text) {
  const cleaned = (text ?? "").trim();
  if (!cleaned) {
    return "";
  }

  const patterns = [
    /^tl;dr\s*[:\-]?\s*/i,
    /^tldr\s*[:\-]?\s*/i,
    /^oto\s+(szczegolowe|szczegółowe)\s+podsumowanie\s*(transkrypcji)?\s*[:\-]?\s*/i,
    /^here(?:\s+is|'s)\s+(?:a\s+)?(?:detailed\s+)?summary\s*(?:of\s+the\s+transcript)?\s*[:\-]?\s*/i
  ];

  let result = cleaned;
  for (const pattern of patterns) {
    result = result.replace(pattern, "").trimStart();
  }

  return result || cleaned;
}

export function formatTldrResult(result) {
  if (!result.success) {
    return `Nie udalo sie przygotowac podsumowania: ${result.message}`;
  }

  return stripTldrLeadIn(result.summary);
}

function emojiForVerdict(verdict) {
  switch (verdict) {
    case VERDICT.TRUE:
      return "✅";
    case VERDICT.FALSE:
      return "❌";
    case VERDICT.MIXED:
      return "⚖️";
    default:
      return "❓";
  }
}

export function formatFactCheckResult(result) {
  const verdictLabels = {
    TRUE: "PRAWDA",
    FALSE: "FALSZ",
    MIXED: "CZESCIOWO_PRAWDA",
    UNKNOWN: "NIEPEWNE"
  };
  const header = `${emojiForVerdict(result.verdict)} ${verdictLabels[result.verdict] || result.verdict} (pewnosc: ${(result.confidence * 100).toFixed(0)}%)`;
  const evidence = result.evidence
    .map((item, index) => `${index + 1}. ${item.title}\n${item.url}`)
    .join("\n\n");

  return `${header}\n\n${result.explanation}\n\nZrodla:\n${evidence || "Brak zrodel."}`;
}
