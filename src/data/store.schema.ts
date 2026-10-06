import * as z from "zod/mini";
import type { Store } from "./stores";

/**
 * 매장 데이터의 런타임 제약. 테스트에서만 import한다(브라우저 번들에 zod를 넣지 않기 위해).
 * src/data/stores.test.ts가 모든 매장 데이터를 이 스키마로 검증한다.
 */
const nonEmpty = () => z.string().check(z.minLength(1));

export const storeSchema = z.object({
  id: z.string().check(z.regex(/^[a-z0-9-]+$/)),
  name: nonEmpty(),
  region: nonEmpty(),
  address: nonEmpty(),
  phone: z.string().check(z.regex(/^0\d{1,2}-\d{3,4}-\d{4}$/)),
  hours: z.object({ weekday: z.string(), weekend: z.string() }),
  displayModels: z.array(z.string()).check(z.minLength(1)),
});

/** 손으로 쓴 Store 타입과 스키마가 추론하는 타입이 정확히 같아야 컴파일된다. */
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
export const storeTypeMatchesSchema: Equal<z.infer<typeof storeSchema>, Store> = true;
