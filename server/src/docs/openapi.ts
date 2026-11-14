const errorResponse = {
  description: "Request failed",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
    },
  },
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Markdown Notes API",
    version: "1.0.0",
    description: "REST API for notes, Markdown rendering, and grammar suggestions.",
  },
  servers: [{ url: "/", description: "Current server" }],
  tags: [
    { name: "Health", description: "Service status" },
    { name: "Notes", description: "Create, list, update, read, and delete notes" },
    { name: "Grammar", description: "Check text with LanguageTool" },
  ],
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        summary: "Check API status",
        responses: {
          "200": { description: "API is running", content: { "text/plain": { schema: { type: "string", example: "API is running." } } } },
        },
      },
    },
    "/notes": {
      get: {
        tags: ["Notes"],
        summary: "List notes",
        description: "Returns notes ordered from newest to oldest. Limit is capped at 100.",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", minimum: 1, default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 100, default: 9 } },
        ],
        responses: {
          "200": {
            description: "Paginated notes",
            content: { "application/json": { schema: { type: "object", required: ["success", "data", "pagination"], properties: {
              success: { type: "boolean", example: true },
              data: { type: "array", items: { $ref: "#/components/schemas/Note" } },
              pagination: { $ref: "#/components/schemas/Pagination" },
            } } } },
          },
          "400": errorResponse,
          "429": errorResponse,
          "500": errorResponse,
        },
      },
      post: {
        tags: ["Notes"],
        summary: "Create a note",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateNote" } } } },
        responses: {
          "201": { description: "Note created", content: { "application/json": { schema: { $ref: "#/components/schemas/NoteEnvelope" } } } },
          "400": errorResponse,
          "429": errorResponse,
          "413": errorResponse,
          "500": errorResponse,
        },
      },
    },
    "/notes/grammar": {
      post: {
        tags: ["Grammar"],
        summary: "Check grammar and spelling",
        description: "Text is limited to 50,000 characters. Each match includes an offset, length, and up to three suggestions.",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/GrammarRequest" } } } },
        responses: {
          "200": { description: "Grammar results", content: { "application/json": { schema: { type: "object", properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/GrammarResult" },
          } } } } },
          "400": errorResponse,
          "429": errorResponse,
          "413": errorResponse,
          "500": errorResponse,
        },
      },
    },
    "/notes/{id}": {
      parameters: [{ $ref: "#/components/parameters/NoteId" }],
      patch: {
        tags: ["Notes"],
        summary: "Update a note",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateNote" } } } },
        responses: {
          "200": { description: "Note updated", content: { "application/json": { schema: { $ref: "#/components/schemas/NoteEnvelope" } } } },
          "400": errorResponse,
          "429": errorResponse,
          "404": errorResponse,
          "413": errorResponse,
          "500": errorResponse,
        },
      },
      delete: {
        tags: ["Notes"],
        summary: "Delete a note",
        responses: {
          "200": { description: "Note deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/NoteEnvelope" } } } },
          "400": errorResponse,
          "429": errorResponse,
          "404": errorResponse,
          "500": errorResponse,
        },
      },
    },
    "/notes/{id}/html": {
      parameters: [{ $ref: "#/components/parameters/NoteId" }],
      get: {
        tags: ["Notes"],
        summary: "Read a note with rendered Markdown",
        responses: {
          "200": { description: "Rendered note", content: { "application/json": { schema: { type: "object", properties: {
            success: { type: "boolean", example: true },
            data: { allOf: [{ $ref: "#/components/schemas/Note" }, { type: "object", required: ["htmlContent"], properties: { htmlContent: { type: "string", description: "Sanitized rendered Markdown HTML" } } }] },
          } } } } },
          "400": errorResponse,
          "429": errorResponse,
          "404": errorResponse,
          "500": errorResponse,
        },
      },
    },
  },
  components: {
    parameters: {
      NoteId: { in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } },
    },
    schemas: {
      Note: { type: "object", required: ["id", "title", "content", "createdAt", "updatedAt"], properties: {
        id: { type: "integer", example: 1 },
        title: { type: "string", maxLength: 160, example: "Meeting notes" },
        content: { type: "string", maxLength: 200000, example: "# Notes\n\nFollow up next week." },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      } },
      NoteEnvelope: { type: "object", required: ["success", "data"], properties: {
        success: { type: "boolean", example: true },
        data: { $ref: "#/components/schemas/Note" },
      } },
      CreateNote: { type: "object", required: ["title"], properties: {
        title: { type: "string", minLength: 1, maxLength: 160 },
        content: { type: "string", maxLength: 200000, default: "" },
      } },
      UpdateNote: { type: "object", required: ["title", "content"], properties: {
        title: { type: "string", minLength: 1, maxLength: 160 },
        content: { type: "string", maxLength: 200000 },
      } },
      Pagination: { type: "object", required: ["currentPage", "limit", "totalNotes", "totalPages"], properties: {
        currentPage: { type: "integer", example: 1 },
        limit: { type: "integer", example: 9 },
        totalNotes: { type: "integer", example: 25 },
        totalPages: { type: "integer", example: 3 },
      } },
      GrammarRequest: { type: "object", required: ["text"], properties: {
        text: { type: "string", minLength: 1, maxLength: 50000, example: "She go to school every day." },
      } },
      GrammarResult: { type: "object", required: ["success", "originalText", "correctedText", "errorsCount", "matches"], properties: {
        success: { type: "boolean", example: true },
        originalText: { type: "string" },
        correctedText: { type: "string" },
        errorsCount: { type: "integer", example: 1 },
        matches: { type: "array", items: { $ref: "#/components/schemas/GrammarMatch" } },
      } },
      GrammarMatch: { type: "object", required: ["message", "offset", "length", "suggestions"], properties: {
        message: { type: "string", example: "Use the third-person singular form." },
        offset: { type: "integer", example: 5 },
        length: { type: "integer", example: 2 },
        suggestions: { type: "array", items: { type: "string" }, maxItems: 3, example: ["goes"] },
      } },
      Error: { type: "object", required: ["success", "error"], properties: {
        success: { type: "boolean", example: false },
        error: { type: "string", example: "Note not found" },
      } },
    },
  },
} as const;
