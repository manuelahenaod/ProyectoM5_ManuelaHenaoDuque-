import { describe, expect, it } from "vitest";

import { handleGitHubError } from "../src/errors/handler.js";

import {
  AuthenticationError,
  GitHubAPIError,
  NetworkError,
} from "../src/errors/index.js";

describe("handleGitHubError", () => {
    it("should throw AuthenticationError for status 401", () => {
  expect(() =>
    handleGitHubError(
      { status: 401 },
      {}
    )
  ).toThrow(AuthenticationError);
});

   it("should throw GitHubAPIError for status 403", () => {
  expect(() =>
    handleGitHubError(
      { status: 403 },
      {}
    )
  ).toThrow(GitHubAPIError);
});

    it("should throw GitHubAPIError for status 403", () => {
  expect(() =>
    handleGitHubError(
      { status: 403 },
      {}
    )
  ).toThrow(GitHubAPIError);
});

    it("should include the resource name for status 404", () => {
  expect(() =>
    handleGitHubError(
      { status: 404 },
      {
        resource: "manuela/project",
      }
    )
  ).toThrow(
    'The resource "manuela/project" was not found.'
  );
});

    it("should use the custom validation message", () => {
  expect(() =>
    handleGitHubError(
      { status: 422 },
      {
        validationMessage:
          "Repository already exists.",
      }
    )
  ).toThrow(
    "Repository already exists."
  );
});

    it("should throw NetworkError for unknown errors", () => {
  expect(() =>
    handleGitHubError(
      { status: 999 },
      {}
    )
  ).toThrow(NetworkError);
});
});