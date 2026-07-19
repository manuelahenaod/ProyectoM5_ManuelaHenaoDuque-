import { createIssue } from "../github/operations.js";
import { formatGitHubError } from "../errors/index.js";

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

    return {
      content: [
        {
          type: "text" as const,
          text:
            `✅ Issue #${issue.number} created successfully!\n\n` +
            `Title: ${issue.title}\n` +
            `URL: ${issue.url}`,
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: formatGitHubError(error),
        },
      ],
    };
  }
}