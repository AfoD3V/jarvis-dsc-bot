import { Queue, QueueEvents } from "bullmq";

let queue;
let queueEvents;

export function createJobQueue({ queueName, connection }) {
  if (queue) {
    return queue;
  }

  queue = new Queue(queueName, { connection });
  return queue;
}

export function createQueueEvents({ queueName, connection }) {
  if (queueEvents) {
    return queueEvents;
  }
  queueEvents = new QueueEvents(queueName, { connection });
  return queueEvents;
}

export async function closeQueueArtifacts() {
  if (queueEvents) {
    await queueEvents.close();
    queueEvents = undefined;
  }
  if (queue) {
    await queue.close();
    queue = undefined;
  }
}

export async function enqueueCommandJob(queueRef, payload, timeoutMs) {
  return queueRef.add("command.execute", payload, {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 1000
    },
    removeOnComplete: 100,
    removeOnFail: 100,
    timeout: timeoutMs
  });
}
