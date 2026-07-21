import { beforeEach, describe, expect, it, vi } from "vitest";

import { githubRequest } from "../src/github/request.js";
import { retry } from "../src/utils/retry.js";
import { logger } from "../src/utils/logging.js";
import { handleGitHubError } from "../src/errors/handler.js";

vi.mock("../src/utils/retry.js", () => ({
  retry: vi.fn(),
}));

vi.mock("../src/errors/handler.js", () => ({
  handleGitHubError: vi.fn(),
}));

vi.mock("../src/utils/logging.js", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("githubRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return request data", async () => {
    vi.mocked(retry).mockResolvedValue({
      data: {
        name: "repo",
      },
    });

    const request = vi.fn();

    const result = await githubRequest(request);

    expect(result).toEqual({
      name: "repo",
    });

    expect(retry).toHaveBeenCalledTimes(1);

    expect(logger.debug).toHaveBeenNthCalledWith(
      1,
      "Executing GitHub request..."
    );

    expect(logger.debug).toHaveBeenNthCalledWith(
      2,
      "GitHub request completed successfully."
    );
  });

  it("should delegate errors to handleGitHubError", async () => {
    const error = { status: 401 };

    vi.mocked(retry).mockRejectedValue(error);

    vi.mocked(handleGitHubError).mockImplementation(() => {
      throw new Error("handled");
    });

    const request = vi.fn();

    await expect(
      githubRequest(request)
    ).rejects.toThrow("handled");

    expect(logger.error).toHaveBeenCalledWith(
      "GitHub request failed.",
      error
    );

    expect(handleGitHubError).toHaveBeenCalledWith(
      error,
      {}
    );
  });
});

