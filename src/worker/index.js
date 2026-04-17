import { loadConfig } from "../shared/config/env.js";
import { createLogger } from "../shared/logging/logger.js";
import {
  createPostgresPool,
  closePostgresPool,
  markJobStarted,
  markJobCompleted,
  markJobFailed
} from "../shared/db/postgres.js";
import { createRedisConnection, closeRedisConnection } from "../shared/queue/connection.js";
import { createGeminiSummaryProvider } from "../shared/providers/llm/geminiSummaryProvider.js";
import { createFactCheckLlmProvider } from "../shared/providers/llm/factCheckLlmProvider.js";
import { createTavilySearchProvider } from "../shared/providers/search/tavilySearchProvider.js";
import { createCommandServices } from "../shared/services/commandServiceFactory.js";
import { startWorkerRuntime } from "./runtime.js";
import { createDiscordResultPoster } from "./postDiscordResult.js";

const config = loadConfig();
const logger = createLogger({ service: "worker", level: config.logLevel });
const pool = createPostgresPool(config.postgres);
const redis = createRedisConnection(config.redis);

const summaryProvider = createGeminiSummaryProvider(config.providers.gemini);
const searchProvider = createTavilySearchProvider(config.providers.search);
const factCheckProvider = createFactCheckLlmProvider(config.providers.factCheck);
const services = createCommandServices({
  summaryProvider,
  searchProvider,
  factCheckProvider,
  logger
});

const db = {
  markStarted: (id) => markJobStarted(pool, id),
  markCompleted: (id, payload) => markJobCompleted(pool, id, payload),
  markFailed: (id, error) => markJobFailed(pool, id, error)
};

const resultPoster = createDiscordResultPoster(config.discord.token);

let runtime;

async function start() {
  runtime = await startWorkerRuntime({
    config,
    logger,
    connection: redis,
    services,
    db,
    resultPoster
  });
}

async function shutdown(signal) {
  logger.info({ signal }, "shutting down worker");
  if (runtime) {
    await runtime.stop();
  }
  await closeRedisConnection();
  await closePostgresPool();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start().catch(async (error) => {
  logger.error({ error: error.message }, "worker failed to start");
  await shutdown("startup_failure");
});
