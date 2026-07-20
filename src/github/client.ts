import { Octokit } from "@octokit/rest";
import { env } from "../config/env.js";

export const octokit = new Octokit({
  auth: env.GITHUB_TOKEN,
});