"use client";

import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export interface HeaderMenuItem {
  label: string;
  href: string;
}

interface HeaderProps {
  title: string;
  userName: string;
  /** 있으면 타이틀이 드롭다운 버튼으로 렌더링됩니다. (예: 회원관리 ▼) */
  menuItems?: HeaderMenuItem[];
}

export default function Header({ title, userName, menuItems }: HeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const hasMenu = !!menuItems?.length;

  return (
    <header className="bg-white">
      <div className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between gap-4">
        {/* 타이틀 (드롭다운 유무에 따라 다르게) */}
        {hasMenu ? (
          <div ref={boxRef} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center justify-between gap-8 min-w-[220px] rounded-xl border border-[#dddddd] bg-white px-5 py-3 text-left transition hover:border-[#bbbbbb]"
            >
              <span className="text-xl font-extrabold text-ink">{title}</span>
              <ChevronDown
                size={20}
                className={`text-ink transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <div className="absolute left-0 top-full mt-2 w-full min-w-[220px] rounded-xl border border-[#dddddd] bg-white py-1 shadow-lg z-50">
                {menuItems!.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => {
                      setOpen(false);
                      router.push(item.href);
                    }}
                    className="block w-full px-5 py-3 text-left text-[15px] text-ink transition hover:bg-[#f5f6f8]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
        )}

        {/* 우측: 인사말 + 액션 아이콘 */}
        <div className="flex items-center gap-5">
          <span className="hidden sm:inline text-sm text-ink">
            <span className="font-black">{userName}</span> 님! 안녕하세요.
          </span>
          <button
            onClick={() => router.push("/login")}
            className="text-ink hover:text-brand-strong transition-colors"
            aria-label="로그아웃"
          >
            <LogOut size={22} />
          </button>
          <button
            className="text-ink hover:text-brand-strong transition-colors"
            aria-label="설정"
          >
            <Settings size={22} />
          </button>
        </div>
      </div>
      {/* 점선 구분선 */}
      <div className="border-b border-dashed border-[#cccccc]" />
    </header>
  );
}
