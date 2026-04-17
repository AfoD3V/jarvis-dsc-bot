import { loadConfig } from "../shared/config/env.js";
import { createLogger } from "../shared/logging/logger.js";
import { createPostgresPool, createJobRecord, closePostgresPool } from "../shared/db/postgres.js";
import { createRedisConnection, closeRedisConnection } from "../shared/queue/connection.js";
import { createJobQueue, closeQueueArtifacts } from "../shared/queue/jobs.js";
import { startBotRuntime } from "./runtime.js";

const config = loadConfig();
const logger = createLogger({ service: "bot-api", level: config.logLevel });
const pool = createPostgresPool(config.postgres);
const redis = createRedisConnection(config.redis);
const queue = createJobQueue({ queueName: config.queue.name, connection: redis });

const db = {
  createJobRecord: (job) => createJobRecord(pool, job)
};

let runtime;

async function start() {
  runtime = await startBotRuntime({
    config,
    logger,
    queue,
    db
  });
}

async function shutdown(signal) {
  logger.info({ signal }, "shutting down bot-api");
  if (runtime) {
    await runtime.stop();
  }
  await closeQueueArtifacts();
  await closeRedisConnection();
  await closePostgresPool();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start().catch(async (error) => {
  logger.error({ error: error.message }, "bot-api failed to start");
  await shutdown("startup_failure");
});
