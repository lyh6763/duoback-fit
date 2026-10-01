import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChairCard } from "@/components/chairs/chair-card";
import { ChairOverview } from "@/components/chairs/chair-overview";
import { SpecTable } from "@/components/chairs/spec-table";
import { CHAIRS, getChair } from "@/data/chairs";
import { CATEGORY_LABEL, chairImage } from "@/lib/chairs/format";

// 데이터에 없는 slug는 빌드 시 만들지 않고 404로 보낸다
export const dynamicParams = false;

export function generateStaticParams() {
  return CHAIRS.map((chair) => ({ slug: chair.slug }));
}

export async function generateMetadata(props: PageProps<"/chairs/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const chair = getChair(slug);
  if (!chair) return {};
  // og:image는 같은 폴더의 opengraph-image.tsx가 자동으로 채운다
  return {
    title: chair.name,
    description: chair.summary,
    alternates: { canonical: `/chairs/${chair.slug}` },
    openGraph: { title: chair.name, description: chair.summary },
  };
}

export default async function ChairPage(props: PageProps<"/chairs/[slug]">) {
  const { slug } = await props.params;
  const chair = getChair(slug);
  if (!chair) notFound();

  const related = CHAIRS.filter((c) => c.slug !== chair.slug)
    .sort((a, b) => Number(b.category === chair.category) - Number(a.category === chair.category))
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: chair.name,
    description: chair.summary,
    category: `${CATEGORY_LABEL[chair.category]} 의자`,
    image: chair.colors.map((color) => chairImage(chair, color.slug)),
    color: chair.colors.map((color) => color.name).join(", "),
  };

  return (
    <div className="page-container space-y-20 py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="space-y-6">
        <nav aria-label="현재 위치" className="text-sm text-muted">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href="/chairs" className="hover:text-ink hover:underline">
                의자
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/chairs?category=${chair.category}`} className="hover:text-ink hover:underline">
                {CATEGORY_LABEL[chair.category]}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              {chair.name}
            </li>
          </ol>
        </nav>
        <ChairOverview key={chair.slug} chair={chair} />
      </div>

      <section aria-labelledby="highlights-title" className="space-y-8">
        <h2 id="highlights-title" className="text-2xl font-bold tracking-tight">
          이런 점이 달라요
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {chair.highlights.map((item, index) => (
            <li key={item.title} className="rounded-lg bg-elevated p-6">
              <p className="font-display text-xl text-primary">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="spec-title" className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-2">
          <h2 id="spec-title" className="text-2xl font-bold tracking-tight">
            사양
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            숫자 옆에 몸 기준으로 풀어 쓴 설명을 함께 적었어요. 권장 키는 좌판 높이로 계산한 참고값이에요.
          </p>
        </div>
        <SpecTable chair={chair} />
      </section>

      <section aria-labelledby="related-title" className="space-y-8">
        <h2 id="related-title" className="text-2xl font-bold tracking-tight">
          함께 보면 좋은 의자
        </h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6">
          {related.map((item) => (
            <ChairCard key={item.slug} chair={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
