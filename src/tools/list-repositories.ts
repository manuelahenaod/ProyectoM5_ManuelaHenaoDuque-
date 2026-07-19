import { listRepositories } from "../github/operations.js";

export async function listRepositoriesTool() {
  const repositories = await listRepositories();

  if (repositories.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: "No repositories were found for the authenticated user.",
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(repositories, null, 2),
      },
    ],
  };
}