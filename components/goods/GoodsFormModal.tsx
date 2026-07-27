"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { AdminGoodsDetail, GoodsOptionInput } from "@/lib/types";

export interface GoodsFormValues {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrls: string[];
  options: GoodsOptionInput[];
}

interface GoodsFormModalProps {
  initial?: AdminGoodsDetail | null;
  onSubmit: (values: GoodsFormValues) => Promise<void>;
  onClose: () => void;
}

export default function GoodsFormModal({ initial, onSubmit, onClose }: GoodsFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [imageUrls, setImageUrls] = useState<string[]>(initial?.imageUrls ?? []);
  const [imageInput, setImageInput] = useState("");
  const [options, setOptions] = useState<GoodsOptionInput[]>(
    initial?.options.map((o) => ({ name: o.name, values: [...o.values] })) ?? [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-lg border border-[#dddddd] bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-[#bbbbbb]";
  const labelClass = "mb-1.5 block text-xs font-bold text-muted";

  const addImage = () => {
    if (!imageInput.trim()) return;
    setImageUrls((prev) => [...prev, imageInput.trim()]);
    setImageInput("");
  };

  const addOption = () => setOptions((prev) => [...prev, { name: "", values: [] }]);

  const updateOptionName = (i: number, value: string) => {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, name: value } : o)));
  };

  const updateOptionValues = (i: number, raw: string) => {
    const values = raw
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, values } : o)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || price <= 0) {
      setError("상품명과 가격을 확인해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ name, description, price, stock, imageUrls, options });
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <h3 className="text-base font-extrabold text-ink">{initial ? "굿즈 수정" : "굿즈 등록"}</h3>
          <button onClick={onClose} aria-label="닫기" className="text-ink hover:text-brand-strong">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          <div>
            <label className={labelClass}>상품명</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>상세 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>가격</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>재고</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>이미지 URL</label>
            <div className="flex gap-2">
              <input
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="https://..."
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={addImage}
                className="rounded-lg border border-[#dddddd] px-3 text-sm font-bold text-ink hover:border-[#bbbbbb]"
              >
                추가
              </button>
            </div>
            {imageUrls.length > 0 && (
              <ul className="mt-2 space-y-1">
                {imageUrls.map((url, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted">
                    <span className="flex-1 truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => setImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-[#bbbbbb] hover:text-[#da1d52]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold text-muted">옵션 (예: 사이즈)</label>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-1 text-xs font-bold text-ink hover:text-brand-strong"
              >
                <Plus size={14} /> 옵션 추가
              </button>
            </div>
            <div className="space-y-2">
              {options.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={option.name}
                    onChange={(e) => updateOptionName(i, e.target.value)}
                    placeholder="옵션명 (예: 사이즈)"
                    className={`${inputClass} w-28`}
                  />
                  <input
                    value={option.values.join(", ")}
                    onChange={(e) => updateOptionValues(i, e.target.value)}
                    placeholder="값 (쉼표로 구분, 예: M, L, XL)"
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))}
                    aria-label="옵션 삭제"
                    className="shrink-0 text-[#bbbbbb] hover:text-[#da1d52]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-[#da1d52]">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#111111] py-4 text-sm font-extrabold text-white transition hover:bg-black active:scale-[0.99] disabled:opacity-60"
          >
            {submitting ? "저장 중..." : initial ? "수정하기" : "등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
