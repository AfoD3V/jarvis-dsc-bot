import pino from "pino";

export function createLogger({ service, level }) {
  return pino({
    level,
    base: {
      service
    },
    messageKey: "message",
    timestamp: pino.stdTimeFunctions.isoTime
  });
}

export function childLogger(logger, context = {}) {
  return logger.child(context);
}
