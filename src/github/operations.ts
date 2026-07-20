import { octokit } from "./client.js";
import {
  AuthenticationError,
  GitHubAPIError,
  NetworkError,
} from "../errors/index.js";
import { logger } from "../utils/logging.js";

export async function listRepositories() {
  logger.info("Fetching repositories from GitHub.");

  try {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    });

    logger.info(`Retrieved ${data.length} repositories successfully.`);

    return data.map((repo) => ({
      name: repo.name,
      description: repo.description ?? "No description",
      private: repo.private,
      url: repo.html_url,
    }));
  } catch (error: any) {
    logger.error("Failed to fetch repositories.", error);

    if (error.status === 401) {
      throw new AuthenticationError(
        "Authentication failed. Verify your GitHub Personal Access Token."
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
  logger.info(`Creating repository "${name}".`);

  try {
    const { data } = await octokit.repos.createForAuthenticatedUser({
      name,
      description,
      auto_init: true,
    });

    logger.info(`Repository "${data.name}" created successfully.`);

    return {
      name: data.name,
      description: data.description,
      private: data.private,
      url: data.html_url,
    };
  } catch (error: any) {
    logger.error(`Failed to create repository "${name}".`, error);

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
  logger.info(`Creating issue "${title}" in ${owner}/${repo}.`);

  try {
    const { data } = await octokit.issues.create({
      owner,
      repo,
      title,
      body,
    });

    logger.info(`Issue #${data.number} created successfully.`);

    return {
      number: data.number,
      title: data.title,
      url: data.html_url,
    };
  } catch (error: any) {
    logger.error(
      `Failed to create issue "${title}" in ${owner}/${repo}.`,
      error
    );

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

export async function listIssues(owner: string, repo: string) {
  logger.info(`Fetching open issues for ${owner}/${repo}.`);

  try {
    const { data } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: "open",
    });

    logger.info(`Retrieved ${data.length} open issue(s).`);

    return data.map((issue) => ({
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
    }));
  } catch (error: any) {
    logger.error(
      `Failed to fetch issues for ${owner}/${repo}.`,
      error
    );

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

export async function createCommit(
  owner: string,
  repo: string,
  path: string,
  message: string,
  content: string
) {
  logger.info(`Creating commit in ${owner}/${repo} for file "${path}".`);

  try {
    const encodedContent = Buffer.from(content).toString("base64");

    let sha: string | undefined;

    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if (!Array.isArray(data) && data.type === "file") {
        sha = data.sha;
        logger.debug(`Existing file detected. SHA: ${sha}`);
      }
    } catch (error: any) {
      if (error.status !== 404) {
        throw error;
      }

      logger.info(`File "${path}" does not exist. A new file will be created.`);
    }

    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: encodedContent,
      sha,
    });

    logger.info(`Commit ${data.commit.sha} created successfully.`);

    return {
      commitSha: data.commit.sha,
      url: data.commit.html_url,
    };
  } catch (error: any) {
    logger.error(
      `Failed to create commit in ${owner}/${repo}.`,
      error
    );

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

    if (error.status === 422) {
      throw new GitHubAPIError(
        "The commit could not be created. Verify the repository, file path, and commit information."
      );
    }

    throw new NetworkError(
      "Unable to connect to GitHub."
    );
  }
}