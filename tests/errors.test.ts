import { describe, expect, it } from "vitest";
import {
  GitHubAuthError,
  GitHubForbiddenError,
  GitHubRateLimitError,
  GitHubNotFoundError,
  GitHubValidationError,
  GitHubServerError,
  GitHubError,
  mapGitHubError,
} from "../src/clients/github/errors.js";

describe("mapGitHubError", () => {
  it("should return GitHubAuthError for status 401", () => {
    const result = mapGitHubError({ status: 401 });
    expect(result).toBeInstanceOf(GitHubAuthError);
    expect(result.status).toBe(401);
  });

  it("should return GitHubRateLimitError when rate limit remaining is 0", () => {
    const result = mapGitHubError({
      status: 403,
      response: { headers: { "x-ratelimit-remaining": "0", "x-ratelimit-reset": "9999999999" } },
    });
    expect(result).toBeInstanceOf(GitHubRateLimitError);
  });

  it("should return GitHubForbiddenError for status 403 without rate limit", () => {
    const result = mapGitHubError({
      status: 403,
      response: { headers: { "x-ratelimit-remaining": "60" } },
    });
    expect(result).toBeInstanceOf(GitHubForbiddenError);
  });

  it("should return GitHubNotFoundError for status 404", () => {
    const result = mapGitHubError({ status: 404 });
    expect(result).toBeInstanceOf(GitHubNotFoundError);
    expect(result.status).toBe(404);
  });

  it("should return GitHubValidationError for status 422", () => {
    const result = mapGitHubError({ status: 422 });
    expect(result).toBeInstanceOf(GitHubValidationError);
    expect(result.status).toBe(422);
  });

  it("should return GitHubServerError for status 500", () => {
    const result = mapGitHubError({ status: 500 });
    expect(result).toBeInstanceOf(GitHubServerError);
    expect(result.status).toBe(500);
  });

  it("should return generic GitHubError for unknown status", () => {
    const result = mapGitHubError({ status: 999, message: "Unknown" });
    expect(result).toBeInstanceOf(GitHubError);
  });
});