import { Worker } from "bullmq";
import { createHealthServer } from "../shared/health/server.js";
import { formatFactCheckResult, formatTldrResult } from "../shared/discord/formatters.js";

async function executeCommand({ payload, services, logger, searchMaxResults }) {
  if (payload.command === "tldr") {
    const result = await services.tldr.execute({
      youtubeUrl: payload.input.youtubeUrl,
      detailLevel: payload.input.detailLevel,
      startOffsetRaw: payload.input.startOffsetRaw,
      endOffsetRaw: payload.input.endOffsetRaw,
      correlationId: payload.correlationId
    });

    return {
      result,
      output: formatTldrResult(result)
    };
  }

  if (payload.command === "fc") {
    const result = await services.factCheck.execute({
      claim: payload.input.claim,
      correlationId: payload.correlationId,
      maxResults: searchMaxResults
    });

    return {
      result,
      output: formatFactCheckResult(result)
    };
  }

  logger.warn({ command: payload.command }, "unsupported command");
  return {
    result: {
      success: false,
      error: "UNSUPPORTED_COMMAND"
    },
    output: `Unsupported command: ${payload.command}`
  };
}

export async function startWorkerRuntime({ config, logger, connection, services, db, resultPoster }) {
  createHealthServer({
    port: config.health.workerPort,
    logger,
    label: "worker"
  });

  const worker = new Worker(
    config.queue.name,
    async (job) => {
      const payload = job.data;
      const scopedLogger = logger.child({ correlationId: payload.correlationId, command: payload.command, jobId: job.id });

      await db.markStarted(payload.id);
      scopedLogger.info("job started");

      try {
        const { result, output } = await executeCommand({
          payload,
          services,
          logger: scopedLogger,
          searchMaxResults: config.providers.search.maxResults
        });

        await resultPoster.postFollowup({
          applicationId: payload.interaction.applicationId,
          interactionToken: payload.interaction.token,
          content: output,
          command: payload.command
        });

        await db.markCompleted(payload.id, result);
        scopedLogger.info("job completed");
        return result;
      } catch (error) {
        await db.markFailed(payload.id, error.message);
        scopedLogger.error({ error: error.message }, "job failed");
        await resultPoster.postFollowup({
          applicationId: payload.interaction.applicationId,
          interactionToken: payload.interaction.token,
          content: "Wystapil blad podczas przetwarzania. Sprobuj ponownie pozniej.",
          command: payload.command
        });
        throw error;
      }
    },
    {
      connection,
      concurrency: 3
    }
  );

  worker.on("error", (error) => {
    logger.error({ error: error.message }, "worker error");
  });

  return {
    async stop() {
      await worker.close();
    }
  };
}
