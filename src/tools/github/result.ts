import { ZodError } from "zod";
import {
  GitHubError,
  GitHubValidationError,
} from "../../clients/github/errors.js";

export type ToolResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { type: string; message: string; details?: unknown } };

export function toToolError(err: unknown): ToolResult<never> {
  if (err instanceof ZodError) {
    return {
      ok: false,
      error: {
        type: "invalid_input",
        message: "El input de la tool no cumple el schema.",
        details: err.issues,
      },
    };
  }
  if (err instanceof GitHubValidationError) {
    return {
      ok: false,
      error: {
        type: "validation_error",
        message: err.message,
        details: err.details,
      },
    };
  }
  if (err instanceof GitHubError) {
    return {
      ok: false,
      error: { type: err.name, message: err.message },
    };
  }
  return {
    ok: false,
    error: {
      type: "unknown_error",
      message: err instanceof Error ? err.message : String(err),
    },
  };
}
