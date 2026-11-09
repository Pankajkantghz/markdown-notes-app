console.log("1. Starting seed script...");
import { db } from "./db";

const sampleNotes = [
  {
    title: "Introduction to TypeScript",
    content: "# TypeScript\nTypeScript is JavaScript with syntax for types.",
  },
  {
    title: "Express Routing Guide",
    content:
      "# Express.js\nLearn how to structure routes using controllers and services.",
  },
  {
    title: "Prisma 8 RC Overview",
    content:
      "# Prisma 8\nContract-first database modeling and schema management.",
  },
  {
    title: "Markdown Syntax Cheat Sheet",
    content: "# Markdown\n- Headers\n- Lists\n- **Bold text**",
  },
  {
    title: "Dockerizing PostgreSQL",
    content: "# Docker\nRunning PostgreSQL containers locally for development.",
  },
  {
    title: "Clean Code Principles",
    content: "# Clean Code\nWrite code that is readable and maintainable.",
  },
  {
    title: "Async/Await Best Practices",
    content:
      "# Asynchronous JavaScript\nAlways handle errors gracefully using try/catch blocks.",
  },
  {
    title: "RESTful API Design",
    content:
      "# REST APIs\nUse standard HTTP methods like GET, POST, PUT, and DELETE.",
  },
  {
    title: "Environment Variables in Node",
    content: "# Dotenv\nKeep your secrets safe using `.env` files.",
  },
  {
    title: "Pagination Strategies",
    content:
      "# Pagination\nUse `skip` and `take` to limit database payload sizes.",
  },
];

async function seed() {
  try {
    console.log("Seeding database");

    for (const note of sampleNotes) {
      await db.orm.public.Note.create({
        title: note.title,
        content: note.content,
      });
    }
    console.log(`Successfully seeded ${sampleNotes.length} notes!`);
    process.exit(0);
  } catch (error) {
    console.log(`Successfully seeded ${sampleNotes.length} notes!`);
    process.exit(0);
  }
}
seed();