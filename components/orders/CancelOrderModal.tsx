"use client";

import { X } from "lucide-react";
import { useState } from "react";

export default function CancelOrderModal({
  orderId,
  onConfirm,
  onClose,
}: {
  orderId: number;
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
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
            주문번호 <span className="font-bold text-ink">{orderId}</span> 건을 취소 처리합니다.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="취소 사유 (선택)"
            rows={3}
            className="w-full rounded-lg border border-[#dddddd] px-3.5 py-2.5 text-sm text-ink outline-none focus:border-[#bbbbbb]"
          />
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
