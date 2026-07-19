"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GROUP_OPTIONS, STATUS_OPTIONS } from "@/lib/mock/members";
import type { Member, MemberGroup, MemberStatus } from "@/lib/types";
import RadioModal from "./RadioModal";

type ModalKind = null | "group" | "status";

const MENU_ITEMS = ["상세보기", "그룹변경", "상태변경"] as const;

export default function MemberCard({ member }: { member: Member }) {
  const [group, setGroup] = useState<MemberGroup>(member.group);
  const [status, setStatus] = useState<MemberStatus>(member.status);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
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
    if (item === "그룹변경") setModal("group");
    else if (item === "상태변경") setModal("status");
    // 상세보기: 상세 페이지 미구현 — 메뉴만 닫음
  };

  const stats = [
    { label: "결제수단", value: member.stats.payment, unit: "건" },
  ];

  return (
    <div className="relative rounded-2xl border border-[#eeeeee] bg-white p-5">
      {/* 상단: 번호 + 케밥 */}
      <div className="flex items-start justify-between">
        <span className="text-sm text-ink">
          번호. <span className="font-bold">{member.id}</span>
        </span>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="회원 메뉴"
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
              menuOpen
                ? "border-transparent bg-[#111111] text-white"
                : "border-[#dddddd] text-[#888888] hover:border-[#bbbbbb]"
            }`}
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-30 mt-1.5 w-36 overflow-hidden rounded-lg border border-[#dddddd] bg-white py-1 shadow-lg">
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

      {/* 이름 */}
      <h3 className="mt-2 text-base font-extrabold text-ink">
        {member.name} ({member.nickname})
      </h3>

      {/* 메타 */}
      <p className="mt-1.5 text-sm text-ink">
        {member.birthYear}년 - {member.gender}
        <span className="ml-4 text-muted">그룹 </span>
        <span className="font-bold">{group}</span>
        {status === "차단" && (
          <span className="ml-3 rounded-full bg-[#da1d52]/10 px-2 py-0.5 text-xs font-bold text-[#da1d52]">
            차단
          </span>
        )}
      </p>

      {/* 통계 */}
      <div className="mt-5 flex items-stretch border-t border-[#f0f0f0] pt-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`flex-1 ${i !== 0 ? "border-l border-[#eeeeee] pl-3" : ""}`}
          >
            <p className="text-[11px] text-muted">{s.label}</p>
            <p className="mt-1 text-xl font-black leading-none text-ink">
              {s.value}
              <span className="ml-0.5 text-[11px] font-normal text-muted">
                {s.unit}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* 모달 */}
      {modal === "group" && (
        <RadioModal
          title="그룹변경"
          options={GROUP_OPTIONS.map((o) => ({ value: o.value, desc: o.desc }))}
          initial={group}
          labelSuffix="그룹"
          onApply={(v) => {
            setGroup(v);
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "status" && (
        <RadioModal
          title="상태변경"
          options={STATUS_OPTIONS.map((o) => ({ value: o.value, desc: o.desc }))}
          initial={status}
          onApply={(v) => {
            setStatus(v);
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
