import { Client, GatewayIntentBits, Events } from "discord.js";
import { createHealthServer } from "../shared/health/server.js";
import { createCorrelationId, createJobId } from "../shared/logging/correlation.js";
import { enqueueCommandJob } from "../shared/queue/jobs.js";

function jobPayloadFromInteraction(interaction, correlationId) {
  const command = interaction.commandName;
  const id = createJobId();
  if (command === "tldr") {
    return {
      id,
      correlationId,
      command,
      userId: interaction.user.id,
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      interaction: {
        token: interaction.token,
        applicationId: interaction.applicationId
      },
      input: {
        youtubeUrl: interaction.options.getString("url", true),
        detailLevel: interaction.options.getString("detail", true),
        startOffsetRaw: interaction.options.getString("start", false) || undefined,
        endOffsetRaw: interaction.options.getString("end", false) || undefined
      }
    };
  }

  return {
    id,
    correlationId,
    command,
    userId: interaction.user.id,
    channelId: interaction.channelId,
    guildId: interaction.guildId,
    interaction: {
      token: interaction.token,
      applicationId: interaction.applicationId
    },
    input: {
      claim: interaction.options.getString("claim", true)
    }
  };
}

export async function startBotRuntime({ config, logger, queue, db }) {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds]
  });

  createHealthServer({
    port: config.health.botPort,
    logger,
    label: "bot-api"
  });

  client.on(Events.ClientReady, () => {
    logger.info({ tag: client.user?.tag }, "discord client ready");
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    if (!["tldr", "fc"].includes(interaction.commandName)) {
      return;
    }

    const correlationId = createCorrelationId(interaction.commandName);
    const scopedLogger = logger.child({ correlationId, command: interaction.commandName });

    try {
      await interaction.deferReply();
      scopedLogger.info({ userId: interaction.user.id }, "interaction deferred");

      const payload = jobPayloadFromInteraction(interaction, correlationId);
      await db.createJobRecord(payload);
      const queued = await enqueueCommandJob(queue, payload, config.queue.timeoutMs);
      scopedLogger.info({ jobId: queued.id }, "job enqueued");

      await interaction.editReply("Pracuje nad tym. Opublikuje wynik, gdy tylko bedzie gotowy.");
    } catch (error) {
      scopedLogger.error({ error: error.message }, "failed to enqueue interaction");
      const message = "Wystapil blad przy uruchamianiu zapytania. Sprobuj ponownie.";
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(message).catch(() => undefined);
      } else {
        await interaction.reply({ content: message, ephemeral: true }).catch(() => undefined);
      }
    }
  });

  await client.login(config.discord.token);

  return {
    async stop() {
      await client.destroy();
    }
  };
}
