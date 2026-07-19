import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { listRepositoriesTool } from "../tools/list-repositories.js";
import { createRepositoryTool } from "../tools/create-repository.js";
import { commitSchema, issueSchema, ListissuesSchema, repositorySchema } from "../schemas/index.js";
import { createIssueTool } from "../tools/create-issue.js";
import { listIssuesTool } from "../tools/list-issues.js";
import { createCommitTool } from "../tools/create-commit.js";

const server = new McpServer({
  name: "github-mcp-server",
  version: "1.0.0",
});

server.registerTool(
  "list_repositories",
  {
    title: "List GitHub repositories",
    description:
      "Returns all repositories belonging to the authenticated GitHub user.",
  },
  listRepositoriesTool

);

server.registerTool(
  "create_repository",
  {
    title: "Create GitHub Repository",
    description: "Creates a new repository in the authenticated GitHub account.",
    inputSchema: repositorySchema,
  },
  createRepositoryTool
);

server.registerTool(
  "create_issue",
  {
    title: "Create GitHub Issue",
    description: "Creates a new issue in a GitHub repository.",
    inputSchema: issueSchema,
  },
  createIssueTool
);

server.registerTool(
  "list_issues",
  {
    title: "List GitHub Issues",
    description: "Lists all open issues in a GitHub repository.",
    inputSchema: ListissuesSchema,
  },
  listIssuesTool
);

server.registerTool(
  "create_commit",
  {
    title: "Create GitHub Commit",
    description:
      "Creates or updates a file in a repository and generates a commit.",
    inputSchema: commitSchema,
  },
  createCommitTool
);

async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("🚀 GitHub MCP Server is running...");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});