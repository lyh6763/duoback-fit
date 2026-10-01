import { z } from "zod";
import { chairSchema } from "@/lib/chairs/schema";

/**
 * 포트폴리오용 가상 데이터. 실제 제품 스펙과 무관하다.
 * 스펙은 스튜디오 사진(public/images/chairs)에 보이는 구조에 맞춰 작성했다.
 * 이미지 규칙: /images/chairs/{slug}-{color.slug}-{angle}.jpg
 */
const RAW_CHAIRS = [
  {
    slug: "q1w",
    name: "Q1W 메쉬",
    category: "office",
    price: 890000,
    releaseDate: "2024-10-18",
    summary: "통기성 좋은 메쉬 등판과 조절형 요추 패드로 긴 업무 시간을 받쳐주는 오피스 체어.",
    highlights: [
      { title: "조절형 요추 패드", body: "허리 곡선에 맞춰 패드 높이를 올리고 내릴 수 있어요." },
      { title: "4D 팔걸이", body: "높이, 앞뒤, 좌우, 각도를 조절해 어깨 긴장을 줄여요." },
      { title: "좌판 깊이 조절", body: "허벅지 길이에 맞춰 좌판을 앞뒤로 옮길 수 있어요." },
    ],
    colors: [
      { name: "블랙", hex: "#1F1F1F", slug: "black" },
      { name: "그레이", hex: "#9E9E9E", slug: "gray" },
    ],
    spec: {
      seatHeightMm: { min: 420, max: 520 },
      seatDepthAdjust: true,
      backHeightMm: 700,
      sizeMm: { w: 670, d: 670, h: { min: 1200, max: 1300 } },
      maxWeightKg: 120,
      armrest: "4d",
      headrest: true,
      lumbar: "adjustable",
      tilt: "synchro",
      backMaterial: "mesh",
      seatMaterial: "mesh",
      base: "nylon",
      warrantyYears: 3,
    },
  },
  {
    slug: "d3hs",
    name: "D3-HS 메쉬",
    category: "office",
    price: 780000,
    releaseDate: "2024-09-02",
    summary: "가벼운 메쉬 하이백에 헤드레스트를 더한, 균형 잡힌 기본형 오피스 체어.",
    highlights: [
      { title: "메쉬 하이백", body: "등 전체를 감싸면서도 열이 차지 않아요." },
      { title: "조절형 헤드레스트", body: "목 높이에 맞춰 각도와 높이를 바꿀 수 있어요." },
      { title: "3D 팔걸이", body: "높이, 앞뒤, 각도를 조절할 수 있어요." },
    ],
    colors: [
      { name: "블랙", hex: "#1F1F1F", slug: "black" },
      { name: "화이트", hex: "#F2F0EC", slug: "white" },
    ],
    spec: {
      seatHeightMm: { min: 425, max: 525 },
      seatDepthAdjust: false,
      backHeightMm: 680,
      sizeMm: { w: 680, d: 680, h: { min: 1180, max: 1280 } },
      maxWeightKg: 120,
      armrest: "3d",
      headrest: true,
      lumbar: "adjustable",
      tilt: "synchro",
      backMaterial: "mesh",
      seatMaterial: "fabric",
      base: "nylon",
      warrantyYears: 3,
    },
  },
  {
    slug: "d2500g",
    name: "D2500G-DASW",
    category: "office",
    price: 950000,
    releaseDate: "2024-11-22",
    summary: "듀얼백 등판과 헤드레스트, 4D 팔걸이를 모두 갖춘 라인업의 최상위 모델.",
    highlights: [
      { title: "듀얼백 등판", body: "좌우 등판이 따로 움직여 척추를 양쪽에서 받쳐줘요." },
      { title: "130kg 하중", body: "라인업 중 가장 높은 하중을 견뎌요." },
      { title: "좌판 깊이 조절", body: "키가 큰 사용자도 허벅지를 충분히 받칠 수 있어요." },
    ],
    colors: [
      { name: "블랙", hex: "#1F1F1F", slug: "black" },
      { name: "그레이", hex: "#9E9E9E", slug: "gray" },
    ],
    spec: {
      seatHeightMm: { min: 440, max: 540 },
      seatDepthAdjust: true,
      backHeightMm: 720,
      sizeMm: { w: 690, d: 690, h: { min: 1220, max: 1320 } },
      maxWeightKg: 130,
      armrest: "4d",
      headrest: true,
      lumbar: "dualback",
      tilt: "synchro",
      backMaterial: "fabric",
      seatMaterial: "fabric",
      base: "nylon",
      warrantyYears: 3,
    },
  },
  {
    slug: "dk073w",
    name: "DK-073W",
    category: "student",
    price: 650000,
    releaseDate: "2024-07-05",
    summary: "캔틸레버 프레임이 살짝 흔들리며 몸을 받아주는 듀얼백 학습 의자.",
    highlights: [
      { title: "듀얼백 등판", body: "좌우 등판이 등을 양쪽에서 받쳐 바른 자세를 도와요." },
      { title: "캔틸레버 프레임", body: "바퀴 대신 탄성 있는 프레임으로 자리에서 밀리지 않아요." },
      { title: "높이 고정형", body: "높이 조절 장치가 없어 아이가 장난치기 어려워요." },
    ],
    colors: [
      { name: "블랙", hex: "#1F1F1F", slug: "black" },
      { name: "블루", hex: "#4A6FA5", slug: "blue" },
    ],
    spec: {
      seatHeightMm: { min: 440, max: 440 },
      seatDepthAdjust: false,
      backHeightMm: 480,
      sizeMm: { w: 600, d: 580, h: { min: 900, max: 900 } },
      maxWeightKg: 100,
      armrest: "fixed",
      headrest: false,
      lumbar: "dualback",
      tilt: "none",
      backMaterial: "fabric",
      seatMaterial: "fabric",
      base: "cantilever",
      warrantyYears: 3,
    },
  },
  {
    slug: "d043w",
    name: "D-043W PLUS",
    category: "student",
    price: 520000,
    releaseDate: "2023-12-12",
    summary: "썰매형 프레임에 듀얼백을 얹은, 가볍고 단순한 학습 의자.",
    highlights: [
      { title: "듀얼백 등판", body: "작은 체구에 맞춘 등판이 허리를 받쳐줘요." },
      { title: "썰매형 프레임", body: "바닥에 닿는 면이 넓어 안정적이에요." },
      { title: "낮은 좌판", body: "키 150cm대 학생에게 맞춘 좌판 높이예요." },
    ],
    colors: [
      { name: "블랙", hex: "#1F1F1F", slug: "black" },
      { name: "블루", hex: "#4A6FA5", slug: "blue" },
    ],
    spec: {
      seatHeightMm: { min: 420, max: 420 },
      seatDepthAdjust: false,
      backHeightMm: 460,
      sizeMm: { w: 580, d: 560, h: { min: 860, max: 860 } },
      maxWeightKg: 100,
      armrest: "fixed",
      headrest: false,
      lumbar: "dualback",
      tilt: "none",
      backMaterial: "fabric",
      seatMaterial: "fabric",
      base: "sled",
      warrantyYears: 3,
    },
  },
];

export const CHAIRS = z.array(chairSchema).parse(RAW_CHAIRS);

export function getChair(slug: string) {
  return CHAIRS.find((chair) => chair.slug === slug);
}
