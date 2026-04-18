/**
 * @typedef {Object} SummaryProvider
 * @property {(input: { youtubeUrl: string, detailLevel: string, language: string, correlationId: string, startOffset?: string, endOffset?: string }) => Promise<{ summary: string }>} summarizeFromYoutube
 * @property {(input: { transcript: string, detailLevel: string, language: string, correlationId: string }) => Promise<{ summary: string }>} summarize
 */

/**
 * @typedef {Object} TranscriptProvider
 * @property {(youtubeUrl: string) => Promise<string>} getTranscript
 */

/**
 * @typedef {Object} SearchProvider
 * @property {(input: { query: string, maxResults: number, correlationId: string }) => Promise<Array<{ title: string, url: string, snippet: string }>>} search
 */

/**
 * @typedef {Object} FactCheckProvider
 * @property {(input: { claim: string, language: string, evidence: Array<{ title: string, url: string, snippet: string }>, correlationId: string }) => Promise<{ verdict: string, confidence: number, explanation: string }>} factCheck
 */

export function assertProvider(name, provider, methods) {
  for (const method of methods) {
    if (!provider || typeof provider[method] !== "function") {
      throw new Error(`${name} provider missing required method: ${method}`);
    }
  }
}
