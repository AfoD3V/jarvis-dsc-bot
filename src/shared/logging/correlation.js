import crypto from "node:crypto";

export function createCorrelationId(prefix = "req") {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function createJobId() {
  return crypto.randomUUID();
}
