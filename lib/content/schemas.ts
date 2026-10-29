import { z } from "zod";
import { TAGS } from "@/lib/content/tags";

export { AI_TAGS, TAGS, type Tag } from "@/lib/content/tags";

// Content schemas (plan §4). Every content file is validated against these
// before the build, so invalid content never reaches production.

export const STATUSES = ["shipped", "in-progress", "archived"] as const;

const nonEmpty = z.string().trim().min(1, { error: "Must not be empty" });

const yearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, { error: "Use YYYY-MM, e.g. 2025-03" });

// YAML turns an unquoted 2026-10-29 into a Date; accept both forms.
const isoDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.iso.date({ error: "Use YYYY-MM-DD, e.g. 2026-10-29" }),
);

export const periodSchema = z
  .strictObject({
    start: yearMonth,
    end: z.union([yearMonth, z.literal("present")]),
  })
  .refine((p) => p.end === "present" || p.start <= p.end, {
    error: "Period start must not be after its end",
    path: ["end"],
  });

const uniqueList = <T extends z.ZodType>(item: T) =>
  z
    .array(item)
    .min(1)
    .refine((list) => new Set(list).size === list.length, {
      error: "Items must be unique",
    });

// --- Evaluation (plan §4.3), stored in <slug>.eval.json -------------------

const metricSchema = z.strictObject({
  name: nonEmpty,
  value: z.number(),
  baseline: z.number().optional(),
  unit: z.string().optional(),
});

const chartSchema = z.discriminatedUnion("type", [
  z
    .strictObject({
      type: z.literal("confusion-matrix"),
      labels: z.array(nonEmpty).min(2),
      matrix: z.array(z.array(z.number().int().nonnegative())),
      caption: nonEmpty,
    })
    .refine(
      (c) =>
        c.matrix.length === c.labels.length &&
        c.matrix.every((row) => row.length === c.labels.length),
      { error: "Matrix must be square, one row and column per label" },
    ),
  z
    .strictObject({
      type: z.literal("loss-curve"),
      epochs: z.array(z.number()).min(2),
      series: z
        .array(z.strictObject({ name: nonEmpty, values: z.array(z.number()) }))
        .min(1),
      caption: nonEmpty,
    })
    .refine((c) => c.series.every((s) => s.values.length === c.epochs.length), {
      error: "Every series needs one value per epoch",
    }),
  z.strictObject({
    type: z.literal("tradeoff-scatter"),
    points: z
      .array(
        z.strictObject({
          label: nonEmpty,
          latencyMs: z.number().nonnegative(),
          accuracy: z.number(),
        }),
      )
      .min(2),
    xLabel: nonEmpty,
    yLabel: nonEmpty,
    caption: nonEmpty,
  }),
  z
    .strictObject({
      type: z.literal("metric-table"),
      columns: z.array(nonEmpty).min(1),
      rows: z.array(z.array(z.union([z.string(), z.number()]))).min(1),
      caption: nonEmpty,
    })
    .refine((c) => c.rows.every((row) => row.length === c.columns.length), {
      error: "Every row needs one cell per column",
    }),
]);

export const evaluationSchema = z.strictObject({
  summary: nonEmpty,
  metrics: z.array(metricSchema).min(1),
  charts: z.array(chartSchema),
  testSet: nonEmpty,
  reproducible: z
    .strictObject({ repo: z.url().optional(), notebook: z.url().optional() })
    .refine((r) => r.repo || r.notebook, {
      error: "Link the repo or notebook that produced the numbers",
    }),
});

export type Evaluation = z.infer<typeof evaluationSchema>;
export type Chart = Evaluation["charts"][number];

// --- Dossier frontmatter (plan §4.1) ---------------------------------------

const mediaSchema = z.strictObject({
  src: nonEmpty,
  alt: nonEmpty,
  kind: z.enum(["image", "gif", "video", "diagram"]),
  caption: z.string().optional(),
});

const performanceSchema = z.strictObject({
  name: nonEmpty,
  value: z.number(),
  unit: nonEmpty,
  measuredAt: isoDate,
  method: nonEmpty,
});

export const dossierFrontmatterSchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    error: "Use lowercase words joined by hyphens, e.g. road-guard",
  }),
  caseNumber: z
    .string()
    .regex(/^CASE-\d{3}$/, { error: "Use CASE-000 format" }),
  title: nonEmpty,
  // Reused in /llms.txt and OG images, so it must stay one line.
  summary: nonEmpty.max(160),
  status: z.enum(STATUSES),
  role: z.strictObject({
    type: z.enum(["solo", "team"]),
    contribution: nonEmpty,
  }),
  period: periodSchema,
  // Plan §12: last-updated date on each dossier.
  updated: isoDate,
  tags: uniqueList(z.enum(TAGS)),
  stack: uniqueList(nonEmpty),
  links: z
    .strictObject({
      demo: z.url().optional(),
      github: z.url().optional(),
      behance: z.url().optional(),
      writeup: z.url().optional(),
    })
    .optional(),
  media: z.array(mediaSchema).optional(),
  performance: z.array(performanceSchema).optional(),
  /** Shown on the home page (up to three, newest first). */
  featured: z.boolean().optional(),
});

export type DossierFrontmatter = z.infer<typeof dossierFrontmatterSchema>;

// --- Profile data (content/*.ts) --------------------------------------------

export const experienceSchema = z.array(
  z.strictObject({
    organization: nonEmpty,
    role: nonEmpty,
    period: periodSchema,
    location: z.string().optional(),
    achievements: z.array(nonEmpty).min(1),
    link: z.url().optional(),
  }),
);

export const educationSchema = z.array(
  z.strictObject({
    institution: nonEmpty,
    degree: nonEmpty,
    period: periodSchema,
    details: z.array(nonEmpty).optional(),
  }),
);

export const SKILL_CATEGORIES = [
  "Languages",
  "ML & AI",
  "Web",
  "Data & Tools",
  "Design",
] as const;

export const skillsSchema = z
  .array(
    z.strictObject({
      name: nonEmpty,
      category: z.enum(SKILL_CATEGORIES),
    }),
  )
  .refine(
    (skills) =>
      new Set(skills.map((s) => s.name.toLowerCase())).size === skills.length,
    { error: "Skill names must be unique (case-insensitive)" },
  );

export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Skill = z.infer<typeof skillsSchema>[number];
