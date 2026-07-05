"use client";

import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  userName: string;
}

export default function Header({ title, userName }: HeaderProps) {
  const router = useRouter();

  return (
    <>
      <header className="bg-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            <span className="font-semibold">{userName}</span> 님! 안녕하세요.
          </span>
          <button
            onClick={() => router.push("/login")}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="로그아웃"
          >
            <LogOut size={20} />
          </button>
          <button
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="설정"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>
      <div className="border-b border-dashed border-gray-300" />
    </>
  );
}
