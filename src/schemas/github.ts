import { z } from "zod";

// ─── Input Schemas ────────────────────────────────────────────────────────────

export const createRepositorySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_.-]+$/, {
      message:
        "El nombre solo puede contener letras, números, guiones bajos, puntos y guiones medios. Sin espacios.",
    })
    .describe(
      "Nombre del repositorio (sin espacios, solo [a-zA-Z0-9_.-], máx 100 caracteres)",
    ),
  description: z
    .string()
    .optional()
    .describe("Descripción opcional del repositorio"),
  private: z
    .boolean()
    .default(false)
    .describe("Si el repositorio es privado (default: false)"),
});

export const createIssueSchema = z.object({
  owner: z
    .string()
    .min(1)
    .describe("Dueño del repositorio (usuario u organización)"),
  repo: z.string().min(1).describe("Nombre del repositorio"),
  title: z
    .string()
    .min(3, { message: "El título debe tener al menos 3 caracteres." })
    .describe("Título del issue (mínimo 3 caracteres)"),
  body: z
    .string()
    .optional()
    .describe("Cuerpo del issue en Markdown (opcional)"),
});

export const listIssuesSchema = z.object({
  owner: z
    .string()
    .min(1)
    .describe("Dueño del repositorio (usuario u organización)"),
  repo: z.string().min(1).describe("Nombre del repositorio"),
});

export const listRepositoriesSchema = z.object({
  type: z
    .enum(["all", "public", "private"])
    .default("all")
    .describe("Tipo de repos a listar (default: all)"),
  sort: z
    .enum(["created", "updated", "pushed", "full_name"])
    .default("updated")
    .describe("Criterio de ordenamiento (default: updated)"),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(30)
    .describe("Cantidad de resultados por página, máx 100 (default: 30)"),
});

export const createFileSchema = z.object({
  owner: z
    .string()
    .describe("GitHub username o organización dueña del repositorio"),
  repo: z.string().describe("Nombre del repositorio (sin el prefijo owner)"),
  path: z
    .string()
    .describe(
      "Ruta del archivo relativa a la raíz del repo, ej: 'src/index.ts'",
    ),
  content: z
    .string()
    .describe("Contenido completo del archivo en UTF-8"),
  message: z.string().describe("Mensaje del commit que describe el cambio"),
  branch: z
    .string()
    .default("main")
    .describe("Rama destino del commit (default: 'main')"),
});

export const addCommentToIssueSchema = z.object({
  owner: z.string().min(1).describe("Dueño del repositorio"),
  repo: z.string().min(1).describe("Nombre del repositorio"),
  number: z.number().int().positive().describe("Número del issue"),
  body: z.string().min(1).describe("Cuerpo del comentario"),
});

export const closeIssueSchema = z.object({
  owner: z.string().min(1).describe("Dueño del repositorio"),
  repo: z.string().min(1).describe("Nombre del repositorio"),
  number: z.number().int().positive().describe("Número del issue a cerrar"),
});

export const createLabelSchema = z.object({
  owner: z.string().min(1).describe("Dueño del repositorio"),
  repo: z.string().min(1).describe("Nombre del repositorio"),
  name: z.string().min(1).max(50).describe("Nombre del label"),
  color: z
    .string()
    .regex(/^[a-fA-F0-9]{6}$/, {
      message: "El color debe ser un código hexadecimal de 6 dígitos sin '#' (ej: 'ff0000').",
    })
    .describe("Color hexadecimal de 6 dígitos sin '#' (ej: 'ff0000')"),
  description: z.string().optional().describe("Descripción opcional del label"),
});

// ─── Data Schemas (used in output) ───────────────────────────────────────────

export const RepoSummarySchema = z.object({
  fullName: z.string(),
  description: z.string().nullable(),
  stars: z.number().int().nonnegative(),
  defaultBranch: z.string(),
});

export const RepositorySchema = z.object({
  fullName: z.string(),
  url: z.string().url(),
  private: z.boolean(),
  description: z.string().nullable(),
  owner: z.string(),
});

export const CreatedIssueSchema = z.object({
  number: z.number().int().positive(),
  url: z.string().url(),
  title: z.string(),
});

export const IssueSummarySchema = z.object({
  number: z.number().int().positive(),
  title: z.string(),
  state: z.string(),
  url: z.string().url(),
});

export const CreatedFileSchema = z.object({
  sha: z.string(),
  url: z.string().url(),
  path: z.string(),
  branch: z.string(),
});

export const CreatedCommentSchema = z.object({
  id: z.number(),
  url: z.string().url(),
  body: z.string(),
});

export const ClosedIssueSchema = z.object({
  number: z.number(),
  state: z.string(),
});

export const CreatedLabelSchema = z.object({
  name: z.string(),
  color: z.string(),
  description: z.string().nullable(),
});

// ─── Output Schemas (structuredContent) ──────────────────────────────────────

export const CreateRepositoryOutputSchema = z.object({
  ok: z.literal(true),
  data: RepositorySchema,
});

export const CreateIssueOutputSchema = z.object({
  ok: z.literal(true),
  data: CreatedIssueSchema,
});

export const ListIssuesOutputSchema = z.object({
  ok: z.literal(true),
  data: z.array(IssueSummarySchema),
});

export const ListRepositoriesOutputSchema = z.object({
  ok: z.literal(true),
  data: z.array(RepositorySchema),
});

export const CreateFileOutputSchema = z.object({
  ok: z.literal(true),
  data: CreatedFileSchema,
});

export const AddCommentToIssueOutputSchema = z.object({
  ok: z.literal(true),
  data: CreatedCommentSchema,
});

export const CloseIssueOutputSchema = z.object({
  ok: z.literal(true),
  data: ClosedIssueSchema,
});

export const CreateLabelOutputSchema = z.object({
  ok: z.literal(true),
  data: CreatedLabelSchema,
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type RepoSummary = z.infer<typeof RepoSummarySchema>;
export type Repository = z.infer<typeof RepositorySchema>;
export type CreatedIssue = z.infer<typeof CreatedIssueSchema>;
export type IssueSummary = z.infer<typeof IssueSummarySchema>;
export type CreatedFile = z.infer<typeof CreatedFileSchema>;
export type CreatedComment = z.infer<typeof CreatedCommentSchema>;
export type ClosedIssue = z.infer<typeof ClosedIssueSchema>;
export type CreatedLabel = z.infer<typeof CreatedLabelSchema>;

export type CreateRepositoryOutput = z.infer<typeof CreateRepositoryOutputSchema>;
export type CreateIssueOutput = z.infer<typeof CreateIssueOutputSchema>;
export type ListIssuesOutput = z.infer<typeof ListIssuesOutputSchema>;
export type ListRepositoriesOutput = z.infer<typeof ListRepositoriesOutputSchema>;
export type CreateFileOutput = z.infer<typeof CreateFileOutputSchema>;
export type AddCommentToIssueOutput = z.infer<typeof AddCommentToIssueOutputSchema>;
export type CloseIssueOutput = z.infer<typeof CloseIssueOutputSchema>;
export type CreateLabelOutput = z.infer<typeof CreateLabelOutputSchema>;
