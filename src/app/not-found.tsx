import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="page-container">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 py-24 text-center">
        <p className="font-display text-5xl text-primary">404</p>
        <h1 className="text-2xl font-bold">찾는 페이지가 없어요</h1>
        <p className="text-muted">주소가 바뀌었거나 없는 페이지예요.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonClass({ variant: "secondary" })}>
            홈으로
          </Link>
          <Link href="/chairs" className={buttonClass({ variant: "secondary" })}>
            의자 보기
          </Link>
          <Link href="/fit" className={buttonClass()}>
            내 의자 찾기
          </Link>
        </div>
      </div>
    </div>
  );
}
