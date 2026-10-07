"use client";

import { Search } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import Header from "@/components/Header";
import MockBanner from "@/components/MockBanner";
import Pagination from "@/components/Pagination";
import SelectBox from "@/components/members/SelectBox";
import CancelOrderModal from "@/components/orders/CancelOrderModal";
import { useAdminSession } from "@/lib/admin-session";
import { GOODS_ORDER_STATUS_FILTERS, ORDER_STATUS_FILTERS } from "@/lib/mock/orders";
import { getGoodsOrders, getOrders, refundPayment } from "@/lib/services";
import { ApiRequestError } from "@/lib/api";
import type { AdminGoodsOrderSummary, OrderSummary, RefundReason } from "@/lib/types";

const PAGE_SIZE = 20;

type OrderTab = "TICKET" | "GOODS";

const TABS: { key: OrderTab; label: string }[] = [
  { key: "TICKET", label: "티켓 결제" },
  { key: "GOODS", label: "굿즈 결제" },
];

const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기",
  PAYING: "결제중",
  PAID: "결제완료",
  CANCELLED: "취소됨",
  COMPLETED: "완료",
};

/** 티켓/굿즈 공통으로 환불 처리에 필요한 필드 */
type RefundableOrder = Pick<OrderSummary, "orderId" | "paymentOrderId" | "paymentStatus" | "status">;

