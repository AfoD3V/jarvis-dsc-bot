import { REST, Routes } from "discord.js";

const DISCORD_CONTENT_LIMIT = 2000;
const DISCORD_EMBED_DESCRIPTION_LIMIT = 4096;

function truncateWithEllipsis(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(maxLength - 1, 1)).trimEnd()}…`;
}

export function buildFollowupBody({ content, command }) {
  const normalized = (content ?? "").trim();
  if (!normalized) {
    return {
      content: "Request completed, but no response content was generated."
    };
  }

  if (normalized.length <= DISCORD_CONTENT_LIMIT) {
    return { content: normalized };
  }

  const title = command === "tldr" ? "TL;DR" : command === "fc" ? "Fact Check" : "Result";

  return {
    embeds: [
      {
        title,
        description: truncateWithEllipsis(normalized, DISCORD_EMBED_DESCRIPTION_LIMIT),
        color: command === "fc" ? 0x2563eb : 0x0f766e
      }
    ]
  };
}

export function createDiscordResultPoster(token) {
  const rest = new REST({ version: "10" }).setToken(token);

  return {
    async postFollowup({ applicationId, interactionToken, content, command }) {
      const body = buildFollowupBody({ content, command });
      await rest.post(Routes.webhook(applicationId, interactionToken), { body });
    }
  };
}
