import { describe, expect, it, vi, beforeEach } from "vitest";
import { GithubClient } from "../src/clients/github/client.js";
import { githubRequest } from "../src/clients/github/request.js";

// Mock githubRequest para no hacer llamadas reales a GitHub
vi.mock("../src/clients/github/request.js", () => ({
  githubRequest: vi.fn(),
}));

// Mock env para que no falle al cargar
vi.mock("../src/config/env.js", () => ({
  env: { GITHUB_TOKEN: "fake-token", GITHUB_USERNAME: "test", GITHUB_TEST_REPO: "repo" },
}));

describe("GithubClient.listRepositories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return formatted repositories", async () => {
    vi.mocked(githubRequest).mockResolvedValue([
      {
        full_name: "test/mcp-server",
        html_url: "https://github.com/test/mcp-server",
        private: false,
        description: "An MCP server",
        owner: { login: "test" },
      },
    ]);

    const client = new GithubClient();
    const result = await client.listRepositories();

    expect(result).toEqual([
      {
        fullName: "test/mcp-server",
        url: "https://github.com/test/mcp-server",
        private: false,
        description: "An MCP server",
        owner: "test",
      },
    ]);
  });
});

describe("GithubClient.createRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create and return a formatted repository", async () => {
    vi.mocked(githubRequest).mockResolvedValue({
      full_name: "test/mcp-server",
      html_url: "https://github.com/test/mcp-server",
      private: false,
      description: "MCP Server",
      owner: { login: "test" },
    });

    const client = new GithubClient();
    const result = await client.createRepository("mcp-server", "MCP Server");

    expect(result).toEqual({
      fullName: "test/mcp-server",
      url: "https://github.com/test/mcp-server",
      private: false,
      description: "MCP Server",
      owner: "test",
    });

    expect(githubRequest).toHaveBeenCalledTimes(1);
  });

  it("should create private repository", async () => {
    vi.mocked(githubRequest).mockResolvedValue({
      full_name: "test/secret-repo",
      html_url: "https://github.com/test/secret-repo",
      private: true,
      description: null,
      owner: { login: "test" },
    });

    const client = new GithubClient();
    const result = await client.createRepository("secret-repo", undefined, true);

    expect(result.private).toBe(true);
    expect(result.description).toBeNull();
  });
});

describe("GithubClient.createIssue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create and return a formatted issue", async () => {
    vi.mocked(githubRequest).mockResolvedValue({
      number: 42,
      html_url: "https://github.com/test/repo/issues/42",
      title: "Bug: something is broken",
    });

    const client = new GithubClient();
    const result = await client.createIssue("test", "repo", "Bug: something is broken");

    expect(result).toEqual({
      number: 42,
      url: "https://github.com/test/repo/issues/42",
      title: "Bug: something is broken",
    });
  });
});

describe("GithubClient.listIssues", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return formatted open issues", async () => {
    vi.mocked(githubRequest).mockResolvedValue([
      {
        number: 1,
        title: "First issue",
        state: "open",
        html_url: "https://github.com/test/repo/issues/1",
      },
    ]);

    const client = new GithubClient();
    const result = await client.listIssues("test", "repo");

    expect(result).toEqual([
      {
        number: 1,
        title: "First issue",
        state: "open",
        url: "https://github.com/test/repo/issues/1",
      },
    ]);
  });
});

describe("GithubClient.addCommentToIssue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create and return formatted comment", async () => {
    vi.mocked(githubRequest).mockResolvedValue({
      id: 12345,
      html_url: "https://github.com/test/repo/issues/1#issuecomment-12345",
      body: "Test comment body",
    });

    const client = new GithubClient();
    const result = await client.addCommentToIssue("test", "repo", 1, "Test comment body");

    expect(result).toEqual({
      id: 12345,
      url: "https://github.com/test/repo/issues/1#issuecomment-12345",
      body: "Test comment body",
    });
  });
});

describe("GithubClient.closeIssue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should close and return formatted closed issue state", async () => {
    vi.mocked(githubRequest).mockResolvedValue({
      number: 1,
      state: "closed",
    });

    const client = new GithubClient();
    const result = await client.closeIssue("test", "repo", 1);

    expect(result).toEqual({
      number: 1,
      state: "closed",
    });
  });
});

describe("GithubClient.createLabel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create and return formatted label", async () => {
    vi.mocked(githubRequest).mockResolvedValue({
      name: "bug",
      color: "fc2929",
      description: "Something isn't working",
    });

    const client = new GithubClient();
    const result = await client.createLabel("test", "repo", "bug", "fc2929", "Something isn't working");

    expect(result).toEqual({
      name: "bug",
      color: "fc2929",
      description: "Something isn't working",
    });
  });
});