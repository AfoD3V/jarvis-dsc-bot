import { DETAIL_LEVELS } from "../domain/types.js";

function sourceFallbackMessage() {
  return "Wystapil tymczasowy problem podczas przygotowywania podsumowania. Sprobuj ponownie za chwile.";
}

export function createTldrService({ summaryProvider, logger }) {
  return {
    async execute({ youtubeUrl, detailLevel, correlationId }) {
      const safeDetail = DETAIL_LEVELS.includes(detailLevel) ? detailLevel : "mid";
      const safeLanguage = "pl";

      logger.info({ correlationId, youtubeUrl, detailLevel: safeDetail, language: safeLanguage }, "tldr started");

      try {
        const result = await summaryProvider.summarizeFromYoutube({
          youtubeUrl,
          detailLevel: safeDetail,
          language: safeLanguage,
          correlationId
        });

        logger.info({ correlationId }, "tldr completed");
        return {
          success: true,
          code: "OK",
          detailLevel: safeDetail,
          language: safeLanguage,
          summary: result.summary
        };
      } catch (error) {
        logger.warn({ correlationId, error: error.message }, "youtube source unavailable");
        return {
          success: false,
          code: "SOURCE_UNAVAILABLE",
          message: sourceFallbackMessage()
        };
      }
    }
  };
}
