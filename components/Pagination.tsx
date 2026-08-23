"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  /** 1-base 현재 페이지 */
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** 페이지 번호 목록을 만든다. 현재 페이지 주변 ±2, 처음/끝은 항상 노출하고 나머지는 "…"로 생략. */
function buildPageList(page: number, totalPages: number): (number | "ellipsis")[] {
  const pages = new Set<number>([1, totalPages]);
  for (let p = page - 2; p <= page + 2; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = Array.from(pages).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("ellipsis");
    result.push(p);
  });
  return result;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const buttonClass =
    "flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav className="mt-6 flex items-center justify-center gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="이전 페이지"
        className={`${buttonClass} border border-[#dddddd] bg-white text-ink hover:border-[#bbbbbb]`}
      >
        <ChevronLeft size={15} />
      </button>

      {buildPageList(page, totalPages).map((p, i) =>
        p === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="flex h-8 min-w-8 items-center justify-center text-sm text-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${buttonClass} ${
              p === page
                ? "bg-[#111111] text-white"
                : "border border-[#dddddd] bg-white text-ink hover:border-[#bbbbbb]"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="다음 페이지"
        className={`${buttonClass} border border-[#dddddd] bg-white text-ink hover:border-[#bbbbbb]`}
      >
        <ChevronRight size={15} />
      </button>
    </nav>
  );
}
