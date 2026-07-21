import { beforeEach, describe, expect, it, vi } from "vitest";
import { githubRequest } from "../src/clients/github/request.js";
import {
  GitHubRateLimitError,
  GitHubServerError,
  mapGitHubError,
} from "../src/clients/github/errors.js";

// Mock mapGitHubError para controlar los errores mapeados
vi.mock("../src/clients/github/errors.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/clients/github/errors.js")>();
  return {
    ...actual,
    mapGitHubError: vi.fn(),
  };
});

describe("githubRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return data on success", async () => {
    const op = vi.fn().mockResolvedValue({
      data: { name: "repo" },
      headers: { "x-ratelimit-remaining": "59", "x-ratelimit-limit": "60" },
    });

    const result = await githubRequest(op);

    expect(result).toEqual({ name: "repo" });
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("should throw GitHubServerError after 2 retries on 500", async () => {
    const serverError = new GitHubServerError(500);

    vi.mocked(mapGitHubError).mockReturnValue(serverError);

    const op = vi.fn().mockRejectedValue({ status: 500 });

    await expect(githubRequest(op)).rejects.toBeInstanceOf(GitHubServerError);

    // 3 llamadas: intento 0, 1, 2 (luego lanza)
    expect(op).toHaveBeenCalledTimes(3);
  }, 15_000);

  it("should throw GitHubRateLimitError after retry", async () => {
    const rateLimitError = new GitHubRateLimitError(
      Math.floor(Date.now() / 1000) + 1,
    );

    vi.mocked(mapGitHubError).mockReturnValue(rateLimitError);

    const op = vi.fn().mockRejectedValue({ status: 429 });

    await expect(githubRequest(op)).rejects.toBeInstanceOf(GitHubRateLimitError);

    // 2 llamadas: intento 0 y 1 (solo un retry para rate limit)
    expect(op).toHaveBeenCalledTimes(2);
  }, 15_000);
});
