"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { AdminGoodsSummary } from "@/lib/types";

const MENU_ITEMS = ["수정", "삭제"] as const;

export default function GoodsCard({
  goods,
  onEdit,
  onDelete,
}: {
  goods: AdminGoodsSummary;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const onMenuSelect = (item: (typeof MENU_ITEMS)[number]) => {
    setMenuOpen(false);
    if (item === "수정") onEdit(goods.goodsId);
    else if (item === "삭제") {
      if (confirm(`"${goods.name}" 상품을 삭제하시겠습니까?`)) onDelete(goods.goodsId);
    }
  };

  return (
    <div className="relative rounded-2xl border border-[#eeeeee] bg-white p-5">
      <div className="flex items-start justify-between">
        <span className="text-sm text-ink">
          번호. <span className="font-bold">{goods.goodsId}</span>
        </span>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="굿즈 메뉴"
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
              menuOpen
                ? "border-transparent bg-[#111111] text-white"
                : "border-[#dddddd] text-[#888888] hover:border-[#bbbbbb]"
            }`}
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-30 mt-1.5 w-32 overflow-hidden rounded-lg border border-[#dddddd] bg-white py-1 shadow-lg">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item}
                  onClick={() => onMenuSelect(item)}
                  className="block w-full px-4 py-2.5 text-left text-sm text-ink transition hover:bg-[#111111] hover:text-white"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {goods.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={goods.thumbnailUrl}
          alt={goods.name}
          className="mt-3 h-32 w-full rounded-xl object-cover"
        />
      )}

      <h3 className="mt-3 text-base font-extrabold text-ink">{goods.name}</h3>

      <p className="mt-1.5 text-sm text-ink">
        {goods.price.toLocaleString()}원
        {goods.isSoldOut && (
          <span className="ml-3 rounded-full bg-[#da1d52]/10 px-2 py-0.5 text-xs font-bold text-[#da1d52]">
            품절
          </span>
        )}
      </p>

      <div className="mt-5 flex items-stretch border-t border-[#f0f0f0] pt-4">
        <div className="flex-1">
          <p className="text-[11px] text-muted">재고</p>
          <p className="mt-1 text-xl font-black leading-none text-ink">
            {goods.stock}
            <span className="ml-0.5 text-[11px] font-normal text-muted">개</span>
          </p>
        </div>
      </div>
    </div>
  );
}
