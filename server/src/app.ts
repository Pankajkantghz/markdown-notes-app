import express from "express";
import { createServer } from "node:http";
import config from "./config/index.js";
import loaders from "./loaders/index.js";
import { db } from "./prisma/db.js";
import { pool } from "./prisma/pool.js";

async function startServer() {
  const app = express();
  const server = createServer(app);
  server.requestTimeout = 30_000;
  server.headersTimeout = 10_000;
  server.keepAliveTimeout = 5_000;

  try {
    await loaders({ expressApp: app });
    server.listen(config.port, config.host, () => {
      console.info(
        JSON.stringify({
          type: "server_started",
          host: config.host,
          port: config.port,
          environment: process.env.NODE_ENV,
        }),
      );
    });
  } catch (error) {
    console.error(
      "Unable to start the API. Check the database connection and server configuration.",
      error,
    );
    process.exit(1);
  }

  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.info(JSON.stringify({ type: "server_stopping", signal }));
    const timeout = setTimeout(() => process.exit(1), 10_000);
    timeout.unref();
    server.close(async (error) => {
      try {
        await Promise.all([db.close(), pool.end()]);
        clearTimeout(timeout);
        if (error) throw error;
        process.exit(0);
      } catch (closeError) {
        console.error("Server shutdown failed", closeError);
        process.exit(1);
      }
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

void startServer();
