import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const SOURCE_UNAVAILABLE_MARKER = "JARVIS_SOURCE_UNAVAILABLE";

const detailInstructions = {
  low: "Provide a concise TL;DR with 4-6 key bullet points.",
  mid: "Provide a balanced summary with sections and 8-12 key points.",
  high: "Provide a detailed structured summary with sections, key arguments, and nuanced takeaways.",
};

function parseModelContent(content) {
  return typeof content === "string"
    ? content.trim()
    : content
        .map((part) =>
          typeof part === "string" ? part : part?.text || "",
        )
        .join("\n")
        .trim();
}

export function createGeminiSummaryProvider({ apiKey, model }) {
  const llm = new ChatGoogleGenerativeAI({
    apiKey,
    model,
    temperature: 0.2,
  });

  return {
    async summarizeFromYoutube({ youtubeUrl, detailLevel, language }) {
      const systemPrompt = [
        "You are a precise assistant that summarizes YouTube videos.",
        detailInstructions[detailLevel] || detailInstructions.mid,
        `Return response in language: ${language}.`,
        "Include: short title, bullet points, and one concluding paragraph.",
        `If you cannot access enough video content from the URL, respond with exactly: ${SOURCE_UNAVAILABLE_MARKER}`,
      ].join(" ");

      const result = await llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(`YouTube URL: ${youtubeUrl}`),
      ]);

      const summary = parseModelContent(result.content);
      if (!summary || summary.includes(SOURCE_UNAVAILABLE_MARKER)) {
        throw new Error("YOUTUBE_SOURCE_UNAVAILABLE");
      }

      return { summary };
    },
    async summarize({ transcript, detailLevel, language }) {
      const systemPrompt = [
        "You are a precise assistant that summarizes YouTube videos by reading their transcipts, you are NEVER informing that this is transcript summary - we needto  behave like you watched video",
        detailInstructions[detailLevel] || detailInstructions.mid,
        `Return response in language: ${language}.`,
        "Include: short title, bullet points, and one concluding paragraph.",
      ].join(" ");

      const result = await llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(["Transcript:", transcript].join("\n\n")),
      ]);

      const summary = parseModelContent(result.content);

      return { summary };
    },
  };
}
