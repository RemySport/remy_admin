import type { OrderDetail, OrderListResponse, OrderSummary } from "../types";

export const ORDER_STATUS_FILTERS = ["전체", "PENDING", "PAID", "CANCELLED", "COMPLETED"];

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
