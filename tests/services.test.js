import test from "node:test";
import assert from "node:assert/strict";

import { createTldrService } from "../src/shared/services/tldrService.js";
import { createFactCheckService } from "../src/shared/services/factCheckService.js";
import { formatTldrResult } from "../src/shared/discord/formatters.js";

const logger = {
  info() {},
  warn() {},
  error() {},
  child() {
    return this;
  }
};

test("tldr returns fallback when youtube source unavailable", async () => {
  const service = createTldrService({
    summaryProvider: {
      async summarizeFromYoutube() {
        throw new Error("source unavailable");
      }
    },
    logger
  });

  const result = await service.execute({
    youtubeUrl: "https://youtube.com/watch?v=123",
    detailLevel: "mid",
    correlationId: "abc"
  });

  assert.equal(result.success, false);
  assert.equal(result.code, "SOURCE_UNAVAILABLE");
});

test("tldr maps captcha errors to informative message", async () => {
  const service = createTldrService({
    summaryProvider: {
      async summarizeFromYoutube() {
        throw new Error("[YoutubeTranscript] 🚨 YouTube is receiving too many requests from this IP and now requires solving a captcha to continue");
      }
    },
    logger
  });

  const result = await service.execute({
    youtubeUrl: "https://youtube.com/watch?v=123",
    detailLevel: "mid",
    correlationId: "abc"
  });

  assert.equal(result.success, false);
  assert.equal(result.code, "SOURCE_UNAVAILABLE");
  assert.equal(
    result.message,
    "Wystapil tymczasowy problem podczas przygotowywania podsumowania. Sprobuj ponownie za chwile."
  );
});

test("tldr returns summary from youtube url via summary provider", async () => {
  const service = createTldrService({
    summaryProvider: {
      async summarizeFromYoutube(input) {
        assert.equal(input.youtubeUrl, "https://youtube.com/watch?v=123");
        return { summary: "generated summary" };
      }
    },
    logger
  });

  const result = await service.execute({
    youtubeUrl: "https://youtube.com/watch?v=123",
    detailLevel: "mid",
    correlationId: "abc"
  });

  assert.equal(result.success, true);
  assert.equal(result.code, "OK");
  assert.equal(result.summary, "generated summary");
});

test("fact-check returns unknown when evidence insufficient", async () => {
  const service = createFactCheckService({
    searchProvider: {
      async search() {
        return [{ title: "one", url: "https://example.com", snippet: "x" }];
      }
    },
    factCheckProvider: {
      async factCheck() {
        return { verdict: "UNKNOWN", confidence: 0.2, explanation: "not enough confidence" };
      }
    },
    logger
  });

  const result = await service.execute({
    claim: "Earth is flat",
    correlationId: "abc",
    maxResults: 5
  });

  assert.equal(result.success, false);
  assert.equal(result.verdict, "UNKNOWN");
  assert.deepEqual(result.evidence, [{ title: "one", url: "https://example.com", snippet: "x" }]);
});

test("formatTldrResult strips generic polish lead-in", () => {
  const output = formatTldrResult({
    success: true,
    summary: "Oto szczegolowe podsumowanie transkrypcji: \n- Punkt 1\n- Punkt 2"
  });

  assert.equal(output.startsWith("Oto szczegolowe podsumowanie transkrypcji"), false);
  assert.equal(output.startsWith("- Punkt 1"), true);
});

test("formatTldrResult strips TLDR lead-in", () => {
  const output = formatTldrResult({
    success: true,
    summary: "TL;DR: This is the actual summary body"
  });

  assert.equal(output, "This is the actual summary body");
});
