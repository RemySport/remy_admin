"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { uploadGoodsImage } from "@/lib/services";
import type { AdminGoodsDetail, GoodsOptionInput, GoodsVariantInput } from "@/lib/types";

export interface GoodsFormValues {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrls: string[];
  options: GoodsOptionInput[];
  variants?: GoodsVariantInput[];
}

/** 옵션 값 조합(예: ["M"], ["M", "블랙"])을 재고 맵의 키로 바꾼다. */
const comboKey = (combo: string[]) => combo.join("␟");

/** 현재 옵션들의 값으로 만들 수 있는 모든 조합(카티전곱). 값이 비어있는 옵션이 하나라도 있으면 조합이 없다. */
function buildCombos(options: GoodsOptionInput[]): string[][] {
  if (options.length === 0 || options.some((o) => o.values.length === 0)) return [];
  return options.reduce<string[][]>(
    (combos, option) => combos.flatMap((prefix) => option.values.map((v) => [...prefix, v])),
    [[]],
  );
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [options, setOptions] = useState<GoodsOptionInput[]>(
    initial?.options.map((o) => ({ name: o.name, values: [...o.values] })) ?? [],
  );
  const [variantStocks, setVariantStocks] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    initial?.variants.forEach((v) => {
      map[comboKey(v.optionValues)] = v.stock;
    });
    return map;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasOptions = options.length > 0;
  const combos = useMemo(() => buildCombos(options), [options]);
  const totalVariantStock = combos.reduce((sum, c) => sum + (variantStocks[comboKey(c)] ?? 0), 0);

  const updateVariantStock = (combo: string[], value: number) => {
    setVariantStocks((prev) => ({ ...prev, [comboKey(combo)]: value }));
  };

  const inputClass =
    "rounded-lg border border-[#dddddd] bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-[#bbbbbb]";
  const labelClass = "mb-1.5 block text-xs font-bold text-muted";

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) => uploadGoodsImage(file)),
      );
      setImageUrls((prev) => [...prev, ...uploaded.map((r) => r.url)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
    if (hasOptions && combos.length === 0) {
      setError("옵션 값을 입력해주세요.");
      return;
    }
    const variants = hasOptions
      ? combos.map((combo) => ({ optionValues: combo, stock: variantStocks[comboKey(combo)] ?? 0 }))
      : undefined;
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        description,
        price,
        stock: hasOptions ? totalVariantStock : stock,
        imageUrls,
        options,
        variants,
      });
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
            <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} w-full`} />
          </div>
          <div>
            <label className={labelClass}>상세 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputClass} w-full`}
            />
          </div>
          <div className={hasOptions ? "" : "grid grid-cols-2 gap-3"}>
            <div>
              <label className={labelClass}>가격</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={`${inputClass} w-full`}
              />
            </div>
            {!hasOptions && (
              <div>
                <label className={labelClass}>재고</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className={`${inputClass} w-full`}
                />
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>이미지</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={(e) => handleFilesSelected(e.target.files)}
              disabled={uploading}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border file:border-[#dddddd] file:bg-white file:px-3 file:py-2 file:text-sm file:font-bold file:text-ink hover:file:border-[#bbbbbb] disabled:opacity-60"
            />
            {uploading && <p className="mt-1.5 text-xs text-muted">업로드 중...</p>}
            {imageUrls.length > 0 && (
              <ul className="mt-2 grid grid-cols-4 gap-2">
                {imageUrls.map((url, i) => (
                  <li key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-[#eeeeee]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                      aria-label="이미지 삭제"
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100 hover:bg-[#da1d52]"
                    >
                      <Trash2 size={12} />
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

          {hasOptions && (
            <div>
              <label className={labelClass}>옵션별 재고</label>
              {combos.length === 0 ? (
                <p className="text-xs text-muted">옵션 값을 입력하면 조합별로 재고를 입력할 수 있어요.</p>
              ) : (
                <div className="space-y-2">
                  {combos.map((combo) => {
                    const key = comboKey(combo);
                    const label = combo
                      .map((value, i) => `${options[i]?.name || "옵션"}: ${value}`)
                      .join(" / ");
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[#eeeeee] px-3.5 py-2.5"
                      >
                        <span className="text-sm text-ink">{label}</span>
                        <input
                          type="number"
                          min={0}
                          value={variantStocks[key] ?? 0}
                          onChange={(e) => updateVariantStock(combo, Number(e.target.value))}
                          className={`${inputClass} w-24 text-right`}
                        />
                      </div>
                    );
                  })}
                  <p className="text-right text-xs text-muted">합계 재고 {totalVariantStock}개</p>
                </div>
              )}
            </div>
          )}

          {error && <p className="text-sm text-[#da1d52]">{error}</p>}

          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full rounded-xl bg-[#111111] py-4 text-sm font-extrabold text-white transition hover:bg-black active:scale-[0.99] disabled:opacity-60"
          >
            {submitting ? "저장 중..." : initial ? "수정하기" : "등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
