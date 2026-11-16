import type { Express } from "express";
import expressLoader from "./express.js";
import postgresLoader from "./postgres.js";

export default async ({ expressApp }: { expressApp: Express }) => {
  await postgresLoader();
  console.log("postgres db is connected successfully");

  expressLoader({ app: expressApp });
  console.log("Express loaded");
};
