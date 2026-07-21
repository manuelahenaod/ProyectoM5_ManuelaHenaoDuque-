import { describe, expect, it, vi, beforeEach } from "vitest";

import {
  listRepositories,
  createRepository,
} from "../src/github/operations.js";

import { githubRequest } from "../src/github/request.js";
import { logger } from "../src/utils/logging.js";

vi.mock("../src/github/request.js", () => ({
  githubRequest: vi.fn(),
}));

vi.mock("../src/utils/logging.js", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));



describe("listRepositories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return formatted repositories", async () => {
    vi.mocked(githubRequest).mockResolvedValue([
      {
        name: "mcp-server",
        description: "Repository",
        private: false,
        html_url: "https://github.com/test/mcp-server",
      },
    ]);

    const result = await listRepositories();

    expect(result).toEqual([
      {
        name: "mcp-server",
        description: "Repository",
        private: false,
        url: "https://github.com/test/mcp-server",
      },
    ]);

    expect(logger.info).toHaveBeenCalled();
    expect(githubRequest).toHaveBeenCalledTimes(1);
  });
});

describe("createRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create and return a formatted repository", async () => {
    vi.mocked(githubRequest).mockResolvedValue({
      name: "mcp-server",
      description: "MCP Server",
      private: false,
      html_url: "https://github.com/user/mcp-server",
    });

    const result = await createRepository(
      "mcp-server",
      "MCP Server"
    );

    expect(result).toEqual({
      name: "mcp-server",
      description: "MCP Server",
      private: false,
      url: "https://github.com/user/mcp-server",
    });

    expect(githubRequest).toHaveBeenCalledTimes(1);

    expect(logger.info).toHaveBeenCalledWith(
      'Creating repository "mcp-server".'
    );

    expect(logger.info).toHaveBeenCalledWith(
      'Repository "mcp-server" created successfully.'
    );
  });
});