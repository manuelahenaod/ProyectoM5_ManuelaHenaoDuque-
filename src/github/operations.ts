import { octokit } from "./client.js";
import { logger } from "../utils/logging.js";
import { githubRequest } from "./request.js";

export async function listRepositories() {
  logger.info("Fetching repositories from GitHub.");

  const data = await githubRequest(() =>
    octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    })
  );

  logger.info(`Retrieved ${data.length} repositories.`);

  return data.map((repo) => ({
    name: repo.name,
    description: repo.description ?? "No description",
    private: repo.private,
    url: repo.html_url,
  }));
}

export async function createRepository(
  name: string,
  description?: string
) {
  logger.info(`Creating repository "${name}".`);

  const data = await githubRequest(
    () =>
      octokit.repos.createForAuthenticatedUser({
        name,
        description,
        auto_init: true,
      }),
    {
      validationMessage: `A repository named "${name}" already exists or the data is invalid.`,
    }
  );

  logger.info(`Repository "${data.name}" created successfully.`);

  return {
    name: data.name,
    description: data.description,
    private: data.private,
    url: data.html_url,
  };
}

export async function createIssue(
  owner: string,
  repo: string,
  title: string,
  body?: string
) {
  logger.info(`Creating issue "${title}" in ${owner}/${repo}.`);

  const data = await githubRequest(
    () =>
      octokit.issues.create({
        owner,
        repo,
        title,
        body,
      }),
    {
      resource: `${owner}/${repo}`,
    }
  );

  logger.info(`Issue #${data.number} created successfully.`);

  return {
    number: data.number,
    title: data.title,
    url: data.html_url,
  };
}

export async function listIssues(owner: string, repo: string) {
  logger.info(`Fetching open issues for ${owner}/${repo}.`);

  const data = await githubRequest(
    () =>
      octokit.issues.listForRepo({
        owner,
        repo,
        state: "open",
      }),
    {
      resource: `${owner}/${repo}`,
    }
  );

  logger.info(`Retrieved ${data.length} open issue(s).`);

  return data.map((issue) => ({
    number: issue.number,
    title: issue.title,
    url: issue.html_url,
  }));
}

export async function createCommit(
  owner: string,
  repo: string,
  path: string,
  message: string,
  content: string
) {
  logger.info(
    `Creating commit in ${owner}/${repo} for file "${path}".`
  );

  const encodedContent = Buffer.from(content).toString("base64");

  let sha: string | undefined;

  try {
    const file = await githubRequest(() =>
      octokit.repos.getContent({
        owner,
        repo,
        path,
      })
    );

    if (!Array.isArray(file) && file.type === "file") {
      sha = file.sha;
      logger.debug(`Existing file detected. SHA: ${sha}`);
    }
  } catch {
    logger.info(
      `File "${path}" does not exist. A new file will be created.`
    );
  }

  const data = await githubRequest(
    () =>
      octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: encodedContent,
        sha,
      }),
    {
      resource: `${owner}/${repo}`,
      validationMessage:
        "The commit could not be created. Verify the repository, file path, and commit information.",
    }
  );

  logger.info(`Commit ${data.commit.sha} created successfully.`);

  return {
    commitSha: data.commit.sha,
    url: data.commit.html_url,
  };
}