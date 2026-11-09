
console.log("1. Starting seed script...");

import { db } from "./db";

const sampleNotes = [
  {
    title: "Introduction to TypeScript",
    content: `
# Introduction to TypeScript

TypeScript is a programming language build on top of JavaScript.

## Features

- Static type checking
- Interfaces and types
- Generics
- Better IDE support

### Example

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}

const user: User = {
  id: 1,
  name: "Pankaj",
  email: "pankaj@example.com"
};

console.log(greet(user));
\`\`\`

TypeScript helps developers write more reliable applications.
`,
  },
  {
    title: "Express Routing Guide",
    content: `
# Express.js Routing Guide

Express.js is a minimal and flexible Node.js web application framework.

## HTTP Methods

| Method | Purpose |
|--------|---------|
| GET | Retrieve data |
| POST | Create data |
| PUT | Replace data |
| PATCH | Update data |
| DELETE | Remove data |

## Example

\`\`\`typescript
import express from "express";

const app = express();

app.use(express.json());

app.get("/notes", (req, res) => {
  res.json({ message: "All notes" });
});

app.post("/notes", (req, res) => {
  res.status(201).json(req.body);
});

app.listen(3000);
\`\`\`

> Keep your routes clean and move business logic into services.
`,
  },
  {
    title: "Prisma 8 RC Overview",
    content: `
# Prisma 8 Overview

Prisma is an ORM that helps developers interact with databases using TypeScript.

## Benefits

- Type-safe database queries
- Database migrations
- Schema management
- Developer-friendly API

## Note Model

\`\`\`prisma
model Note {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
\`\`\`

Prisma makes database operations easier and more predictable.
`,
  },
  {
    title: "Markdown Syntax Cheat Sheet",
    content: `
# Markdown Syntax Cheat Sheet

## Text Formatting

**Bold text**

*Italic text*

~~Strikethrough text~~

## Lists

### Unordered

- JavaScript
- TypeScript
- Node.js

### Ordered

1. Learn JavaScript
2. Learn TypeScript
3. Build projects

## Links

[Visit GitHub](https://github.com)

## Blockquotes

> Learning never stops.

## Horizontal Rule

---

## Inline Code

Use \`console.log()\` to print output.

## Code Block

\`\`\`javascript
console.log("Hello Markdown!");
\`\`\`
`,
  },
  {
    title: "Dockerizing PostgreSQL",
    content: `
# Dockerizing PostgreSQL

Docker allows developers to run PostgreSQL without installing it directly on their machines.

## Start PostgreSQL

\`\`\`bash
docker run -d \\
  --name markdown-notes-db \\
  -e POSTGRES_USER=pankaj \\
  -e POSTGRES_PASSWORD="\${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD first}" \\
  -e POSTGRES_DB=markdown_notes \\
  -p 5432:5432 \\
  -v markdown_notes_data:/var/lib/postgresql/data \\
  postgres:16
\`\`\`

## Useful Commands

| Command | Description |
|---------|-------------|
| docker ps | List running containers |
| docker stop | Stop a container |
| docker start | Start a container |
| docker logs | View container logs |

PostgreSQL is a powerful relational database.
`,
  },
  {
    title: "Clean Code Principles",
    content: `
# Clean Code Principles

Clean code is easy to read, understand, test, and maintain.

## Important Principles

1. Use meaningful variable names.
2. Keep functions small.
3. Avoid unnecessary complexity.
4. Handle errors properly.
5. Follow consistent formatting.

## Example

Bad:

\`\`\`javascript
function x(a, b) {
  return a + b;
}
\`\`\`

Better:

\`\`\`javascript
function calculateTotal(price, tax) {
  return price + tax;
}
\`\`\`

> Code is read much more often than it is written.
`,
  },
  {
    title: "Async Await Best Practices",
    content: `
# Async/Await Best Practices

JavaScript supports asynchronous programming using Promises and async/await.

## Example

\`\`\`typescript
async function fetchUser() {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/users/1"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error("Something went wrong:", error);
    throw error;
  }
}
\`\`\`

## Important Points

- Always handle rejected promises.
- Avoid unnecessary sequential requests.
- Use Promise.all for independent operations.
- Handle loading and error states.

Asynchronous code should be predictable and easy to debug.
`,
  },
  {
    title: "RESTful API Design",
    content: `
# RESTful API Design

REST is an architectural style for designing network applications.

## Example Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /notes | Create a note |
| GET | /notes | Get all notes |
| GET | /notes/:id | Get one note |
| PATCH | /notes/:id | Update a note |
| DELETE | /notes/:id | Delete a note |
| POST | /notes/:id/html | Render HTML |

## HTTP Status Codes

- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

A good API should be consistent, predictable, and well documented.
`,
  },
  {
    title: "Environment Variables in Node.js",
    content: `
# Environment Variables in Node.js

Environment variables help keep configuration separate from application code.

## Example .env

\`\`\`env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
NODE_ENV=development
\`\`\`

## Loading Environment Variables

\`\`\`typescript
import "dotenv/config";

const port = process.env.PORT || 3000;

console.log(\`Server running on port \${port}\`);
\`\`\`

> Never commit your real credentials or secrets to GitHub.

Add your .env file to .gitignore.
`,
  },
  {
    title: "Complete Markdown and Grammar Testing Guide",
    content: `
# Complete Markdown and Grammar Testing Guide

Welcome to my **Markdown Notes Application**!

This document is designed to test Markdown parsing, HTML rendering, note saving, and grammar checking.

## 1. Introduction

Markdown is a lightweight markup language that allow users to format plain text.

It was created to make writing easier and more readable.

With Markdown, you can create:

- Headings
- Paragraphs
- Lists
- Tables
- Links
- Images
- Code blocks
- Blockquotes

You can also combine different formatting styles.

## 2. Text Formatting

This is a **bold text** example.

This is an *italic text* example.

This is a ~~strikethrough text~~ example.

This is a ***bold and italic text*** example.

You can also write \`inline code\` inside a paragraph.

Here is some normal text with **important information** and *additional emphasis*.

## 3. Headings

# Heading Level 1

## Heading Level 2

### Heading Level 3

#### Heading Level 4

##### Heading Level 5

###### Heading Level 6

## 4. Lists

### Unordered List

- JavaScript
- TypeScript
- Node.js
- Express.js
- PostgreSQL
- Prisma

### Nested Unordered List

- Frontend
  - React
  - Tailwind CSS
  - TypeScript
- Backend
  - Node.js
  - Express.js
  - PostgreSQL

### Ordered List

1. Install Node.js.
2. Create a project.
3. Install dependencies.
4. Configure the database.
5. Build the API.
6. Test the application.

### Task List

- [x] Initialize the project
- [x] Configure PostgreSQL
- [x] Set up Prisma
- [ ] Implement note creation
- [ ] Implement grammar checking
- [ ] Implement Markdown preview
- [ ] Write unit tests

## 5. Links

Visit [GitHub](https://github.com).

Learn more about [Markdown](https://www.markdownguide.org/).

You can also use an automatic link: https://www.typescriptlang.org/

## 6. Blockquotes

> Great software is built through consistency, patience, and continuous learning.

> Programming is not just about writing code.
>
> It is about solving problems and creating something useful.

## 7. Code Blocks

### JavaScript

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Pankaj"));
\`\`\`

### TypeScript

\`\`\`typescript
interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
}

function createNote(note: Note): void {
  console.log("Note created:", note.title);
}
\`\`\`

### SQL

\`\`\`sql
SELECT id, title, content
FROM "Note"
ORDER BY "createdAt" DESC;
\`\`\`

### Bash

\`\`\`bash
docker ps
docker logs markdown-notes-db
pnpm exec prisma studio
\`\`\`

## 8. Tables

| Technology | Purpose | Status |
|:-----------|:--------|:------:|
| React | Frontend | Complete |
| Node.js | Backend | Complete |
| Express | API Framework | Complete |
| PostgreSQL | Database | Complete |
| Prisma | ORM | In Progress |
| LanguageTool | Grammar Checking | In Progress |

### Feature Comparison

| Feature | Description | Priority |
|---------|-------------|----------|
| Create Note | Save Markdown notes | High |
| Edit Note | Update existing notes | High |
| Delete Note | Remove unwanted notes | Medium |
| Grammar Check | Find grammatical errors | High |
| HTML Preview | Render Markdown as HTML | High |
| Search | Find notes quickly | Medium |

## 9. Horizontal Rules

This is the first section.

---

This is the second section.

***

This is the third section.

## 10. Images

Markdown supports images using this syntax:

![A beautiful landscape](https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800)

## 11. Nested Blockquotes

> Software Development
>
> > Backend Development
> >
> > > Database Design and API Architecture

## 12. Escaping Special Characters

You can display special Markdown characters using backslashes:

\\* This should not be italic \\*

\\# This should not be a heading

\\- This should not be a list item

## 13. Mathematical Expressions

Inline mathematics: $E = mc^2$

A simple equation:

$$
a^2 + b^2 = c^2
$$

## 14. Grammar Testing

The following sentences intentionally contain grammatical mistakes.

1. She go to the university every morning.
2. They was working on a new application.
3. He don't know how to configure PostgreSQL.
4. I has completed the backend implementation.
5. The developers is writing a new feature.
6. We was testing the API yesterday.
7. This application have many useful features.
8. Every student have their own assignment.
9. The database are connected successfully.
10. I didn't knew about this error.

### Corrected Sentences

1. She goes to the university every morning.
2. They were working on a new application.
3. He doesn't know how to configure PostgreSQL.
4. I have completed the backend implementation.
5. The developers are writing a new feature.
6. We were testing the API yesterday.
7. This application has many useful features.
8. Every student has their own assignment.
9. The database is connected successfully.
10. I didn't know about this error.

## 15. Backend Architecture

A typical Node.js backend application can follow this structure:

\`\`\`text
server/
├── src/
│   ├── controllers/
│   │   └── note.controller.ts
│   ├── services/
│   │   └── note.service.ts
│   ├── routes/
│   │   └── note.routes.ts
│   ├── lib/
│   │   └── prisma.ts
│   └── app.ts
├── prisma/
├── package.json
└── tsconfig.json
\`\`\`

The controller handles HTTP requests, the service contains business logic, and the database layer handles persistence.

## 16. Conclusion

Building a Markdown Notes application is a great way to understand full-stack development.

The application combines several important concepts:

- REST API development
- Database management
- Markdown parsing
- HTML rendering
- External API integration
- Error handling
- TypeScript development

**Keep building. Keep learning. Keep improving.**

> The best way to learn programming is to build real projects.
`,
  },
];

async function seed() {
  console.log("2. Seeding database...");

  try {
    for (const note of sampleNotes) {
      await db.orm.public.Note.create({
        title: note.title,
        content: note.content,
      });

      console.log(`Created note: ${note.title}`);
    }

    console.log(
      `Successfully seeded ${sampleNotes.length} notes!`
    );
  } catch {
    console.error("Seeding failed. Check the database connection and sample note data.");
    process.exitCode = 1;
  }
}

seed();
