import { listRepositories } from "../github/operations.js";

export async function listRepositoriesTool() {
  const repositories = await listRepositories();

  if (repositories.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: "No repositories were found.",
        },
      ],
    };
  }

  const response = repositories
    .map(
      (repo) => `
        ${repo.name}
        Description: ${repo.description}
        Private: ${repo.private ? "Yes" : "No"}
        URL: ${repo.url}
        `
    )
    .join("\n");

  return {
    content: [
      {
        type: "text" as const,
        text: response,
      },
    ],
  };
}