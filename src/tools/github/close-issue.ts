import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GithubClient } from "../../clients/github/client.js";
import {
  closeIssueSchema,
  CloseIssueOutputSchema,
} from "../../schemas/github.js";
import { toToolError } from "./result.js";

export function registerCloseIssue(server: McpServer) {
  server.registerTool(
    "close_issue",
    {
      description: "Cierra un issue específico en un repositorio de GitHub.",
      inputSchema: closeIssueSchema.shape,
      outputSchema: CloseIssueOutputSchema.shape,
    },
    async (args) => {
      const parsed = closeIssueSchema.safeParse(args);

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

      const { owner, repo, number } = parsed.data;

      try {
        const gh = new GithubClient();
        const data = await gh.closeIssue(owner, repo, number);

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
