import type { Express } from "express";
import expressLoader from "./express.js";
import postgresLoader from "./postgres.js";

export default async ({ expressApp }: { expressApp: Express }) => {
  await postgresLoader();
  console.info(JSON.stringify({ type: "database_ready" }));

  expressLoader({ app: expressApp });
  console.info(JSON.stringify({ type: "http_loader_ready" }));
};
