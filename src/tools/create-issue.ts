import { createIssue } from "../github/operations.js";
import { errorResponse, successResponse } from "../utils/mcp-response.js";

type CreateIssueArgs = {
  owner: string;
  repo: string;
  title: string;
  body?: string;
};

export async function createIssueTool(args: CreateIssueArgs) {
  try {
    const issue = await createIssue(
      args.owner,
      args.repo,
      args.title,
      args.body
    );

    return successResponse(
      `Issue #${issue.number} created successfully!\n\n` +
      `Title: ${issue.title}\n` +
      `URL: ${issue.url}`
    );
  } catch (error) {
    return errorResponse(error);
  }
}