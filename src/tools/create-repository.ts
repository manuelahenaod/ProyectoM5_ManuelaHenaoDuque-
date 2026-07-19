import { createRepository } from "../github/operations.js";
import { errorResponse, successResponse } from "../utils/mcp-response.js";

type CreateRepositoryArgs = {
  name: string;
  description?: string;
};

export async function createRepositoryTool(args: CreateRepositoryArgs) {
  try {
    const repository = await createRepository(
      args.name,
      args.description
    );

    return successResponse(
      `Repository "${repository.name}" created successfully!\n\n` +
      `Description: ${repository.description ?? "No description"}\n` +
      `URL: ${repository.url}`
    );
  } catch (error) {
    return errorResponse(error);
  }
}