"use client";

import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import MockBanner from "@/components/MockBanner";
import GoodsCard from "@/components/goods/GoodsCard";
import GoodsFormModal, { type GoodsFormValues } from "@/components/goods/GoodsFormModal";
import GoodsSyncPanel from "@/components/goods/GoodsSyncPanel";
import { useAdminSession } from "@/lib/admin-session";
import {
  createGoods,
  deleteGoods,
  getGoods,
  getGoodsList,
  getGoodsTaxonomy,
  updateGoods,
  type GoodsQuery,
} from "@/lib/services";
import type { AdminGoodsDetail, AdminGoodsSummary, GoodsTaxonomyOptionsResponse } from "@/lib/types";

const PAGE_SIZE = 24;

type Filters = Required<Pick<GoodsQuery, "brand" | "club" | "category" | "status" | "source">>;

const EMPTY_FILTERS: Filters = { brand: null, club: null, category: null, status: "", source: "" };

export default function GoodsPage() {
  const { name } = useAdminSession();
  const [goodsList, setGoodsList] = useState<AdminGoodsSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [fromMock, setFromMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [taxonomy, setTaxonomy] = useState<GoodsTaxonomyOptionsResponse | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminGoodsDetail | null>(null);

  const load = useCallback(() => {
    getGoodsList({ keyword, ...filters, page, size: PAGE_SIZE }).then((res) => {
      setGoodsList(res.data.goodsList);
      setTotal(res.data.totalElements);
      setTotalPages(Math.max(res.data.totalPages, 1));
      setFromMock(res.fromMock);
      setLoading(false);
    });
  }, [keyword, filters, page]);

  useEffect(load, [load]);

  const loadTaxonomy = useCallback(() => {
    getGoodsTaxonomy().then((res) => setTaxonomy(res.data));
  }, []);

  useEffect(loadTaxonomy, [loadTaxonomy]);

  const reload = () => {
    setLoading(true);
    load();
  };

  const handleKeywordChange = (value: string) => {
    setLoading(true);
    setPage(1);
    setKeyword(value);
  };

  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setLoading(true);
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (next: number) => {
    setLoading(true);
    setPage(next);
  };

  const handleCreate = async (values: GoodsFormValues) => {
    await createGoods(values);
    setFormOpen(false);
    reload();
  };

  const handleUpdate = async (values: GoodsFormValues) => {
    if (!editTarget) return;
    await updateGoods(editTarget.goodsId, values);
    setEditTarget(null);
    reload();
  };

  const handleEdit = async (id: number) => {
    const res = await getGoods(id);
    setEditTarget(res.data);
  };

  const handleDelete = async (id: number) => {
    await deleteGoods(id);
    reload();
  };

  // 동기화가 끝나면 새 구단/브랜드가 생겼을 수 있으므로 선택지도 다시 읽는다.
  const handleSyncFinished = useCallback(() => {
    loadTaxonomy();
    setLoading(true);
    load();
  }, [load, loadTaxonomy]);

  const selectClass =
    "rounded-lg border border-[#dddddd] bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-[#bbbbbb]";
  const idValue = (v: number | null) => (v == null ? "" : String(v));
  const toId = (v: string) => (v ? Number(v) : null);

  return (
    <>
      <Header title="굿즈관리" userName={name || "관리자"} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-32 pt-6">
        {fromMock && <MockBanner />}

        <GoodsSyncPanel onFinished={handleSyncFinished} />

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink">
            전체 <span className="font-bold">{total}</span>
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-lg border border-[#dddddd] bg-white px-3.5 py-2.5">
              <input
                value={keyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                placeholder="상품명 검색"
                className="w-40 bg-transparent text-sm text-ink outline-none placeholder:text-[#bbbbbb]"
              />
              <Search size={16} className="text-[#888888]" />
            </div>
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#111111] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black"
            >
              <Plus size={16} /> 굿즈 등록
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <select
            aria-label="브랜드"
            value={idValue(filters.brand)}
            onChange={(e) => handleFilterChange("brand", toId(e.target.value))}
            className={selectClass}
          >
            <option value="">브랜드 전체</option>
            {taxonomy?.brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            aria-label="구단"
            value={idValue(filters.club)}
            onChange={(e) => handleFilterChange("club", toId(e.target.value))}
            className={selectClass}
          >
            <option value="">구단 전체</option>
            {taxonomy?.clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.extra ? `${c.name} (${c.extra})` : c.name}
              </option>
            ))}
          </select>
          <select
            aria-label="상품종류"
            value={idValue(filters.category)}
            onChange={(e) => handleFilterChange("category", toId(e.target.value))}
            className={selectClass}
          >
            <option value="">상품종류 전체</option>
            {taxonomy?.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            aria-label="판매 상태"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value as Filters["status"])}
            className={selectClass}
          >
            <option value="">상태 전체</option>
            <option value="ON_SALE">판매중</option>
            <option value="HIDDEN">숨김</option>
            <option value="SOURCE_UNAVAILABLE">판매중지(공급처)</option>
          </select>
          <select
            aria-label="등록 방식"
            value={filters.source}
            onChange={(e) => handleFilterChange("source", e.target.value as Filters["source"])}
            className={selectClass}
          >
            <option value="">등록 방식 전체</option>
            <option value="CAPOSTORE">카포스토어 동기화</option>
            <option value="MANUAL">직접 등록</option>
          </select>
        </div>

        {loading ? (
          <GoodsGridSkeleton />
        ) : goodsList.length === 0 ? (
          <div className="rounded-2xl border border-[#eeeeee] bg-white py-20 text-center text-sm text-muted">
            등록된 굿즈가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {goodsList.map((g) => (
              <GoodsCard key={g.goodsId} goods={g} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-ink">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              aria-label="이전 페이지"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dddddd] bg-white disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              <span className="font-bold">{page}</span> / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="다음 페이지"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dddddd] bg-white disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>

      {formOpen && (
        <GoodsFormModal taxonomy={taxonomy} onSubmit={handleCreate} onClose={() => setFormOpen(false)} />
      )}
      {editTarget && (
        <GoodsFormModal
          initial={editTarget}
          taxonomy={taxonomy}
          onSubmit={handleUpdate}
          onClose={() => setEditTarget(null)}
        />
      )}
    </>
  );
}

function GoodsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-56 animate-pulse rounded-2xl border border-[#eeeeee] bg-white/60" />
      ))}
    </div>
  );
}
