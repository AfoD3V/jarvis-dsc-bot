import { DETAIL_LEVELS } from "../domain/types.js";

function sourceFallbackMessage() {
  return "Wystapil tymczasowy problem podczas przygotowywania podsumowania. Sprobuj ponownie za chwile.";
}

function clipValidationMessage() {
  return "Nieprawidlowy zakres czasu. Uzyj obu pol start i end w formacie ss, mm:ss lub hh:mm:ss oraz upewnij sie, ze end > start.";
}

function parseOffsetToSeconds(raw) {
  if (!raw) {
    return null;
  }

  const value = raw.trim();
  if (!value) {
    return null;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const parts = value.split(":");
  if (!parts.every((part) => /^\d+$/.test(part))) {
    return null;
  }

  if (parts.length === 2) {
    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);
    if (seconds >= 60) {
      return null;
    }
    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    const seconds = Number(parts[2]);
    if (minutes >= 60 || seconds >= 60) {
      return null;
    }
    return hours * 3600 + minutes * 60 + seconds;
  }

  return null;
}

function resolveClip({ startOffsetRaw, endOffsetRaw }) {
  if (!startOffsetRaw && !endOffsetRaw) {
    return { valid: true };
  }

  if (!startOffsetRaw || !endOffsetRaw) {
    return { valid: false, reason: "missing_offset" };
  }

  const startSeconds = parseOffsetToSeconds(startOffsetRaw);
  const endSeconds = parseOffsetToSeconds(endOffsetRaw);
  if (startSeconds === null || endSeconds === null) {
    return { valid: false, reason: "invalid_format" };
  }

  if (startSeconds < 0 || endSeconds <= startSeconds) {
    return { valid: false, reason: "invalid_range" };
  }

  return {
    valid: true,
    startOffset: `${startSeconds}s`,
    endOffset: `${endSeconds}s`
  };
}

export function createTldrService({ summaryProvider, transcriptProvider, logger }) {
  return {
    async execute({ youtubeUrl, detailLevel, startOffsetRaw, endOffsetRaw, correlationId }) {
      const safeDetail = DETAIL_LEVELS.includes(detailLevel) ? detailLevel : "mid";
      const safeLanguage = "pl";
      const clip = resolveClip({ startOffsetRaw, endOffsetRaw });

      logger.info(
        {
          correlationId,
          youtubeUrl,
          detailLevel: safeDetail,
          language: safeLanguage,
          startOffsetRaw,
          endOffsetRaw
        },
        "tldr started"
      );

      if (!clip.valid) {
        logger.warn({ correlationId, reason: clip.reason, startOffsetRaw, endOffsetRaw }, "tldr invalid clip options");
        return {
          success: false,
          code: "INVALID_CLIP_RANGE",
          message: clipValidationMessage()
        };
      }

      try {
        const result = await summaryProvider.summarizeFromYoutube({
          youtubeUrl,
          detailLevel: safeDetail,
          language: safeLanguage,
          correlationId,
          startOffset: clip.startOffset,
          endOffset: clip.endOffset
        });

        logger.info({ correlationId, strategy: "gemini_video" }, "tldr completed");
        return {
          success: true,
          code: "OK",
          detailLevel: safeDetail,
          language: safeLanguage,
          summary: result.summary
        };
      } catch (videoError) {
        logger.warn(
          { correlationId, error: videoError.message, strategy: "gemini_video" },
          "tldr video summarization failed, trying transcript fallback"
        );
      }

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
        logger.warn({ correlationId, error: error.message, strategy: "transcript" }, "tldr failed to summarize transcript");
        return {
          success: false,
          code: "SOURCE_UNAVAILABLE",
          message: sourceFallbackMessage()
        };
      }
    }
  };
}
