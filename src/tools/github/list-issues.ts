import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GithubClient } from "../../clients/github/client.js";
import {
  listIssuesSchema,
  ListIssuesOutputSchema,
} from "../../schemas/github.js";
import { toToolError } from "./result.js";

export function registerListIssues(server: McpServer) {
  server.registerTool(
    "list_issues",
    {
      description:
        "Lista todos los issues abiertos en un repositorio de GitHub.",
      inputSchema: listIssuesSchema.shape,
      outputSchema: ListIssuesOutputSchema.shape,
    },
    async (args) => {
      const parsed = listIssuesSchema.safeParse(args);

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

      const { owner, repo } = parsed.data;

      try {
        const gh = new GithubClient();
        const data = await gh.listIssues(owner, repo);
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
