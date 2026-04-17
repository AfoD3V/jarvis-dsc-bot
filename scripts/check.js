import { loadConfig } from "../src/shared/config/env.js";

try {
  loadConfig();
  process.stdout.write("Config check passed.\n");
} catch (error) {
  process.stderr.write(`Config check failed: ${error.message}\n`);
  process.exit(1);
}
