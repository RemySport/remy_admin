import type { AdminGoodsDetail, AdminGoodsListResponse, AdminGoodsSummary } from "../types";

const NAMES = ["레미콘 한정판 후드티", "공식 응원봉 (버전 2)", "레미 머플러", "시즌 유니폼", "레미 키링"];

function makeGoods(id: number): AdminGoodsSummary {
  return {
    goodsId: id,
    name: NAMES[id % NAMES.length],
    price: 15000 + (id % 4) * 10000,
    stock: id % 6 === 0 ? 0 : 20 + (id % 5) * 10,
    thumbnailUrl: `https://image.domain.com/goods_${id}.png`,
    isSoldOut: id % 6 === 0,
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
  stock: 120,
  imageUrls: [
    "https://image.domain.com/goods_501_main.png",
    "https://image.domain.com/goods_501_detail.png",
  ],
  options: [{ optionId: 1, name: "사이즈", values: ["M", "L", "XL"] }],
};
