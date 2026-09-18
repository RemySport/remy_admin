"use client";

import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MockBanner from "@/components/MockBanner";
import GoodsCard from "@/components/goods/GoodsCard";
import GoodsFormModal, { type GoodsFormValues } from "@/components/goods/GoodsFormModal";
import { useAdminSession } from "@/lib/admin-session";
import {
  createGoods,
  deleteGoods,
  getGoods,
  getGoodsList,
  updateGoods,
} from "@/lib/services";
import type { AdminGoodsDetail, AdminGoodsSummary } from "@/lib/types";

export default function GoodsPage() {
  const { name } = useAdminSession();
  const [goodsList, setGoodsList] = useState<AdminGoodsSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [fromMock, setFromMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminGoodsDetail | null>(null);

  const load = () => {
    getGoodsList({ keyword }).then((res) => {
      setGoodsList(res.data.goodsList);
      setTotal(res.data.totalElements);
      setFromMock(res.fromMock);
      setLoading(false);
    });
  };

  useEffect(load, [keyword]);

  const handleKeywordChange = (value: string) => {
    setLoading(true);
    setKeyword(value);
  };

  const handleCreate = async (values: GoodsFormValues) => {
    await createGoods(values);
    setFormOpen(false);
    setLoading(true);
    load();
  };

  const handleUpdate = async (values: GoodsFormValues) => {
    if (!editTarget) return;
    await updateGoods(editTarget.goodsId, values);
    setEditTarget(null);
    setLoading(true);
    load();
  };

  const handleEdit = async (id: number) => {
    const res = await getGoods(id);
    setEditTarget(res.data);
  };

  const handleDelete = async (id: number) => {
    await deleteGoods(id);
    setLoading(true);
    load();
  };

  return (
    <>
      <Header title="굿즈관리" userName={name || "관리자"} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-32 pt-6">
        {fromMock && <MockBanner />}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
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
      </main>

      {formOpen && (
        <GoodsFormModal onSubmit={handleCreate} onClose={() => setFormOpen(false)} />
      )}
      {editTarget && (
        <GoodsFormModal
          initial={editTarget}
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
