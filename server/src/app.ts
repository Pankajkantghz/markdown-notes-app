import express from "express";
import { createServer } from "node:http";
import config from "./config/index.js";
import loaders from "./loaders/index.js";

async function startServer() {
  const app = express();
  const server = createServer(app);

  try {
    await loaders({ expressApp: app });
    server.listen(config.port, config.host, () => {
      console.log(`Server running at http://${config.host}:${config.port}`);
    });
  } catch (error) {
    console.error(
      "Unable to start the API. Check the database connection and server configuration.",
      error,
    );
    process.exit(1);
  }
}

void startServer();
