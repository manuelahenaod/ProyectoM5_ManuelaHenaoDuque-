import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GithubClient } from "../../clients/github/client.js";
import {
  createLabelSchema,
  CreateLabelOutputSchema,
} from "../../schemas/github.js";
import { toToolError } from "./result.js";

export function registerCreateLabel(server: McpServer) {
  server.registerTool(
    "create_label",
    {
      description: "Crea una etiqueta (label) personalizada en un repositorio de GitHub.",
      inputSchema: createLabelSchema.shape,
      outputSchema: CreateLabelOutputSchema.shape,
    },
    async (args) => {
      const parsed = createLabelSchema.safeParse(args);

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

      const { owner, repo, name, color, description } = parsed.data;

      try {
        const gh = new GithubClient();
        const data = await gh.createLabel(owner, repo, name, color, description);

        const result = { ok: true, data };
        return {
          structuredContent: result,
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (err) {
        const toolError = toToolError(err);
        return {
          content: [{ type: "text", text: JSON.stringify(toolError) }],
          isError: true,
        };
      }
    },
  );
}
