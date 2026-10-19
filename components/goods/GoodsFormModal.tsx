"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { uploadGoodsImage } from "@/lib/services";
import type {
  AdminGoodsDetail,
  CreateGoodsRequest,
  GoodsOptionInput,
  GoodsTaxonomyOptionsResponse,
  UpdateGoodsRequest,
} from "@/lib/types";

/** 등록(POST)·수정(PATCH) 요청 본문. 동기화 상품 수정 때는 options/variants/stock 을 보내지 않는다. */
export type GoodsFormValues = CreateGoodsRequest & Pick<UpdateGoodsRequest, "status">;

/** 할인율 적용 판매가 — 백엔드 Goods.getSalePrice()와 같이 원 단위 미만은 버린다. */
const salePriceOf = (price: number, discountRate: number) =>
  Math.floor((price * (100 - discountRate)) / 100);

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
  taxonomy: GoodsTaxonomyOptionsResponse | null;
  onSubmit: (values: GoodsFormValues) => Promise<void>;
  onClose: () => void;
}

const toId = (value: string) => (value ? Number(value) : null);

export default function GoodsFormModal({ initial, taxonomy, onSubmit, onClose }: GoodsFormModalProps) {
  // 공급처 동기화 상품: 사이즈/재고는 공급처 옵션 번호로 매칭되므로 여기서 바꿀 수 없다.
  const sourceManaged = !!initial?.source;
  const [brandId, setBrandId] = useState<number | null>(initial?.taxonomy?.brandId ?? null);
  const [clubId, setClubId] = useState<number | null>(initial?.taxonomy?.clubId ?? null);
  const [categoryId, setCategoryId] = useState<number | null>(initial?.taxonomy?.categoryId ?? null);
  const [status, setStatus] = useState<"ON_SALE" | "HIDDEN" | "SOURCE_UNAVAILABLE">(initial?.status ?? "ON_SALE");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [discountRate, setDiscountRate] = useState(initial?.discountRate ?? 0);
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
    if (!Number.isInteger(discountRate) || discountRate < 0 || discountRate > 99) {
      setError("할인율은 0~99 사이의 정수로 입력해주세요.");
      return;
    }
    if (!sourceManaged && hasOptions && combos.length === 0) {
      setError("옵션 값을 입력해주세요.");
      return;
    }
    const variants = hasOptions
      ? combos.map((combo) => ({ optionValues: combo, stock: variantStocks[comboKey(combo)] ?? 0 }))
      : undefined;
    // 분류는 바뀐 값만 보낸다 — 상품종류를 보내면 서버가 잠가서 이후 동기화 자동분류가 덮어쓰지 않는다.
    const taxonomyChanges = {
      brandId: brandId !== (initial?.taxonomy?.brandId ?? null) ? brandId : undefined,
      clubId: clubId !== (initial?.taxonomy?.clubId ?? null) ? clubId : undefined,
      categoryId: categoryId !== (initial?.taxonomy?.categoryId ?? null) ? categoryId : undefined,
    };
    const statusChange =
      initial && status !== initial.status && status !== "SOURCE_UNAVAILABLE" ? status : undefined;
    setSubmitting(true);
    try {
      await onSubmit(
        sourceManaged
          ? { name, description, price, discountRate, imageUrls, ...taxonomyChanges, status: statusChange }
          : {
              name,
              description,
              price,
              discountRate,
              stock: hasOptions ? totalVariantStock : stock,
              imageUrls,
              options,
              variants,
              ...taxonomyChanges,
              status: statusChange,
            },
      );
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
          {sourceManaged && (
            <div className="rounded-lg bg-[#f06418]/10 px-3.5 py-3 text-xs leading-relaxed text-ink">
              카포스토어 동기화 상품입니다. 상품명·설명·가격·이미지는 다음 동기화 때 공급처 값으로 돌아가고,
              사이즈별 재고는 동기화가 관리합니다. 할인율·분류·판매상태는 유지됩니다.
              {initial?.sourceUrl && (
                <>
                  {" "}
                  <a href={initial.sourceUrl} target="_blank" rel="noreferrer" className="font-bold underline">
                    공급처 상품 보기
                  </a>
                </>
              )}
              {initial?.sourceSyncedAt && (
                <span className="mt-1 block text-muted">
                  마지막 동기화 {new Date(initial.sourceSyncedAt).toLocaleString("ko-KR")}
                </span>
              )}
            </div>
          )}
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
          <div className={hasOptions ? "grid grid-cols-2 gap-3" : "grid grid-cols-3 gap-3"}>
            <div>
              <label className={labelClass}>가격</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={`${inputClass} w-full`}
              />
            </div>
            <div>
              <label className={labelClass}>할인율 (%)</label>
              <input
                type="number"
                min={0}
                max={99}
                value={discountRate}
                onChange={(e) => setDiscountRate(Number(e.target.value))}
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

          {discountRate > 0 && price > 0 && (
            <p className="-mt-2 text-xs text-muted">
              판매가{" "}
              <span className="font-bold text-ink">{salePriceOf(price, discountRate).toLocaleString()}원</span>
              <span className="ml-1.5 line-through">{price.toLocaleString()}원</span>
            </p>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>브랜드</label>
              <select
                value={brandId ?? ""}
                onChange={(e) => setBrandId(toId(e.target.value))}
                className={`${inputClass} w-full`}
              >
                <option value="">미지정</option>
                {taxonomy?.brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>구단</label>
              <select
                value={clubId ?? ""}
                onChange={(e) => setClubId(toId(e.target.value))}
                className={`${inputClass} w-full`}
              >
                <option value="">미지정</option>
                {taxonomy?.clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.extra ? `${c.name} (${c.extra})` : c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>
                상품종류{initial?.taxonomy?.categoryLocked ? " (고정)" : ""}
              </label>
              <select
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(toId(e.target.value))}
                className={`${inputClass} w-full`}
              >
                <option value="">미지정</option>
                {taxonomy?.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {sourceManaged && !initial?.taxonomy?.categoryLocked && (
            <p className="-mt-2 text-xs text-muted">
              상품종류는 상품명으로 자동 분류됩니다. 직접 바꾸면 이후 동기화가 덮어쓰지 않습니다.
            </p>
          )}

          {initial && (
            <div>
              <label className={labelClass}>판매 상태</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className={`${inputClass} w-full`}
              >
                <option value="ON_SALE">판매중</option>
                <option value="HIDDEN">숨김</option>
                {initial.status === "SOURCE_UNAVAILABLE" && (
                  <option value="SOURCE_UNAVAILABLE" disabled>
                    판매중지(공급처에서 내려가거나 할인 전환)
                  </option>
                )}
              </select>
            </div>
          )}

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

          {sourceManaged && initial && (
            <div>
              <label className={labelClass}>사이즈별 재고 (동기화 관리)</label>
              <div className="flex flex-wrap gap-2">
                {initial.variants.map((v) => (
                  <span
                    key={v.variantId ?? v.optionValues.join("/")}
                    className={`rounded-lg border px-3 py-1.5 text-xs ${
                      v.stock > 0 ? "border-[#dddddd] text-ink" : "border-[#eeeeee] text-[#bbbbbb]"
                    }`}
                  >
                    {v.optionValues.join(" / ") || "기본"} <span className="font-bold">{v.stock}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {!sourceManaged && (
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
          )}

          {!sourceManaged && hasOptions && (
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
