import { assertProvider } from "../domain/contracts.js";
import { createTldrService } from "./tldrService.js";
import { createFactCheckService } from "./factCheckService.js";

export function createCommandServices({ summaryProvider, transcriptProvider, searchProvider, factCheckProvider, logger }) {
  assertProvider("summary", summaryProvider, ["summarizeFromYoutube", "summarize"]);
  assertProvider("transcript", transcriptProvider, ["getTranscript"]);
  assertProvider("search", searchProvider, ["search"]);
  assertProvider("fact-check", factCheckProvider, ["factCheck"]);

  return {
    tldr: createTldrService({ summaryProvider, transcriptProvider, logger }),
    factCheck: createFactCheckService({ searchProvider, factCheckProvider, logger })
  };
}
