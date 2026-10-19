import type {
  AdminGoodsDetail,
  AdminGoodsListResponse,
  AdminGoodsSummary,
  GoodsSyncRunListResponse,
  GoodsTaxonomyOptionsResponse,
} from "../types";

const NAMES = ["레미콘 한정판 후드티", "공식 응원봉 (버전 2)", "레미 머플러", "시즌 유니폼", "레미 키링"];

function makeGoods(id: number): AdminGoodsSummary {
  return {
    goodsId: id,
    name: NAMES[id % NAMES.length],
    price: 15000 + (id % 4) * 10000,
    discountRate: id % 3 === 0 ? 10 : 0,
    salePrice: id % 3 === 0 ? Math.floor((15000 + (id % 4) * 10000) * 0.9) : 15000 + (id % 4) * 10000,
    stock: id % 6 === 0 ? 0 : 20 + (id % 5) * 10,
    thumbnailUrl: `https://image.domain.com/goods_${id}.png`,
    isSoldOut: id % 6 === 0,
    status: id % 7 === 0 ? "HIDDEN" : "ON_SALE",
    source: id % 2 === 0 ? "CAPOSTORE" : null,
    taxonomy: {
      brandId: 1,
      brandName: "아디다스",
      clubId: 1,
      clubName: "리버풀",
      categoryId: 1,
      categoryName: "유니폼",
      categoryLocked: false,
    },
  };
}

const list: AdminGoodsSummary[] = Array.from({ length: 12 }, (_, i) => makeGoods(501 + i));

export const mockGoodsList: AdminGoodsListResponse = {
  totalElements: 12,
  totalPages: 1,
  goodsList: list,
};

export const mockGoodsDetail: AdminGoodsDetail = {
  goodsId: 501,
  name: "레미콘 한정판 후드티",
  description: "2026 레미콘을 기념하는 최고급 면 소재의 한정판 후드티입니다.",
  price: 45000,
  discountRate: 10,
  salePrice: 40500,
  stock: 120,
  imageUrls: [
    "https://image.domain.com/goods_501_main.png",
    "https://image.domain.com/goods_501_detail.png",
  ],
  options: [{ optionId: 1, name: "사이즈", values: ["M", "L", "XL"] }],
  variants: [
    { variantId: 1, optionValues: ["M"], stock: 40 },
    { variantId: 2, optionValues: ["L"], stock: 40 },
    { variantId: 3, optionValues: ["XL"], stock: 40 },
  ],
  status: "ON_SALE",
  source: null,
  sourceUrl: null,
  sourceSyncedAt: null,
  taxonomy: null,
};

export const mockGoodsTaxonomy: GoodsTaxonomyOptionsResponse = {
  brands: [
    { id: 1, name: "아디다스", extra: null },
    { id: 2, name: "나이키", extra: null },
  ],
  clubs: [
    { id: 1, name: "리버풀", extra: "프리미어리그" },
    { id: 2, name: "레알 마드리드", extra: "라리가" },
  ],
  categories: [
    { id: 1, name: "유니폼", extra: "UNIFORM" },
    { id: 2, name: "트레이닝", extra: "TRAINING" },
    { id: 8, name: "기타", extra: "ETC" },
  ],
};

export const mockGoodsSyncRuns: GoodsSyncRunListResponse = {
  totalElements: 1,
  runs: [
    {
      runId: 1,
      source: "CAPOSTORE",
      triggerType: "GITHUB",
      status: "SUCCEEDED",
      startedAt: "2026-10-19T06:00:00+09:00",
      finishedAt: "2026-10-19T06:41:00+09:00",
      seenCount: 455,
      createdCount: 194,
      updatedCount: 0,
      unavailableCount: 0,
      skippedCount: 261,
      failedCount: 0,
      message: null,
    },
  ],
};
