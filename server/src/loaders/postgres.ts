import { db } from "../prisma/db.js";

const postgresLoader = async () => {
  await db.query(db.sql.public.Note.select("id").limit(1).build());
};

export default postgresLoader;
