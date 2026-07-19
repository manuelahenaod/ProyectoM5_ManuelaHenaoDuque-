import { createRepository } from "../github/operations.js";
import { formatGitHubError } from "../errors/index.js";

type CreateRepositoryArgs = {
  name: string;
  description?: string;
};

export async function createRepositoryTool(args: CreateRepositoryArgs) {
  try {
    const repository = await createRepository(
      args.name,
      args.description
    );

    return {
      content: [
        {
          type: "text" as const,
          text:
            `✅ Repository "${repository.name}" created successfully!\n\n` +
            `Description: ${repository.description ?? "No description"}\n` +
            `URL: ${repository.url}`,
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: formatGitHubError(error),
        },
      ],
    };
  }
}