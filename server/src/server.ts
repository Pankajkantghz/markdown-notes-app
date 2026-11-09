import http from "http";
import { PORT } from "./utils/confing.js";
import app from "./app.js";
import { db } from "./prisma/db.js";

const server = http.createServer(app);

async function startServer() {
  try {
    // Test the database connection using a lightweight Prisma 8 query
    await db.query(db.sql.public.Note.select("id").limit(1).build());
    console.log("postgres db is connected successfully");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }
}

startServer();