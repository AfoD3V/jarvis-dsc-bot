import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),

  DISCORD_TOKEN: z.string().min(1, "DISCORD_TOKEN is required"),
  DISCORD_CLIENT_ID: z.string().min(1, "DISCORD_CLIENT_ID is required"),
  DISCORD_GUILD_ID: z.string().optional(),

  BOT_QUEUE_NAME: z.string().default("jarvis-jobs"),
  JOB_TIMEOUT_MS: z.coerce.number().int().positive().default(180000),

  POSTGRES_HOST: z.string().default("postgres"),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DB: z.string().default("jarvis"),
  POSTGRES_USER: z.string().default("jarvis"),
  POSTGRES_PASSWORD: z.string().min(1, "POSTGRES_PASSWORD is required"),
  POSTGRES_SSL: z.enum(["true", "false"]).default("false"),

  REDIS_HOST: z.string().default("redis"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GEMINI_MODEL: z.string().default("models/gemini-2.5-flash"),

  FACTCHECK_API_ENDPOINT: z.string().url().default("https://api.anthropic.com/v1/messages"),
  FACTCHECK_API_KEY: z.string().min(1, "FACTCHECK_API_KEY is required"),
  FACTCHECK_MODEL: z.string().default("claude-sonnet-4-20250514"),

  SEARCH_API_ENDPOINT: z.string().url().default("https://api.tavily.com/search"),
  SEARCH_API_KEY: z.string().min(1, "SEARCH_API_KEY is required"),
  SEARCH_MAX_RESULTS: z.coerce.number().int().min(1).max(10).default(5),

  BOT_HEALTH_PORT: z.coerce.number().int().positive().default(3001),
  WORKER_HEALTH_PORT: z.coerce.number().int().positive().default(3002)
});

function formatIssues(issues) {
  return issues.map((issue) => `- ${issue.path.join(".") || "env"}: ${issue.message}`).join("\n");
}

export function loadConfig() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration:\n${formatIssues(parsed.error.issues)}`);
  }

  const env = parsed.data;

  return {
    nodeEnv: env.NODE_ENV,
    logLevel: env.LOG_LEVEL,
    queue: {
      name: env.BOT_QUEUE_NAME,
      timeoutMs: env.JOB_TIMEOUT_MS
    },
    discord: {
      token: env.DISCORD_TOKEN,
      clientId: env.DISCORD_CLIENT_ID,
      guildId: env.DISCORD_GUILD_ID
    },
    postgres: {
      host: env.POSTGRES_HOST,
      port: env.POSTGRES_PORT,
      database: env.POSTGRES_DB,
      user: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
      ssl: env.POSTGRES_SSL === "true"
    },
    redis: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD
    },
    providers: {
      gemini: {
        apiKey: env.GEMINI_API_KEY,
        model: env.GEMINI_MODEL
      },
      factCheck: {
        endpoint: env.FACTCHECK_API_ENDPOINT,
        apiKey: env.FACTCHECK_API_KEY,
        model: env.FACTCHECK_MODEL
      },
      search: {
        endpoint: env.SEARCH_API_ENDPOINT,
        apiKey: env.SEARCH_API_KEY,
        maxResults: env.SEARCH_MAX_RESULTS
      }
    },
    health: {
      botPort: env.BOT_HEALTH_PORT,
      workerPort: env.WORKER_HEALTH_PORT
    }
  };
}
