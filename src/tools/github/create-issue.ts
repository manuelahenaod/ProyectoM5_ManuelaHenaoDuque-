import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GithubClient } from "../../clients/github/client.js";
import {
  createIssueSchema,
  CreateIssueOutputSchema,
} from "../../schemas/github.js";
import { toToolError } from "./result.js";

export function registerCreateIssue(server: McpServer) {
  server.registerTool(
    "create_issue",
    {
      description: "Crea un nuevo issue en un repositorio de GitHub.",
      inputSchema: createIssueSchema.shape,
      outputSchema: CreateIssueOutputSchema.shape,
    },
    async (args) => {
      const parsed = createIssueSchema.safeParse(args);

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

      const { owner, repo, title, body } = parsed.data;

      try {
        const gh = new GithubClient();
        const data = await gh.createIssue(owner, repo, title, body);

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
