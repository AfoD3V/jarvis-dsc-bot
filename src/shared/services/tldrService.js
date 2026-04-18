import { DETAIL_LEVELS } from "../domain/types.js";

function sourceFallbackMessage() {
  return "Wystapil tymczasowy problem podczas przygotowywania podsumowania. Sprobuj ponownie za chwile.";
}

export function createTldrService({ summaryProvider, transcriptProvider, logger }) {
  return {
    async execute({ youtubeUrl, detailLevel, correlationId }) {
      const safeDetail = DETAIL_LEVELS.includes(detailLevel) ? detailLevel : "mid";
      const safeLanguage = "pl";

      logger.info({ correlationId, youtubeUrl, detailLevel: safeDetail, language: safeLanguage }, "tldr started");

      try {
        const transcript = await transcriptProvider.getTranscript(youtubeUrl);
        logger.info({ correlationId, transcriptLength: transcript.length }, "tldr transcript fetched");

        const result = await summaryProvider.summarize({
          transcript,
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
        logger.warn({ correlationId, error: error.message }, "tldr failed to summarize transcript");
        return {
          success: false,
          code: "SOURCE_UNAVAILABLE",
          message: sourceFallbackMessage()
        };
      }
    }
  };
}
