import { logger } from "../utils/logging.js";
import { retry } from "../utils/retry.js";
import { handleGitHubError } from "../errors/handler.js";

export type GitHubRequestOptions = {
  resource?: string;
  validationMessage?: string;
};

export async function githubRequest<T>(
  request: () => Promise<{ data: T }>,
  options: GitHubRequestOptions = {}
): Promise<T> {
  try {
    logger.debug("Executing GitHub request...");

    const { data } = await retry(() => request());

    logger.debug("GitHub request completed successfully.");

    return data;
  } catch (error) {
    logger.error("GitHub request failed.", error);

    handleGitHubError(error, options);
  }
}