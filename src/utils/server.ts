import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { listRepositoriesTool } from "../tools/list-repositories.js";
import { createRepositoryTool } from "../tools/create-repository.js";
import { repositorySchema } from "../schemas/index.js";

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

async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("🚀 GitHub MCP Server is running...");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});