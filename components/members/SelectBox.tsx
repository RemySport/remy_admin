"use client";

import { ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SelectBoxProps {
  /** 선택된 값 */
  value: string;
  /** 선택 후 괄호 안에 붙는 설명 (예: "그룹선택") */
  hint?: string;
  options: string[];
  onChange: (value: string) => void;
}

// 회원관리 필터용 커스텀 셀렉트 (Figma: 전체 (그룹선택) ⇕)
export default function SelectBox({
  value,
  hint,
  options,
  onChange,
}: SelectBoxProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex min-w-[130px] items-center justify-between gap-2 rounded-lg border border-[#dddddd] bg-white px-3.5 py-2.5 text-left transition hover:border-[#bbbbbb]"
      >
        <span className="text-sm text-ink">
          <span className="font-bold">{value}</span>
          {hint && <span className="text-muted"> ({hint})</span>}
        </span>
        <ChevronsUpDown size={15} className="shrink-0 text-ink" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-1.5 w-full overflow-hidden rounded-lg border border-[#dddddd] bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`block w-full px-3.5 py-2.5 text-left text-sm transition hover:bg-[#f5f6f8] ${
                opt === value ? "font-bold text-ink" : "text-[#555555]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
