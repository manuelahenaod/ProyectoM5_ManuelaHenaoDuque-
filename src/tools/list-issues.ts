import { listIssues } from "../github/operations.js";
import { errorResponse, successResponse } from "../utils/mcp-response.js";

type ListIssuesArgs = {
  owner: string;
  repo: string;
};

export async function listIssuesTool(args: ListIssuesArgs) {
  try {
    const issues = await listIssues(args.owner, args.repo);

    if (issues.length === 0) {
      return successResponse("No open issues were found.");
    }

    const response = issues
      .map(
        (issue) =>
          `#${issue.number}\n${issue.title}\n${issue.url}`
      )
      .join("\n\n");

    return successResponse(response);
  } catch (error) {
    return errorResponse(error);
  }
}