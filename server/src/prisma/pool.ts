import { Pool } from "pg";
import config from "../config/index.js";

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (error) =>
  console.error(
    JSON.stringify({ type: "database_pool_error", name: error.name }),
  ),
);
