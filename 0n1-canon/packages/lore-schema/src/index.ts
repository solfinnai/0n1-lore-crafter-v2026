import { z } from "zod"

/** Common lore entity envelope */
export const LoreEntityBaseSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  schemaVersion: z.string().default("1.0.0"),
  status: z.enum(["canon", "draft", "deprecated"]),
  updatedAt: z.string(),
  supersedes: z.string().optional(),
  deprecatedBy: z.string().optional(),
  incomplete: z.boolean().optional(),
  sources: z
    .array(
      z.object({
        kind: z.enum(["harper-xlsx", "universe-report", "wiki-legacy", "crafter-canon", "manual"]),
        ref: z.string(),
      }),
    )
    .optional(),
})

export const CanonMetaSchema = z.object({
  canonVersion: z.string(),
  soulsVersion: z.string(),
  schemaVersion: z.string(),
  mechanicsSource: z.string(),
  narrativeSource: z.string(),
  collections: z.array(z.string()),
})

export const OpenSeaTraitSchema = z.object({
  trait_type: z.string(),
  value: z.union([z.string(), z.number()]),
})

export const ResolveInputSchema = z.object({
  canonVersion: z.string().optional(),
  collectionId: z.string().default("collection.eth"),
  typeId: z.string().optional(),
  domainId: z.string().nullable().optional(),
  traits: z.array(OpenSeaTraitSchema),
})

export type ResolveInput = z.infer<typeof ResolveInputSchema>
export type CanonMeta = z.infer<typeof CanonMetaSchema>
