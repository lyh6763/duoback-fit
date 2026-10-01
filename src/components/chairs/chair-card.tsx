"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CompareIconToggle } from "@/components/compare/compare-toggle";
import { ScoreBadge } from "@/components/data/score-badge";
import type { Chair } from "@/lib/chairs/schema";
import {
  CATEGORY_LABEL,
  chairImage,
  formatPrice,
  recommendedHeightRange,
} from "@/lib/chairs/format";
import { ColorSwatches } from "./color-swatches";

/**
 * 카드 전체를 링크로 감싸지 않는다. 링크는 이미지와 모델명에만 두고
 * 색상 스와치는 독립 버튼으로 둔다(중첩 인터랙션 방지).
 */
export function ChairCard({
  chair,
  score,
  priority = false,
}: {
  chair: Chair;
  score?: number;
  priority?: boolean;
}) {
  const [color, setColor] = useState(chair.colors[0].slug);
  const colorName = chair.colors.find((c) => c.slug === color)?.name;
  const heights = recommendedHeightRange(chair.spec);
  const href = `/chairs/${chair.slug}`;

  return (
    <article className="group flex flex-col gap-3">
      <div className="relative">
        <Link href={href} className="block overflow-hidden rounded-lg bg-photo" tabIndex={-1} aria-hidden="true">
          <Image
            src={chairImage(chair, color)}
            alt=""
            width={600}
            height={600}
            sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
            priority={priority}
            className="aspect-square w-full object-cover transition-transform duration-300 ease-standard group-hover:scale-[1.03]"
          />
        </Link>
        {score !== undefined && (
          <span className="absolute top-3 left-3">
            <ScoreBadge score={score} />
          </span>
        )}
        <span className="absolute top-2 right-2">
          <CompareIconToggle slug={chair.slug} name={chair.name} />
        </span>
      </div>

      <ColorSwatches colors={chair.colors} value={color} onChange={setColor} size="s" />

      <div className="space-y-1">
        <h3 className="text-lg font-semibold">
          <Link href={href} className="hover:underline hover:underline-offset-4">
            {chair.name}
            <span className="sr-only"> {colorName}</span>
          </Link>
        </h3>
        <p className="text-sm text-muted">
          {CATEGORY_LABEL[chair.category]} · 키 <span className="tabular-nums">{heights.min}~{heights.max}cm</span>
        </p>
        <p className="font-semibold tabular-nums">{formatPrice(chair.price)}</p>
      </div>
    </article>
  );
}
