import { listRepositories } from "../github/operations.js";
import {successResponse, errorResponse} from "../utils/mcp-response.js";

export async function listRepositoriesTool() {
  try {
    const repositories = await listRepositories();

    if (repositories.length === 0) {
      return successResponse("No repositories were found.");
    }

    const response = repositories
      .map(
        (repository) =>
          `${repository.name}\n${repository.url}`
      )
      .join("\n\n");

    return successResponse(response);
  } catch (error) {
    return errorResponse(error);
  }
}