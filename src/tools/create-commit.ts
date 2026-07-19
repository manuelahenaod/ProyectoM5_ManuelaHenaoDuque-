import { createCommit } from "../github/operations.js";
import {successResponse, errorResponse} from "../utils/mcp-response.js";

type CreateCommitArgs = {
  owner: string;
  repo: string;
  path: string;
  message: string;
  content: string;
};

export async function createCommitTool(args: CreateCommitArgs) {
  try {
    const commit = await createCommit(
      args.owner,
      args.repo,
      args.path,
      args.message,
      args.content
    );

    return successResponse(
      ` Commit created successfully!\n\n` +
        `SHA: ${commit.commitSha}\n` +
        `URL: ${commit.url}`
    );
  } catch (error) {
    return errorResponse(error);
  }
}