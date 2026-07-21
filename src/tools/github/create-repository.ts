import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GithubClient } from "../../clients/github/client.js";
import {
  createRepositorySchema,
  CreateRepositoryOutputSchema,
} from "../../schemas/github.js";
import { toToolError } from "./result.js";

export function registerCreateRepository(server: McpServer) {
  server.registerTool(
    "create_repository",
    {
      description: "Crea un nuevo repositorio en la cuenta autenticada de GitHub.",
      inputSchema: createRepositorySchema.shape,
      outputSchema: CreateRepositoryOutputSchema.shape,
    },
    async (args) => {
      const parsed = createRepositorySchema.safeParse(args);

      if (!parsed.success) {
        const messages = parsed.error.issues.map((e) => e.message).join("; ");
        const body = {
          ok: false,
          error: { type: "VALIDATION", message: messages },
        };
        return {
          content: [{ type: "text", text: JSON.stringify(body) }],
          isError: true,
        };
      }

      const { name, description, private: isPrivate } = parsed.data;

      try {
        const gh = new GithubClient();
        const data = await gh.createRepository(name, description, isPrivate);

        const result = { ok: true, data };
        return {
          structuredContent: result,
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (err) {
        const body = toToolError(err);
        return {
          content: [{ type: "text", text: JSON.stringify(body) }],
          isError: true,
        };
      }
    },
  );
}
