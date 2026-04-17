import { jsonRequest } from "../http.js";

export function createTavilySearchProvider({ endpoint, apiKey, maxResults }) {
  return {
    async search({ query }) {
      const payload = await jsonRequest(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          query,
          max_results: maxResults,
          include_answer: false
        })
      });

      const results = Array.isArray(payload.results) ? payload.results : [];
      return results.map((item) => ({
        title: item.title || "Untitled",
        url: item.url,
        snippet: item.content || ""
      }));
    }
  };
}
