import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GithubClient } from "../../clients/github/client.js";
import {
  addCommentToIssueSchema,
  AddCommentToIssueOutputSchema,
} from "../../schemas/github.js";
import { toToolError } from "./result.js";

export function registerAddCommentToIssue(server: McpServer) {
  server.registerTool(
    "add_comment_to_issue",
    {
      description: "Agrega un comentario a un issue existente en un repositorio de GitHub.",
      inputSchema: addCommentToIssueSchema.shape,
      outputSchema: AddCommentToIssueOutputSchema.shape,
    },
    async (args) => {
      const parsed = addCommentToIssueSchema.safeParse(args);

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

      const { owner, repo, number, body } = parsed.data;

      try {
        const gh = new GithubClient();
        const data = await gh.addCommentToIssue(owner, repo, number, body);

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
