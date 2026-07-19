import { z } from "zod";

export const repositorySchema = z.object({
  name: z
    .string()
    .min(3, "Repository name must contain at least 3 characters.")
    .max(100, "Repository name cannot exceed 100 characters.")
    .regex(
      /^[a-zA-Z0-9-]+$/,
      "Repository name can only contain letters, numbers, and hyphens."
    ),

  description: z
    .string()
    .max(350, "Description cannot exceed 350 characters.")
    .optional(),
});

export const issueSchema = z.object({
  owner: z
    .string()
    .min(1, "Repository owner is required."),

  repo: z
    .string()
    .min(1, "Repository name is required."),

  title: z
    .string()
    .min(3, "Issue title must contain at least 3 characters.")
    .max(100, "Issue title cannot exceed 100 characters."),

  body: z
    .string()
    .max(5000, "Issue body cannot exceed 5000 characters.")
    .optional(),
});

export const ListissuesSchema = z.object({
  owner: z
    .string()
    .min(1, "Repository owner is required."),

  repo: z
    .string()
    .min(1, "Repository name is required."),

});

