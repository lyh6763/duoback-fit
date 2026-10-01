import { z } from "zod";

export const CATEGORIES = ["office", "student"] as const;
export const ANGLES = ["front", "left", "right", "rear"] as const;

const rangeMm = z
  .object({ min: z.number().int().positive(), max: z.number().int().positive() })
  .refine((range) => range.min <= range.max, "min must not exceed max");

export const chairSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  category: z.enum(CATEGORIES),
  price: z.number().int().positive(),
  releaseDate: z.iso.date(),
  summary: z.string().min(1),
  highlights: z
    .array(z.object({ title: z.string(), body: z.string() }))
    .length(3),
  colors: z
    .array(
      z.object({
        name: z.string(),
        hex: z.string().regex(/^#[0-9A-F]{6}$/i),
        slug: z.string().regex(/^[a-z]+$/),
      }),
    )
    .min(1),
  spec: z.object({
    // min === max 이면 높이 고정형
    seatHeightMm: rangeMm,
    seatDepthAdjust: z.boolean(),
    backHeightMm: z.number().int().positive(),
    sizeMm: z.object({
      w: z.number().int().positive(),
      d: z.number().int().positive(),
      h: rangeMm,
    }),
    maxWeightKg: z.number().int().positive(),
    armrest: z.enum(["fixed", "2d", "3d", "4d"]),
    headrest: z.boolean(),
    lumbar: z.enum(["none", "fixed", "adjustable", "dualback"]),
    tilt: z.enum(["none", "basic", "synchro"]),
    backMaterial: z.enum(["mesh", "fabric"]),
    seatMaterial: z.enum(["mesh", "fabric", "foam"]),
    base: z.enum(["nylon", "aluminum", "cantilever", "sled"]),
    warrantyYears: z.number().int().positive(),
  }),
});

export type Chair = z.infer<typeof chairSchema>;
export type ChairCategory = Chair["category"];
export type ChairSpec = Chair["spec"];
export type Angle = (typeof ANGLES)[number];
