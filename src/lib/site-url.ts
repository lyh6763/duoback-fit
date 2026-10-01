/**
 * 사이트 절대 URL. metadataBase, sitemap, robots, OG 이미지 주소에 쓰인다.
 * 1. NEXT_PUBLIC_SITE_URL — 커스텀 도메인을 쓸 때 직접 지정
 * 2. VERCEL_PROJECT_PRODUCTION_URL — Vercel이 빌드 때 자동으로 넣어주는 운영 도메인(프로토콜 없음)
 * 3. 로컬 개발 서버
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
