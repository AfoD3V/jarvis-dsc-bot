import { loadConfig } from "../src/shared/config/env.js";
import { createLogger } from "../src/shared/logging/logger.js";
import { syncSlashCommands } from "../src/shared/discord/commands.js";

async function main() {
  const config = loadConfig();
  const logger = createLogger({ service: "commands-sync", level: config.logLevel });

  await syncSlashCommands({
    token: config.discord.token,
    clientId: config.discord.clientId,
    guildId: config.discord.guildId,
    logger
  });
}

main().catch((error) => {
  process.stderr.write(`Command sync failed: ${error.message}\n`);
  process.exit(1);
});
