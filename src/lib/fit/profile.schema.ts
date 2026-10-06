import * as z from "zod/mini";
import {
  BUDGETS,
  CONCERNS,
  HEIGHT_RANGE,
  HOURS,
  PURPOSES,
  SITTERS,
  WEIGHT_RANGE,
  type Draft,
  type Profile,
} from "./profile";

/**
 * 프로필 규칙의 기준 정의(zod). 테스트에서만 import한다.
 * 브라우저는 ./profile.ts의 parseProfile/parseDraft를 쓰고, profile.test.ts가 두 판정이 같은지 대조한다.
 */
export const profileSchema = z.object({
  sitter: z.enum(SITTERS),
  heightCm: z.int().check(z.minimum(HEIGHT_RANGE.min), z.maximum(HEIGHT_RANGE.max)),
  weightKg: z.int().check(z.minimum(WEIGHT_RANGE.min), z.maximum(WEIGHT_RANGE.max)),
  hours: z.enum(HOURS),
  purpose: z.enum(PURPOSES),
  concerns: z.array(z.enum(CONCERNS)).check(z.maxLength(CONCERNS.length)),
  budget: z.enum(BUDGETS),
});

export const draftSchema = z.partial(profileSchema);

/** 손으로 쓴 타입과 스키마가 추론하는 타입이 정확히 같아야 컴파일된다. */
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
export const profileTypeMatchesSchema: Equal<z.infer<typeof profileSchema>, Profile> = true;
export const draftTypeMatchesSchema: Equal<z.infer<typeof draftSchema>, Draft> = true;
