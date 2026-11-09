import http from "http";
import { HOST, PORT } from "./utils/config.js";
import app from "./app.js";
import { db } from "./prisma/db.js";

const server = http.createServer(app);

async function startServer() {
  try {
    await db.query(db.sql.public.Note.select("id").limit(1).build());
    console.log("postgres db is connected successfully");

    server.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
    });
  } catch {
    console.error(
      "Unable to start the API. Check the database connection and server configuration.",
    );
    process.exit(1);
  }
}

startServer();
