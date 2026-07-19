import { octokit } from "./client.js";
import {
  AuthenticationError,
  GitHubAPIError,
  NetworkError,
} from "../errors/index.js";

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

export async function createRepository(
  name: string,
  description?: string
) {
  try {
    const { data } = await octokit.repos.createForAuthenticatedUser({
      name,
      description,
      auto_init: true,
    });

    return {
      name: data.name,
      description: data.description,
      private: data.private,
      url: data.html_url,
    };
  } catch (error: any) {
    if (error.status === 401) {
      throw new AuthenticationError(
        "Authentication failed. Verify your GitHub Personal Access Token."
      );
    }

    if (error.status === 422) {
      throw new GitHubAPIError(
        `A repository named "${name}" already exists or the data is invalid.`
      );
    }

    throw new NetworkError(
      "Unable to connect to GitHub."
    );
  }
}

export async function createIssue(
  owner: string,
  repo: string,
  title: string,
  body?: string
) {
  try {
    const { data } = await octokit.issues.create({
      owner,
      repo,
      title,
      body,
    });

    return {
      number: data.number,
      title: data.title,
      url: data.html_url,
    };
  } catch (error: any) {
    if (error.status === 401) {
      throw new AuthenticationError(
        "Authentication failed. Verify your GitHub Personal Access Token."
      );
    }

    if (error.status === 404) {
      throw new GitHubAPIError(
        `The repository "${owner}/${repo}" was not found.`
      );
    }

    throw new NetworkError(
      "Unable to connect to GitHub."
    );
  }
}