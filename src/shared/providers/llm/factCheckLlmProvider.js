import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { VERDICT } from "../../domain/types.js";

const verdicts = Object.values(VERDICT);

function isAnthropicMessagesEndpoint(endpoint) {
  try {
    const parsed = new URL(endpoint);
    return parsed.hostname.includes("anthropic.com") && parsed.pathname.includes("/v1/messages");
  } catch {
    return false;
  }
}

function parseModelContent(content) {
  if (!content) {
    return {
      verdict: VERDICT.UNKNOWN,
      confidence: 0,
      explanation: "Brak odpowiedzi modelu."
    };
  }

  const normalized = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```/i, "")
    .replace(/```$/, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(normalized);
  } catch {
    parsed = {
      verdict: VERDICT.UNKNOWN,
      confidence: 0,
      explanation: normalized
    };
  }

  const verdict = verdicts.includes(parsed.verdict) ? parsed.verdict : VERDICT.UNKNOWN;
  const confidence = Number.isFinite(parsed.confidence) ? Math.max(0, Math.min(1, parsed.confidence)) : 0;

  return {
    verdict,
    confidence,
    explanation: parsed.explanation || "Brak uzasadnienia."
  };
}

export function createFactCheckLlmProvider({ endpoint, apiKey, model }) {
  const anthropicModel = isAnthropicMessagesEndpoint(endpoint)
    ? new ChatAnthropic({
        apiKey,
        model,
        temperature: 0,
        maxTokens: 700
      })
    : null;

  const openAiCompatibleModel = anthropicModel
    ? null
    : new ChatOpenAI({
        apiKey,
        model,
        temperature: 0,
        configuration: {
          baseURL: endpoint
        }
      });

  return {
    async factCheck({ claim, language, evidence }) {
      const system = [
        "Jestes rygorystycznym asystentem fact-checkingu.",
        "Korzystaj tylko z dostarczonych zrodel. Nie wymyslaj faktow ani linkow.",
        "Jesli dowody sa sprzeczne lub slabe, zwroc UNKNOWN z niska pewnoscia.",
        `Return JSON with keys: verdict, confidence, explanation. Verdict must be one of ${verdicts.join(", ")}.`,
        `Response language: ${language}.`
      ].join(" ");

      const user = {
        claim,
        evidence
      };

      const response = await (anthropicModel || openAiCompatibleModel).invoke([
        new SystemMessage(system),
        new HumanMessage(JSON.stringify(user))
      ]);

      if (typeof response.content === "string") {
        return parseModelContent(response.content);
      }

      const content = response.content
        .map((part) => (typeof part === "string" ? part : part?.text || ""))
        .join("\n")
        .trim();

      return parseModelContent(content);
    }
  };
}
