import { assertProvider } from "../domain/contracts.js";
import { createTldrService } from "./tldrService.js";
import { createFactCheckService } from "./factCheckService.js";

export function createCommandServices({ summaryProvider, searchProvider, factCheckProvider, logger }) {
  assertProvider("summary", summaryProvider, ["summarizeFromYoutube"]);
  assertProvider("search", searchProvider, ["search"]);
  assertProvider("fact-check", factCheckProvider, ["factCheck"]);

  return {
    tldr: createTldrService({ summaryProvider, logger }),
    factCheck: createFactCheckService({ searchProvider, factCheckProvider, logger })
  };
}
