import IORedis from "ioredis";

let redis;

export function createRedisConnection(config) {
  if (redis) {
    return redis;
  }

  redis = new IORedis({
    host: config.host,
    port: config.port,
    password: config.password,
    maxRetriesPerRequest: null,
    enableReadyCheck: true
  });

  return redis;
}

export async function closeRedisConnection() {
  if (!redis) {
    return;
  }
  await redis.quit();
  redis = undefined;
}
