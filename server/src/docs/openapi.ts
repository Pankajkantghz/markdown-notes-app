import config from "../config/index.js";

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
    title: "Mireth API",
    version: "1.0.0",
    description:
      "REST API for notes, Markdown rendering, and grammar suggestions.",
  },
  servers: [{ url: "/", description: "Current server" }],
  tags: [
    { name: "Health", description: "Service status" },
    { name: "Auth", description: "Google sign-in and current user" },
    {
      name: "Notes",
      description: "Create, list, update, read, and delete notes",
    },
    { name: "Grammar", description: "Check text with Sapling" },
  ],
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        security: [],
        summary: "Check API status",
        responses: {
          "200": {
            description: "API is running",
            content: {
              "text/plain": {
                schema: { type: "string", example: "API is running." },
              },
            },
          },
        },
      },
    },
    "/health/live": {
      get: {
        tags: ["Health"],
        security: [],
        summary: "Check process liveness",
        responses: { "200": { description: "Process is running" } },
      },
    },
    "/health/ready": {
      get: {
        tags: ["Health"],
        security: [],
        summary: "Check database readiness",
        responses: {
          "200": { description: "Database is ready" },
          "503": { description: "Database or migrated schema is unavailable" },
        },
      },
    },
    "/auth/google": {
      post: {
        tags: ["Auth"],
        security: [{ requestOrigin: [] }],
        summary: "Sign in with Google Identity Services",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["credential"],
                properties: {
                  credential: {
                    type: "string",
                    description: "Google ID token credential",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Verified user profile" },
          "400": errorResponse,
          "401": errorResponse,
          "503": errorResponse,
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get the signed-in user",
        responses: {
          "200": { description: "Current user profile, or null when signed out" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        security: [{ requestOrigin: [] }],
        summary: "Revoke the current session",
        responses: {
          "204": { description: "Session revoked and cookie cleared" },
        },
      },
    },
    "/notes": {
      get: {
        tags: ["Notes"],
        summary: "List notes",
        description:
          "Returns notes ordered from newest to oldest. Limit is capped at 100.",
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 9 },
          },
        ],
        responses: {
          "200": {
            description: "Paginated notes",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["success", "data", "pagination"],
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Note" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
          "400": errorResponse,
          "429": errorResponse,
          "500": errorResponse,
        },
      },
      post: {
        tags: ["Notes"],
        summary: "Create a note",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateNote" },
            },
          },
        },
        responses: {
          "201": {
            description: "Note created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/NoteEnvelope" },
              },
            },
          },
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
        description:
          "Text is limited to 50,000 characters. Each match includes an offset, length, and up to three suggestions.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GrammarRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Grammar results",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/GrammarResult" },
                  },
                },
              },
            },
          },
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
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateNote" },
            },
          },
        },
        responses: {
          "200": {
            description: "Note updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/NoteEnvelope" },
              },
            },
          },
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
          "200": {
            description: "Note deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/NoteEnvelope" },
              },
            },
          },
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
          "200": {
            description: "Rendered note",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      allOf: [
                        { $ref: "#/components/schemas/Note" },
                        {
                          type: "object",
                          required: ["htmlContent"],
                          properties: {
                            htmlContent: {
                              type: "string",
                              description: "Sanitized rendered Markdown HTML",
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "400": errorResponse,
          "429": errorResponse,
          "404": errorResponse,
          "500": errorResponse,
        },
      },
    },
  },
  security: [{ sessionCookie: [], requestOrigin: [] }],
  components: {
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: config.production ? "__Host-mireth_session" : "mireth_session",
        description:
          "Revocable HttpOnly session cookie set by POST /auth/google.",
      },
      requestOrigin: {
        type: "apiKey",
        in: "header",
        name: "X-Mireth-Request",
        description: "Set to 1 for browser requests.",
      },
    },
    parameters: {
      NoteId: {
        in: "path",
        name: "id",
        required: true,
        schema: { type: "integer", minimum: 1 },
      },
    },
    schemas: {
      AuthUser: {
        type: "object",
        required: ["id", "email", "name"],
        properties: {
          id: { type: "integer" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          avatar: { type: "string", nullable: true },
        },
      },
      Note: {
        type: "object",
        required: ["id", "title", "content", "createdAt", "updatedAt"],
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", maxLength: 160, example: "Meeting notes" },
          content: {
            type: "string",
            maxLength: 200000,
            example: "# Notes\n\nFollow up next week.",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      NoteEnvelope: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/Note" },
        },
      },
      CreateNote: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 160 },
          content: { type: "string", maxLength: 200000, default: "" },
        },
      },
      UpdateNote: {
        type: "object",
        required: ["title", "content"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 160 },
          content: { type: "string", maxLength: 200000 },
        },
      },
      Pagination: {
        type: "object",
        required: ["currentPage", "limit", "totalNotes", "totalPages"],
        properties: {
          currentPage: { type: "integer", example: 1 },
          limit: { type: "integer", example: 9 },
          totalNotes: { type: "integer", example: 25 },
          totalPages: { type: "integer", example: 3 },
        },
      },
      GrammarRequest: {
        type: "object",
        required: ["text"],
        properties: {
          text: {
            type: "string",
            minLength: 1,
            maxLength: 50000,
            example: "She go to school every day.",
          },
        },
      },
      GrammarResult: {
        type: "object",
        required: [
          "success",
          "originalText",
          "correctedText",
          "errorsCount",
          "matches",
        ],
        properties: {
          success: { type: "boolean", example: true },
          originalText: { type: "string" },
          correctedText: { type: "string" },
          errorsCount: { type: "integer", example: 1 },
          matches: {
            type: "array",
            items: { $ref: "#/components/schemas/GrammarMatch" },
          },
        },
      },
      GrammarMatch: {
        type: "object",
        required: ["message", "offset", "length", "suggestions"],
        properties: {
          message: {
            type: "string",
            example: "Use the third-person singular form.",
          },
          offset: { type: "integer", example: 5 },
          length: { type: "integer", example: 2 },
          suggestions: {
            type: "array",
            items: { type: "string" },
            maxItems: 3,
            example: ["goes"],
          },
        },
      },
      Error: {
        type: "object",
        required: ["success", "error"],
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string", example: "Note not found" },
        },
      },
    },
  },
} as const;
