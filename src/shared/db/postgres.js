import { Pool } from "pg";

let pool;

export function createPostgresPool(config) {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000
  });

  return pool;
}

export async function closePostgresPool() {
  if (!pool) {
    return;
  }
  await pool.end();
  pool = undefined;
}

export async function runMigrations(poolRef) {
  const client = await poolRef.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS command_jobs (
        id UUID PRIMARY KEY,
        correlation_id TEXT NOT NULL,
        command_name TEXT NOT NULL,
        user_id TEXT NOT NULL,
        channel_id TEXT,
        guild_id TEXT,
        status TEXT NOT NULL,
        input_payload JSONB NOT NULL,
        result_payload JSONB,
        error_message TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        started_at TIMESTAMPTZ,
        finished_at TIMESTAMPTZ
      );
    `);
    await client.query("CREATE INDEX IF NOT EXISTS idx_command_jobs_status ON command_jobs(status);");
    await client.query("CREATE INDEX IF NOT EXISTS idx_command_jobs_created_at ON command_jobs(created_at DESC);");
  } finally {
    client.release();
  }
}

export async function createJobRecord(poolRef, job) {
  await poolRef.query(
    `INSERT INTO command_jobs (
      id, correlation_id, command_name, user_id, channel_id, guild_id, status, input_payload
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      job.id,
      job.correlationId,
      job.command,
      job.userId,
      job.channelId,
      job.guildId,
      "queued",
      job.input
    ]
  );
}

export async function markJobStarted(poolRef, jobId) {
  await poolRef.query("UPDATE command_jobs SET status = $2, started_at = NOW() WHERE id = $1", [jobId, "processing"]);
}

export async function markJobCompleted(poolRef, jobId, payload) {
  await poolRef.query(
    "UPDATE command_jobs SET status = $2, result_payload = $3, finished_at = NOW() WHERE id = $1",
    [jobId, "completed", payload]
  );
}

export async function markJobFailed(poolRef, jobId, error) {
  await poolRef.query(
    "UPDATE command_jobs SET status = $2, error_message = $3, finished_at = NOW() WHERE id = $1",
    [jobId, "failed", error]
  );
}

export async function getJobById(poolRef, jobId) {
  const result = await poolRef.query("SELECT * FROM command_jobs WHERE id = $1", [jobId]);
  return result.rows[0] || null;
}
