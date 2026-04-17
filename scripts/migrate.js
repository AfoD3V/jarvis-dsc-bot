import { loadConfig } from "../src/shared/config/env.js";
import { createPostgresPool, runMigrations, closePostgresPool } from "../src/shared/db/postgres.js";

async function main() {
  const config = loadConfig();
  const pool = createPostgresPool(config.postgres);
  await runMigrations(pool);
  await closePostgresPool();
  process.stdout.write("Database migrations complete.\n");
}

main().catch((error) => {
  process.stderr.write(`Migration failed: ${error.message}\n`);
  process.exit(1);
});
