import {
  AuthenticationError,
  GitHubAPIError,
  NetworkError,
} from "./index.js";

type ErrorContext = {
  resource?: string;
  action?: string;
  validationMessage?: string;
};

export function handleGitHubError(
  error: any,
  context: ErrorContext = {}
): never {
  switch (error.status) {
    case 401:
      throw new AuthenticationError(
        "Authentication failed. Verify your GitHub Personal Access Token."
      );

    case 403:
      throw new GitHubAPIError(
        "GitHub API rate limit exceeded. Please try again later."
      );

    case 404:
      throw new GitHubAPIError(
        context.resource
          ? `The resource "${context.resource}" was not found.`
          : "The requested resource was not found."
      );

    case 422:
      throw new GitHubAPIError(
        context.validationMessage ??
          "The request could not be processed because the provided data is invalid."
      );

    default:
      throw new NetworkError(
        "Unable to connect to GitHub."
      );
  }
}