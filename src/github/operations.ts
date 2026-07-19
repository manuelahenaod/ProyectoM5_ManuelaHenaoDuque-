import { octokit } from "./client.js";

/**
 * Obtiene los repositorios del usuario autenticado.
 */
export async function listRepositories() {
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 100,
  });

  return data.map((repo) => ({
    name: repo.name,
    description: repo.description ?? "No description",
    private: repo.private,
    url: repo.html_url,
  }));
}