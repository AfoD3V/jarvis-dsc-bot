import http from "node:http";

export function createHealthServer({ port, logger, label }) {
  const server = http.createServer((request, response) => {
    if (request.url !== "/healthz") {
      response.statusCode = 404;
      response.end("not found");
      return;
    }

    response.statusCode = 200;
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({ status: "ok", service: label }));
  });

  server.listen(port, () => {
    logger.info({ port }, "health server listening");
  });

  return server;
}
