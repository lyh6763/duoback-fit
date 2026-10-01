import * as z from "zod/mini";

export const CATEGORIES = ["office", "student"] as const;
export const ANGLES = ["front", "left", "right", "rear"] as const;

const positiveInt = () => z.int().check(z.positive());

const rangeMm = z
  .object({ min: positiveInt(), max: positiveInt() })
  .check(z.refine((range) => range.min <= range.max, "min must not exceed max"));

export const chairSchema = z.object({
  slug: z.string().check(z.regex(/^[a-z0-9-]+$/)),
  name: z.string().check(z.minLength(1)),
  category: z.enum(CATEGORIES),
  price: positiveInt(),
  releaseDate: z.iso.date(),
  summary: z.string().check(z.minLength(1)),
  highlights: z.array(z.object({ title: z.string(), body: z.string() })).check(z.length(3)),
  colors: z
    .array(
      z.object({
        name: z.string(),
        hex: z.string().check(z.regex(/^#[0-9A-F]{6}$/i)),
        slug: z.string().check(z.regex(/^[a-z]+$/)),
      }),
    )
    .check(z.minLength(1)),
  spec: z.object({
    // min === max 이면 높이 고정형
    seatHeightMm: rangeMm,
    seatDepthAdjust: z.boolean(),
    backHeightMm: positiveInt(),
    sizeMm: z.object({
      w: positiveInt(),
      d: positiveInt(),
      h: rangeMm,
    }),
    maxWeightKg: positiveInt(),
    armrest: z.enum(["fixed", "2d", "3d", "4d"]),
    headrest: z.boolean(),
    lumbar: z.enum(["none", "fixed", "adjustable", "dualback"]),
    tilt: z.enum(["none", "basic", "synchro"]),
    backMaterial: z.enum(["mesh", "fabric"]),
    seatMaterial: z.enum(["mesh", "fabric", "foam"]),
    base: z.enum(["nylon", "aluminum", "cantilever", "sled"]),
    warrantyYears: positiveInt(),
  }),
});

export type Chair = z.infer<typeof chairSchema>;
export type ChairCategory = Chair["category"];
export type ChairSpec = Chair["spec"];
export type Angle = (typeof ANGLES)[number];
