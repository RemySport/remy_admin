"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

export interface RadioOption<T extends string> {
  value: T;
  desc: string;
}

interface RadioModalProps<T extends string> {
  title: string;
  options: RadioOption<T>[];
  initial: T;
  /** 옵션 라벨 뒤에 붙는 접미사 (예: 그룹변경의 "그룹") */
  labelSuffix?: string;
  onApply: (value: T) => void;
  onClose: () => void;
}

// 상태변경 / 그룹변경 공용 라디오 다이얼로그 (Figma)
export default function RadioModal<T extends string>({
  title,
  options,
  initial,
  labelSuffix,
  onApply,
  onClose,
}: RadioModalProps<T>) {
  const [selected, setSelected] = useState<T>(initial);

  // ESC 로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5">
          <h3 className="text-base font-extrabold text-ink">{title}</h3>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-ink hover:text-brand-strong"
          >
            <X size={20} />
          </button>
        </div>

        {/* 옵션 리스트 */}
        <div className="px-6">
          {options.map((opt, i) => {
            const active = opt.value === selected;
            return (
              <button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className={`flex w-full items-center gap-3 py-4 text-left ${
                  i !== 0 ? "border-t border-[#eeeeee]" : ""
                }`}
              >
                {/* 라디오 */}
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? "border-brand" : "border-[#cccccc]"
                  }`}
                >
                  {active && (
                    <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                  )}
                </span>
                <span className="text-[15px] font-medium text-ink">
                  {opt.value}
                  {labelSuffix ? ` ${labelSuffix}` : ""}
                </span>
                <span className="ml-auto text-sm text-muted">({opt.desc})</span>
              </button>
            );
          })}
        </div>

        {/* 적용 버튼 */}
        <div className="px-6 pb-6 pt-5">
          <button
            onClick={() => onApply(selected)}
            className="w-full rounded-xl bg-[#111111] py-4 text-sm font-extrabold text-white transition hover:bg-black active:scale-[0.99]"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}
