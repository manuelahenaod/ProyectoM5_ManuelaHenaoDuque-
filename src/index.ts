import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerListRepositories } from "./tools/github/list-repositories.js";
import { registerCreateRepository } from "./tools/github/create-repository.js";
import { registerCreateIssue } from "./tools/github/create-issue.js";
import { registerListIssues } from "./tools/github/list-issues.js";
import { registerCreateFile } from "./tools/github/create-file.js";
import { registerAddCommentToIssue } from "./tools/github/add-comment.js";
import { registerCloseIssue } from "./tools/github/close-issue.js";
import { registerCreateLabel } from "./tools/github/create-label.js";

const server = new McpServer({
  name: "github-mcp-server",
  version: "1.0.0",
});

async function main() {
  registerListRepositories(server);
  registerCreateRepository(server);
  registerCreateIssue(server);
  registerListIssues(server);
  registerCreateFile(server);
  registerAddCommentToIssue(server);
  registerCloseIssue(server);
  registerCreateLabel(server);

  await server.connect(new StdioServerTransport());

  console.error("[mcp] server running");
}

main().catch((err) => {
  console.error("[mcp] fatal:", err);
  process.exit(1);
});
