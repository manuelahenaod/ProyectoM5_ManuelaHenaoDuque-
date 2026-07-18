import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.GITHUB_TOKEN;

if (!token) {
  throw new Error(
    "GITHUB_TOKEN is not defined. Please configure it in your .env file."
  );
}

export const octokit = new Octokit({
  auth: token,
});