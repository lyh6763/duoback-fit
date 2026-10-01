import * as z from "zod/mini";

const nonEmpty = () => z.string().check(z.minLength(1));

const storeSchema = z.object({
  id: z.string().check(z.regex(/^[a-z0-9-]+$/)),
  name: nonEmpty(),
  region: nonEmpty(),
  address: nonEmpty(),
  phone: z.string().check(z.regex(/^0\d{1,2}-\d{3,4}-\d{4}$/)),
  hours: z.object({ weekday: z.string(), weekend: z.string() }),
  displayModels: z.array(z.string()).check(z.minLength(1)),
});

export type Store = z.infer<typeof storeSchema>;

/**
 * 포트폴리오용 가상 매장. 주소와 전화번호는 실제 장소·번호가 아니다.
 * 전화번호는 실제로 걸리지 않도록 국번을 0000으로 둔다.
 */
const RAW_STORES = [
  {
    id: "gangnam",
    name: "강남 쇼룸",
    region: "서울",
    address: "서울특별시 강남구 가상로 101, 1층",
    phone: "02-0000-0101",
    hours: { weekday: "10:00–20:00", weekend: "11:00–19:00" },
    displayModels: ["q1w", "d3hs", "d2500g", "dk073w", "d043w"],
  },
  {
    id: "seongsu",
    name: "성수 쇼룸",
    region: "서울",
    address: "서울특별시 성동구 예시길 22, 2층",
    phone: "02-0000-0202",
    hours: { weekday: "11:00–20:00", weekend: "11:00–20:00" },
    displayModels: ["q1w", "d2500g"],
  },
  {
    id: "pangyo",
    name: "판교 쇼룸",
    region: "경기",
    address: "경기도 성남시 분당구 샘플로 33",
    phone: "031-0000-0303",
    hours: { weekday: "10:00–19:00", weekend: "휴무" },
    displayModels: ["q1w", "d3hs", "d2500g"],
  },
  {
    id: "seomyeon",
    name: "서면 쇼룸",
    region: "부산",
    address: "부산광역시 부산진구 가상대로 44",
    phone: "051-0000-0404",
    hours: { weekday: "10:00–20:00", weekend: "11:00–19:00" },
    displayModels: ["d3hs", "dk073w", "d043w"],
  },
  {
    id: "dongseongno",
    name: "동성로 쇼룸",
    region: "대구",
    address: "대구광역시 중구 예시로 55",
    phone: "053-0000-0505",
    hours: { weekday: "10:00–20:00", weekend: "11:00–18:00" },
    displayModels: ["q1w", "dk073w"],
  },
];

export const STORES = z.array(storeSchema).parse(RAW_STORES);

export function storesWithModel(slug: string) {
  return STORES.filter((store) => store.displayModels.includes(slug));
}
