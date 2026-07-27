"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TicketSummary } from "@/lib/types";
import RadioModal from "@/components/members/RadioModal";

const MENU_ITEMS = ["판매상태변경", "삭제"] as const;

const STATUS_OPTIONS: { value: "OPEN" | "PENDING" | "CLOSED"; desc: string }[] = [
  { value: "OPEN", desc: "예매를 받을 수 있는 상태" },
  { value: "PENDING", desc: "오픈 예정으로 아직 예매 불가" },
  { value: "CLOSED", desc: "판매가 종료된 상태" },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketCard({
  ticket,
  onChangeStatus,
  onDelete,
}: {
  ticket: TicketSummary;
  onChangeStatus: (id: number, status: "OPEN" | "PENDING" | "CLOSED") => void;
  onDelete: (id: number) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const onMenuSelect = (item: (typeof MENU_ITEMS)[number]) => {
    setMenuOpen(false);
    if (item === "판매상태변경") setStatusModalOpen(true);
    else if (item === "삭제") {
      if (confirm(`"${ticket.title}" 티켓을 삭제하시겠습니까?`)) {
        onDelete(ticket.ticketId);
      }
    }
  };

  return (
    <div className="relative rounded-2xl border border-[#eeeeee] bg-white p-5">
      <div className="flex items-start justify-between">
        <span className="text-sm text-ink">
          번호. <span className="font-bold">{ticket.ticketId}</span>
        </span>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="티켓 메뉴"
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
              menuOpen
                ? "border-transparent bg-[#111111] text-white"
                : "border-[#dddddd] text-[#888888] hover:border-[#bbbbbb]"
            }`}
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-30 mt-1.5 w-40 overflow-hidden rounded-lg border border-[#dddddd] bg-white py-1 shadow-lg">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item}
                  onClick={() => onMenuSelect(item)}
                  className="block w-full px-4 py-2.5 text-left text-sm text-ink transition hover:bg-[#111111] hover:text-white"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <h3 className="mt-2 text-base font-extrabold text-ink">{ticket.title}</h3>

      <p className="mt-1.5 text-sm text-ink">
        {formatDate(ticket.matchDatetime)}
        <span className="ml-4 text-muted">{ticket.stadiumName ?? "-"}</span>
        {ticket.leagueName && <span className="ml-2 text-muted">· {ticket.leagueName}</span>}
        {ticket.reservationStatus === "CLOSED" && (
          <span className="ml-3 rounded-full bg-[#da1d52]/10 px-2 py-0.5 text-xs font-bold text-[#da1d52]">
            판매종료
          </span>
        )}
      </p>

      <div className="mt-5 flex items-stretch border-t border-[#f0f0f0] pt-4">
        <div className="flex-1">
          <p className="text-[11px] text-muted">최저가</p>
          <p className="mt-1 text-xl font-black leading-none text-ink">
            {ticket.minPrice != null ? ticket.minPrice.toLocaleString() : "-"}
            <span className="ml-0.5 text-[11px] font-normal text-muted">원</span>
          </p>
        </div>
        <div className="flex-1 border-l border-[#eeeeee] pl-3">
          <p className="text-[11px] text-muted">예매가능</p>
          <p className="mt-1 text-xl font-black leading-none text-ink">
            {ticket.isReservable ? "가능" : "불가"}
          </p>
        </div>
      </div>

      {statusModalOpen && (
        <RadioModal
          title="판매상태변경"
          options={STATUS_OPTIONS}
          initial={
            (["OPEN", "PENDING", "CLOSED"] as const).includes(
              ticket.reservationStatus as "OPEN" | "PENDING" | "CLOSED",
            )
              ? (ticket.reservationStatus as "OPEN" | "PENDING" | "CLOSED")
              : "OPEN"
          }
          labelSuffix="상태"
          onApply={(v) => {
            setStatusModalOpen(false);
            onChangeStatus(ticket.ticketId, v);
          }}
          onClose={() => setStatusModalOpen(false)}
        />
      )}
    </div>
  );
}
