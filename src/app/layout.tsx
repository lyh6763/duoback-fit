import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import localFont from "next/font/local";
import { CompareTray } from "@/components/compare/compare-tray";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Toaster } from "@/components/site/toaster";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

// 본문 서체. 사이트에 나오는 글자만 남긴 Pretendard 가변 폰트 파일 하나(약 80KB)를 preload한다.
// 글자가 바뀌면 `npm run build && npm run fonts:web`으로 다시 만든다(CI가 빠진 글자를 검사한다).
// optional: 첫 화면까지 폰트가 오지 않으면 시스템 서체로 그리고 바꾸지 않는다(깜빡임·폰트 대기 없음). 다음 방문부터는 캐시에서 바로 쓴다.
const pretendard = localFont({
  src: "./fonts/pretendard-site.woff2",
  variable: "--font-pretendard",
  weight: "400 700",
  display: "optional",
  adjustFontFallback: false,
});

// 숫자·영문 강조 전용 디스플레이 서체. 한글은 Pretendard(globals.css)로 렌더링된다.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DUOBACK Fit — 내 몸에 맞는 의자 찾기",
    template: "%s | DUOBACK Fit",
  },
  description: "키, 체중, 앉는 시간을 알려주면 내 몸에 맞는 의자와 그 이유를 알려드려요.",
  openGraph: { siteName: "DUOBACK Fit", locale: "ko_KR", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${fraunces.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2 focus:text-inverse"
        >
          본문으로 건너뛰기
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <CompareTray />
        <Toaster />
      </body>
    </html>
  );
}
