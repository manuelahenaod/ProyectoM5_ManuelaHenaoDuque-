import { Octokit } from "@octokit/rest";
import { createOctokit } from "./octokit.js";
import {
  CreatedFile,
  CreatedIssue,
  IssueSummary,
  Repository,
  RepoSummary,
  CreatedComment,
  ClosedIssue,
  CreatedLabel,
} from "../../schemas/github.js";
import { githubRequest } from "./request.js";

export class GithubClient {
  private octokit: Octokit;

  constructor(octokit: Octokit = createOctokit()) {
    this.octokit = octokit;
  }

  async verifyAuth() {
    const { data } = await this.octokit.rest.users.getAuthenticated();
    return {
      login: data.login,
      name: data.name,
      plan: data.plan?.name ?? "unknown",
    };
  }

  async getRepoSummary(owner: string, repo: string): Promise<RepoSummary> {
    const data = await githubRequest(() =>
      this.octokit.repos.get({ owner, repo }),
    );
    return {
      fullName: data.full_name,
      description: data.description ?? null,
      stars: data.stargazers_count,
      defaultBranch: data.default_branch,
    };
  }

  async listRepositories(
    type: "all" | "public" | "private" = "all",
    sort: "created" | "updated" | "pushed" | "full_name" = "updated",
    per_page: number = 30,
  ): Promise<Repository[]> {
    const data = await githubRequest(() =>
      this.octokit.repos.listForAuthenticatedUser({ type, sort, per_page }),
    );
    return data.map((repo) => ({
      fullName: repo.full_name,
      url: repo.html_url,
      private: repo.private,
      description: repo.description ?? null,
      owner: repo.owner.login,
    }));
  }

  async createRepository(
    name: string,
    description?: string,
    isPrivate: boolean = false,
  ): Promise<Repository> {
    const data = await githubRequest(() =>
      this.octokit.repos.createForAuthenticatedUser({
        name,
        ...(description !== undefined && { description }),
        private: isPrivate,
        auto_init: true,
      }),
    );
    return {
      fullName: data.full_name,
      url: data.html_url,
      private: data.private,
      description: data.description ?? null,
      owner: data.owner.login,
    };
  }

  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body?: string,
  ): Promise<CreatedIssue> {
    const data = await githubRequest(() =>
      this.octokit.issues.create({ owner, repo, title, body }),
    );
    return {
      number: data.number,
      url: data.html_url,
      title: data.title,
    };
  }

  async listIssues(owner: string, repo: string): Promise<IssueSummary[]> {
    const data = await githubRequest(() =>
      this.octokit.issues.listForRepo({ owner, repo, state: "open" }),
    );
    return data.map((issue) => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      url: issue.html_url,
    }));
  }

  async createFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch: string = "main",
  ): Promise<CreatedFile> {
    // 1. Obtener el SHA del último commit en la rama
    const refData = await githubRequest(() =>
      this.octokit.git.getRef({ owner, repo, ref: `heads/${branch}` }),
    );
    const commitSha = refData.object.sha;

    // 2. Obtener el SHA del árbol del commit
    const commitData = await githubRequest(() =>
      this.octokit.git.getCommit({ owner, repo, commit_sha: commitSha }),
    );
    const treeSha = commitData.tree.sha;

    // 3. Crear blob con el contenido del archivo
    const blobData = await githubRequest(() =>
      this.octokit.git.createBlob({
        owner,
        repo,
        content: Buffer.from(content, "utf-8").toString("base64"),
        encoding: "base64",
      }),
    );

    // 4. Crear un nuevo árbol apuntando al blob
    const treeData = await githubRequest(() =>
      this.octokit.git.createTree({
        owner,
        repo,
        base_tree: treeSha,
        tree: [{ path, mode: "100644", type: "blob", sha: blobData.sha }],
      }),
    );

    // 5. Crear el commit apuntando al nuevo árbol
    const newCommit = await githubRequest(() =>
      this.octokit.git.createCommit({
        owner,
        repo,
        message,
        tree: treeData.sha,
        parents: [commitSha],
      }),
    );

    // 6. Actualizar la referencia de la rama al nuevo commit
    await githubRequest(() =>
      this.octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: newCommit.sha,
      }),
    );

    return {
      sha: newCommit.sha,
      url: `https://github.com/${owner}/${repo}/blob/${branch}/${path}`,
      path,
      branch,
    };
  }

  async addCommentToIssue(
    owner: string,
    repo: string,
    number: number,
    body: string,
  ): Promise<CreatedComment> {
    const data = await githubRequest(() =>
      this.octokit.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body,
      }),
    );
    return {
      id: data.id,
      url: data.html_url,
      body: data.body ?? "",
    };
  }

  async closeIssue(
    owner: string,
    repo: string,
    number: number,
  ): Promise<ClosedIssue> {
    const data = await githubRequest(() =>
      this.octokit.issues.update({
        owner,
        repo,
        issue_number: number,
        state: "closed",
      }),
    );
    return {
      number: data.number,
      state: data.state ?? "closed",
    };
  }

  async createLabel(
    owner: string,
    repo: string,
    name: string,
    color: string,
    description?: string,
  ): Promise<CreatedLabel> {
    const data = await githubRequest(() =>
      this.octokit.issues.createLabel({
        owner,
        repo,
        name,
        color,
        description,
      }),
    );
    return {
      name: data.name,
      color: data.color,
      description: data.description ?? null,
    };
  }
}
