import type {
  AdminGoodsOrderListResponse,
  AdminGoodsOrderSummary,
  OrderDetail,
  OrderListResponse,
  OrderSummary,
} from "../types";

export const ORDER_STATUS_FILTERS = ["전체", "PENDING", "PAID", "CANCELLED", "COMPLETED"];
/** 굿즈 주문은 PENDING → PAID / CANCELLED 만 존재 */
export const GOODS_ORDER_STATUS_FILTERS = ["전체", "PENDING", "PAID", "CANCELLED"];

const BUYERS = ["장용호", "김서연", "이준혁", "박지민", "최유나"];
const STATUSES = ["PAID", "PAID", "PENDING", "CANCELLED", "COMPLETED"];

function makeOrder(id: number): OrderSummary {
  const buyer = BUYERS[id % BUYERS.length];
  return {
    orderId: id,
    buyerName: buyer,
    buyerEmail: `${buyer}@example.com`,
    ticketTitle: "FC 레미 vs 유나이티드",
    seatType: id % 2 === 0 ? "VIP" : "일반석",
    quantity: 1 + (id % 3),
    totalPrice: 50000 * (1 + (id % 3)),
    status: STATUSES[id % STATUSES.length],
    reservedAt: new Date(2026, 6, (id % 27) + 1, 12, 0).toISOString(),
  };
}

const list: OrderSummary[] = Array.from({ length: 20 }, (_, i) => makeOrder(1680 - i));

export const mockOrders: OrderListResponse = {
  totalElements: 1680,
  totalPages: 84,
  orders: list,
};

const GOODS = [
  { goodsId: 1, name: "레미 홈 유니폼", optionLabel: "사이즈: M", unitPrice: 89000 },
  { goodsId: 2, name: "레미 머플러", optionLabel: "", unitPrice: 25000 },
  { goodsId: 3, name: "레미 볼캡", optionLabel: "컬러: 블랙", unitPrice: 32000 },
];

function makeGoodsOrder(id: number): AdminGoodsOrderSummary {
  const buyer = BUYERS[id % BUYERS.length];
  const items = GOODS.slice(0, 1 + (id % GOODS.length)).map((g, i) => ({
    ...g,
    quantity: 1 + ((id + i) % 2),
  }));
  return {
    orderId: id,
    buyerName: buyer,
    buyerEmail: `${buyer}@example.com`,
    items,
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    status: GOODS_ORDER_STATUS_FILTERS[1 + (id % (GOODS_ORDER_STATUS_FILTERS.length - 1))],
    orderedAt: new Date(2026, 8, (id % 27) + 1, 15, 30).toISOString(),
    shipping: {
      recipientName: buyer,
      shippingMethod: "PARCEL",
      zonecode: "06236",
      address: "서울 강남구 테헤란로 123",
      addressDetail: "4층",
      deliveryMessage: id % 2 === 0 ? "문 앞에 놓아주세요" : null,
    },
  };
}

export const mockGoodsOrders: AdminGoodsOrderListResponse = {
  totalElements: 320,
  totalPages: 16,
  orders: Array.from({ length: 20 }, (_, i) => makeGoodsOrder(320 - i)),
};

export const mockOrderDetail: OrderDetail = {
  orderId: list[0].orderId,
  buyerId: 1,
  buyerName: list[0].buyerName,
  buyerEmail: list[0].buyerEmail,
  ticketId: 1,
  ticketTitle: list[0].ticketTitle,
  seatType: list[0].seatType,
  quantity: list[0].quantity,
  deliveryMethod: "MOBILE",
  totalPrice: list[0].totalPrice,
  status: list[0].status,
  reservedAt: list[0].reservedAt,
};
