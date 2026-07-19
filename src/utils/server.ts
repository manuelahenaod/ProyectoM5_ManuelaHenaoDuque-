import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { listRepositoriesTool } from "../tools/list-repositories.js";

const server = new McpServer({
  name: "github-mcp-server",
  version: "1.0.0",
});

server.registerTool(
  "list_repositories",
  {
    title: "List GitHub repositories",
    description: "Lists all repositories for the authenticated GitHub user."
  },
  listRepositoriesTool
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