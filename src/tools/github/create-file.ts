import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GithubClient } from "../../clients/github/client.js";
import {
  createFileSchema,
  CreateFileOutputSchema,
} from "../../schemas/github.js";
import { toToolError } from "./result.js";

export function registerCreateFile(server: McpServer) {
  server.registerTool(
    "create_file",
    {
      description:
        "Crea o reemplaza un archivo en un repositorio de GitHub realizando un commit a la rama especificada. Usa la Git API de bajo nivel (blob → tree → commit → ref update). Utilizá esta herramienta para crear, actualizar o escribir archivos en un repositorio.",
      inputSchema: createFileSchema.shape,
      outputSchema: CreateFileOutputSchema.shape,
    },
    async (args) => {
      const parsed = createFileSchema.safeParse(args);

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

      const { owner, repo, path, content, message, branch } = parsed.data;
      const gh = new GithubClient();

      try {
        const data = await gh.createFile(
          owner,
          repo,
          path,
          content,
          message,
          branch,
        );

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
