"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MockBanner from "@/components/MockBanner";
import SelectBox from "@/components/members/SelectBox";
import CancelOrderModal from "@/components/orders/CancelOrderModal";
import { useAdminSession } from "@/lib/admin-session";
import { ORDER_STATUS_FILTERS } from "@/lib/mock/orders";
import { cancelOrder, getOrders } from "@/lib/services";
import type { OrderSummary } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기",
  PAID: "결제완료",
  CANCELLED: "취소됨",
  COMPLETED: "완료",
};

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

export default function OrdersPage() {
  const { name } = useAdminSession();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [fromMock, setFromMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    getOrders({ status, keyword }).then((res) => {
      setOrders(res.data.orders);
      setTotal(res.data.totalElements);
      setFromMock(res.fromMock);
      setLoading(false);
    });
  };

  useEffect(load, [status, keyword]);

  const handleCancel = async (reason: string) => {
    if (cancelTarget == null) return;
    await cancelOrder(cancelTarget, reason);
    setCancelTarget(null);
    load();
  };

  return (
    <>
      <Header title="구매관리" userName={name || "관리자"} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-32 pt-6">
        {fromMock && <MockBanner />}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink">
            전체 <span className="font-bold">{total}</span>
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <SelectBox
              value={status}
              hint="상태선택"
              options={ORDER_STATUS_FILTERS}
              onChange={setStatus}
            />
            <div className="flex items-center gap-2 rounded-lg border border-[#dddddd] bg-white px-3.5 py-2.5">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="구매자명 / 이메일 검색"
                className="w-40 bg-transparent text-sm text-ink outline-none placeholder:text-[#bbbbbb]"
              />
              <Search size={16} className="text-[#888888]" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#eeeeee] bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#eeeeee] text-xs text-muted">
                <th className="px-4 py-3 font-bold">주문번호</th>
                <th className="px-4 py-3 font-bold">구매자</th>
                <th className="px-4 py-3 font-bold">티켓</th>
                <th className="px-4 py-3 font-bold">좌석</th>
                <th className="px-4 py-3 font-bold">수량</th>
                <th className="px-4 py-3 font-bold">금액</th>
                <th className="px-4 py-3 font-bold">상태</th>
                <th className="px-4 py-3 font-bold">예약일시</th>
                <th className="px-4 py-3 font-bold">관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted">
                    불러오는 중...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted">
                    조건에 맞는 구매 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
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
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          o.status === "CANCELLED"
                            ? "bg-[#da1d52]/10 text-[#da1d52]"
                            : "bg-[#111111]/5 text-ink"
                        }`}
                      >
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink">{formatDate(o.reservedAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        disabled={o.status === "CANCELLED"}
                        onClick={() => setCancelTarget(o.orderId)}
                        className="rounded-lg border border-[#dddddd] px-3 py-1.5 text-xs font-bold text-ink transition hover:border-[#bbbbbb] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        취소처리
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {cancelTarget != null && (
        <CancelOrderModal
          orderId={cancelTarget}
          onConfirm={handleCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </>
  );
}