function formatDate(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPaymentMethod(method: string | null) {
  return method === "TRANSFER" ? "계좌결제" : method === "CARD" ? "카드" : "-";
}

/** "레미 홈 유니폼 외 2건" 형태의 품목 요약 */
function summarizeItems(order: AdminGoodsOrderSummary) {
  if (order.items.length === 0) return "-";
  const first = order.items[0].name;
  return order.items.length > 1 ? `${first} 외 ${order.items.length - 1}건` : first;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
        status === "CANCELLED" ? "bg-[#da1d52]/10 text-[#da1d52]" : "bg-[#111111]/5 text-ink"
      }`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function CancelButton({ order, onClick }: { order: RefundableOrder; onClick: () => void }) {
  return (
    <button
      disabled={order.status !== "PAID" || order.paymentStatus !== "PAID" || !order.paymentOrderId}
      onClick={onClick}
      className="rounded-lg border border-[#dddddd] px-3 py-1.5 text-xs font-bold text-ink transition hover:border-[#bbbbbb] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {order.paymentStatus === "CANCELLING" || order.paymentStatus === "CANCEL_IN_DOUBT"
        ? "환불 확인 중" : "취소처리"}
    </button>
  );
}

function MessageRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-muted">
        {children}
      </td>
    </tr>
  );
}

export default function OrdersPage() {
  const { name } = useAdminSession();
  const [tab, setTab] = useState<OrderTab>("TICKET");
  const [ticketOrders, setTicketOrders] = useState<OrderSummary[]>([]);
  const [goodsOrders, setGoodsOrders] = useState<AdminGoodsOrderSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [fromMock, setFromMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [cancelTarget, setCancelTarget] = useState<RefundableOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    // 탭/필터를 빠르게 바꿀 때 늦게 도착한 이전 요청 응답이 덮어쓰지 않도록 무시 플래그를 둔다.
    let ignore = false;
    const query = { status, keyword, page, size: PAGE_SIZE };
    const request =
      tab === "TICKET"
        ? getOrders(query).then((res) => {
            if (!ignore) setTicketOrders(res.data.orders);
            return res;
          })
        : getGoodsOrders(query).then((res) => {
            if (!ignore) setGoodsOrders(res.data.orders);
            return res;
          });
    request
      .then((res) => {
        if (ignore) return;
        setTotal(res.data.totalElements);
        setTotalPages(res.data.totalPages);
        setFromMock(res.fromMock);
      })
      .catch((e) => {
        if (!ignore) setError(e instanceof Error ? e.message : "구매 내역을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  };

  useEffect(load, [tab, status, keyword, page]);

  /** 목록 조건이 바뀔 때 공통 처리 — 로딩 표시 + 이전 오류 제거 */
  const beginReload = () => {
    setLoading(true);
    setError(null);
  };

  const handleTabChange = (next: OrderTab) => {
    if (next === tab) return;
    beginReload();
    setTab(next);
    // 티켓/굿즈는 상태값 체계가 달라(굿즈엔 COMPLETED 없음) 필터를 초기화한다.
    setStatus("전체");
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    beginReload();
    setStatus(value);
    setPage(1);
  };

  const handleKeywordChange = (value: string) => {
    beginReload();
    setKeyword(value);
    setPage(1);
  };

  const handlePageChange = (next: number) => {
    beginReload();
    setPage(next);
  };

  const handleCancel = async (reason: RefundReason) => {
    if (cancelTarget == null) return;
    setError(null);
    try {
      const result = await refundPayment(cancelTarget.paymentOrderId!, reason);
      setCancelTarget(null);
      if (result.status === "CANCEL_IN_DOUBT" || result.status === "CANCELLING") {
        const markInDoubt = <T extends RefundableOrder>(order: T): T =>
          order.orderId === cancelTarget.orderId ? { ...order, paymentStatus: result.status } : order;
        if (tab === "TICKET") setTicketOrders((current) => current.map(markInDoubt));
        else setGoodsOrders((current) => current.map(markInDoubt));
        setError("환불 요청 결과를 확인 중입니다. 다시 취소하지 말고 결제 검토 상태를 확인해 주세요.");
        return;
      }
      setLoading(true);
      load();
    } catch (e) {
      setCancelTarget(null);
      const detail = e instanceof ApiRequestError ? ` (${e.message})` : "";
      setError(`환불 요청 결과를 확인할 수 없습니다. 다시 취소하지 말고 결제 상태를 먼저 확인해 주세요.${detail}`);
    }
  };

  const colSpan = 10;

  return (
    <>
      <Header title="구매관리" userName={name || "관리자"} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-32 pt-6">
        {fromMock && <MockBanner />}
        {error && <p role="alert" className="mb-4 rounded-xl bg-[#da1d52]/10 px-4 py-3 text-sm text-[#a31545]">{error}</p>}

        <div role="tablist" className="mb-5 flex gap-1 border-b border-[#eeeeee]">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => handleTabChange(t.key)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-bold transition ${
                tab === t.key
                  ? "border-[#111111] text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink">
            전체 <span className="font-bold">{total}</span>
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <SelectBox
              value={status}
              hint="상태선택"
              options={tab === "TICKET" ? ORDER_STATUS_FILTERS : GOODS_ORDER_STATUS_FILTERS}
              onChange={handleStatusChange}
            />
            <div className="flex items-center gap-2 rounded-lg border border-[#dddddd] bg-white px-3.5 py-2.5">
              <input
                value={keyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                placeholder="구매자명 / 이메일 검색"
                className="w-40 bg-transparent text-sm text-ink outline-none placeholder:text-[#bbbbbb]"
              />
              <Search size={16} className="text-[#888888]" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#eeeeee] bg-white">
          {tab === "TICKET" ? (
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#eeeeee] text-xs text-muted">
                  <th className="px-4 py-3 font-bold">주문번호</th>
                  <th className="px-4 py-3 font-bold">구매자</th>
                  <th className="px-4 py-3 font-bold">티켓</th>
                  <th className="px-4 py-3 font-bold">좌석</th>
                  <th className="px-4 py-3 font-bold">수량</th>
                  <th className="px-4 py-3 font-bold">금액</th>
                  <th className="px-4 py-3 font-bold">결제수단</th>
                  <th className="px-4 py-3 font-bold">상태</th>
                  <th className="px-4 py-3 font-bold">예약일시</th>
                  <th className="px-4 py-3 font-bold">관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <MessageRow colSpan={colSpan}>불러오는 중...</MessageRow>
                ) : ticketOrders.length === 0 ? (
                  <MessageRow colSpan={colSpan}>조건에 맞는 티켓 결제 내역이 없습니다.</MessageRow>
                ) : (
                  ticketOrders.map((o) => (
                    <tr key={o.orderId} className="border-b border-[#f5f5f5] last:border-0">
                      <td className="px-4 py-3 font-bold text-ink">{o.orderId}</td>
                      <td className="px-4 py-3 text-ink">
                        {o.buyerName}
                        <span className="ml-1 text-xs text-muted">({o.buyerEmail})</span>
                      </td>
                      <td className="px-4 py-3 text-ink">{o.ticketTitle}</td>
                      <td className="px-4 py-3 text-ink">{o.seatType ?? "-"}</td>
                      <td className="px-4 py-3 text-ink">{o.quantity}</td>
                      <td className="px-4 py-3 text-ink">{o.totalPrice.toLocaleString()}원</td>
                      <td className="px-4 py-3 text-ink">{formatPaymentMethod(o.paymentMethod)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-ink">{formatDate(o.reservedAt)}</td>
                      <td className="px-4 py-3">
                        <CancelButton order={o} onClick={() => setCancelTarget(o)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#eeeeee] text-xs text-muted">
                  <th className="px-4 py-3 font-bold">주문번호</th>
                  <th className="px-4 py-3 font-bold">구매자</th>
                  <th className="px-4 py-3 font-bold">상품</th>
                  <th className="px-4 py-3 font-bold">수량</th>
                  <th className="px-4 py-3 font-bold">금액</th>
                  <th className="px-4 py-3 font-bold">결제수단</th>
                  <th className="px-4 py-3 font-bold">상태</th>
                  <th className="px-4 py-3 font-bold">배송지</th>
                  <th className="px-4 py-3 font-bold">주문일시</th>
                  <th className="px-4 py-3 font-bold">관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <MessageRow colSpan={colSpan}>불러오는 중...</MessageRow>
                ) : goodsOrders.length === 0 ? (
                  <MessageRow colSpan={colSpan}>조건에 맞는 굿즈 결제 내역이 없습니다.</MessageRow>
                ) : (
                  goodsOrders.map((o) => (
                    <tr key={o.orderId} className="border-b border-[#f5f5f5] align-top last:border-0">
                      <td className="px-4 py-3 font-bold text-ink">{o.orderId}</td>
                      <td className="px-4 py-3 text-ink">
                        {o.buyerName}
                        <span className="ml-1 text-xs text-muted">({o.buyerEmail})</span>
                      </td>
                      <td className="px-4 py-3 text-ink">
                        <p>{summarizeItems(o)}</p>
                        {o.items.map((item, i) => (
                          <p key={i} className="text-xs text-muted">
                            {/* 단건이면 상품명이 위 줄과 중복되므로 옵션/수량만 */}
                            {o.items.length > 1
                              ? `${item.name}${item.optionLabel ? ` (${item.optionLabel})` : ""}`
                              : item.optionLabel || "옵션 없음"}
                            {` × ${item.quantity}`}
                          </p>
                        ))}
                      </td>
                      <td className="px-4 py-3 text-ink">{o.totalQuantity}</td>
                      <td className="px-4 py-3 text-ink">{o.totalPrice.toLocaleString()}원</td>
                      <td className="px-4 py-3 text-ink">{formatPaymentMethod(o.paymentMethod)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="max-w-[220px] px-4 py-3 text-ink">
                        {o.shipping ? (
                          <>
                            <p>{o.shipping.recipientName}</p>
                            <p className="text-xs text-muted">
                              ({o.shipping.zonecode}) {o.shipping.address} {o.shipping.addressDetail}
                            </p>
                            {o.shipping.deliveryMessage && (
                              <p className="text-xs text-muted">“{o.shipping.deliveryMessage}”</p>
                            )}
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink">{formatDate(o.orderedAt)}</td>
                      <td className="px-4 py-3">
                        <CancelButton order={o} onClick={() => setCancelTarget(o)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
      </main>

      {cancelTarget != null && (
        <CancelOrderModal
          kind={tab}
          orderId={cancelTarget.orderId}
          paymentOrderId={cancelTarget.paymentOrderId!}
          onConfirm={handleCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </>
  );
}
