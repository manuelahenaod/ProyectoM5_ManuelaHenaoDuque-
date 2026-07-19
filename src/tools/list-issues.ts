import { listIssues } from "../github/operations.js";
import { formatGitHubError } from "../errors/index.js";

type ListIssuesArgs = {
  owner: string;
  repo: string;
};

export async function listIssuesTool(args: ListIssuesArgs) {
  try {
    const issues = await listIssues(args.owner, args.repo);

    if (issues.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No open issues were found.",
          },
        ],
      };
    }

    const response = issues
      .map(
        (issue) =>
          `#${issue.number}\n${issue.title}\n${issue.url}`
      )
      .join("\n\n");

    return {
      content: [
        {
          type: "text" as const,
          text: response,
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