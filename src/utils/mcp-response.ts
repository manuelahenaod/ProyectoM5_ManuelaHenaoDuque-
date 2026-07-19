import { formatGitHubError } from "../errors/index.js";

export function successResponse(text: string) {
  return {
    content: [
      {
        type: "text" as const,
        text,
      },
    ],
  };
}

export function errorResponse(error: unknown) {
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