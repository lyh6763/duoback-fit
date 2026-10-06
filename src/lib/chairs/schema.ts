import * as z from "zod/mini";
import { CATEGORIES, type Chair } from "./types";

/**
 * 의자 데이터의 런타임 제약. 데이터는 빌드 때 고정되므로 브라우저에서는 검사하지 않고,
 * src/data/chairs.test.ts가 모든 데이터를 이 스키마로 검증한다(CI에서 머지 전에 실행).
 * 이 파일은 테스트에서만 import한다 — 브라우저 번들에 zod가 들어가지 않게 하기 위해서다.
 */

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

/** 손으로 쓴 Chair 타입과 스키마가 추론하는 타입이 정확히 같아야 컴파일된다. */
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
export const chairTypeMatchesSchema: Equal<z.infer<typeof chairSchema>, Chair> = true;
