import { octokit } from "./client.js";
import { GitHubAPIError, NetworkError } from "../errors/index.js";

export async function listRepositories() {
  try {
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
  } catch (error: any) {
    if (error.status === 401) {
      throw new GitHubAPIError(
        "Authentication failed. Verify your GitHub token."
      );
    }

    if (error.status === 403) {
      throw new GitHubAPIError(
        "GitHub API rate limit exceeded."
      );
    }

    throw new NetworkError(
      "Unable to connect to GitHub."
    );
  }
}