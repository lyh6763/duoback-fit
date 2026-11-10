import type { Metadata } from "next";

export const SITE_NAME = "DUOBACK Fit";
export const DEFAULT_TITLE = "DUOBACK Fit — 내 몸에 맞는 의자 찾기";
export const DEFAULT_DESCRIPTION = "키, 체중, 앉는 시간을 알려주면 내 몸에 맞는 의자와 그 이유를 알려드려요.";

/** layout과 모든 페이지가 함께 쓰는 Open Graph 필드 */
export const SHARED_OPEN_GRAPH = { siteName: SITE_NAME, locale: "ko_KR", type: "website" } as const;

/** 사이트 공유 이미지(app/opengraph-image.tsx가 만든다) */
export const SITE_OG_IMAGE_ALT = "DUOBACK Fit — 키와 앉는 습관으로 내 몸에 맞는 의자를 찾는 서비스";
const SITE_OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: SITE_OG_IMAGE_ALT };

type PageMetadataInput = {
  /** 탭 제목. layout의 "%s | DUOBACK Fit" 템플릿이 붙는다. 생략하면 기본 제목을 쓴다(홈). */
  title?: string;
  /** 생략하면 layout의 설명을 물려받는다. */
  description?: string;
  /** 사이트 안 경로. canonical과 og:url에 쓴다(metadataBase 기준). */
  path: string;
  /** 사람마다 내용이 다른 페이지는 false: 검색에서 빼고 canonical을 달지 않는다. */
  index?: boolean;
  /**
   * 같은 폴더에 opengraph-image.tsx가 있으면 true. 그때는 사이트 공유 이미지를 넣지 않는다
   * (넣으면 설정 쪽 images가 그 segment의 파일 기반 이미지를 덮는다. 11/10 빌드 결과로 확인).
   */
  ownOgImage?: boolean;
};

/**
 * 페이지 메타데이터.
 * Next는 segment 사이 메타데이터를 얕게 병합한다. 그래서 페이지가 openGraph를 정하면 layout의
 * openGraph(siteName·locale·type, 루트 opengraph-image)가 통째로 사라진다. 공통 필드와 사이트
 * 공유 이미지를 여기서 함께 넣는 이유다.
 */
export function pageMetadata({ title, description, path, index = true, ownOgImage = false }: PageMetadataInput): Metadata {
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(index ? { alternates: { canonical: path } } : { robots: { index: false } }),
    openGraph: {
      ...SHARED_OPEN_GRAPH,
      // openGraph를 정하지 않을 때 Next가 채우던 값(템플릿이 붙은 탭 제목)과 같게 둔다
      title: title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE,
      description: description ?? DEFAULT_DESCRIPTION,
      url: path,
      ...(ownOgImage ? {} : { images: [SITE_OG_IMAGE] }),
    },
  };
}
