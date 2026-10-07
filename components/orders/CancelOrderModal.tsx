"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { RefundReason } from "@/lib/types";

export type CancelOrderKind = "TICKET" | "GOODS";

const REFUND_REASONS: Record<CancelOrderKind, { value: RefundReason; label: string }[]> = {
  TICKET: [
    { value: "LEGAL_REFUND", label: "고객 요청에 의한 전액 환불" },
    { value: "MATCH_CANCELLED", label: "경기 취소에 의한 전액 환불" },
    { value: "SUPPLY_FAILED", label: "티켓 확보 실패에 의한 전액 환불" },
  ],
  GOODS: [
    { value: "LEGAL_REFUND", label: "고객 요청에 의한 전액 환불" },
    { value: "SUPPLY_FAILED", label: "상품 공급 불가에 의한 전액 환불" },
  ],
};

const COPY: Record<CancelOrderKind, { idLabel: string; after: string }> = {
  TICKET: { idLabel: "예약번호", after: "페이플 승인 취소가 확인된 뒤 예약 상태와 재고가 함께 변경됩니다." },
  GOODS: { idLabel: "주문번호", after: "페이플 승인 취소가 확인된 뒤 주문 상태가 취소로 바뀌고 재고가 복원됩니다." },
};

export default function CancelOrderModal({
  kind = "TICKET",
  orderId,
  paymentOrderId,
  onConfirm,
  onClose,
}: {
  kind?: CancelOrderKind;
  orderId: number;
  paymentOrderId: string;
  onConfirm: (reason: RefundReason) => Promise<void>;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<RefundReason>("LEGAL_REFUND");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(reason);
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
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <h3 className="text-base font-extrabold text-ink">구매 취소</h3>
          <button onClick={onClose} aria-label="닫기" className="text-ink hover:text-brand-strong">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 pb-2">
          <p className="mb-3 text-sm text-muted">
            {COPY[kind].idLabel} <span className="font-bold text-ink">{orderId}</span>의 결제 전액을 환불합니다.
          </p>
          <p className="mb-3 break-all text-xs text-muted">결제 주문번호: {paymentOrderId}</p>
          <label htmlFor="refund-reason" className="mb-2 block text-xs font-bold text-ink">
            환불 사유
          </label>
          <select
            id="refund-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as RefundReason)}
            className="w-full rounded-lg border border-[#dddddd] px-3.5 py-2.5 text-sm text-ink outline-none focus:border-[#bbbbbb]"
          >
            {REFUND_REASONS[kind].map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          <p className="mt-3 text-xs leading-5 text-[#a31545]">
            {COPY[kind].after}
          </p>
        </div>
        <div className="px-6 pb-6 pt-4">
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="w-full rounded-xl bg-[#da1d52] py-4 text-sm font-extrabold text-white transition hover:bg-[#c01847] active:scale-[0.99] disabled:opacity-60"
          >
            {submitting ? "처리 중..." : "취소 처리"}
          </button>
        </div>
      </div>
    </div>
  );
}
