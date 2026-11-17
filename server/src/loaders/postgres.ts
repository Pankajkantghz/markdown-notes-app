import { db } from "../prisma/db.js";
import { pool } from "../prisma/pool.js";

const postgresLoader = async () => {
  await db.query(db.sql.public.Note.select("id").limit(1).build());
  await pool.query('SELECT 1 FROM "Session" LIMIT 0');
  await pool.query('SELECT 1 FROM "RateLimitCounter" LIMIT 0');
};

export default postgresLoader;
