import { VERDICT } from "../domain/types.js";

function normalizeEvidence(items) {
  return items
    .filter((item) => item.url)
    .map((item) => ({
      title: item.title || "Bez tytulu",
      url: item.url,
      snippet: item.snippet || ""
    }));
}

export function createFactCheckService({ searchProvider, factCheckProvider, logger }) {
  return {
    async execute({ claim, correlationId, maxResults }) {
      const safeLanguage = "pl";
      logger.info({ correlationId, claim, language: safeLanguage }, "fact-check started");

      const searchResults = await searchProvider.search({
        query: claim,
        maxResults,
        correlationId
      });

      const evidence = normalizeEvidence(searchResults);

      const modelResult = await factCheckProvider.factCheck({
        claim,
        language: safeLanguage,
        evidence,
        correlationId
      });

      logger.info({ correlationId, verdict: modelResult.verdict }, "fact-check completed");

      return {
        success: modelResult.verdict !== VERDICT.UNKNOWN,
        verdict: modelResult.verdict,
        confidence: modelResult.confidence,
        explanation: modelResult.explanation,
        evidence
      };
    }
  };
}
