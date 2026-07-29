"use client";

import { CalendarDays, Gift, Home, Shield, Ticket, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminSession } from "@/lib/admin-session";
import type { AdminMenuKey } from "@/lib/types";

const navItems = [
  { icon: Home, href: "/dashboard", label: "홈", menuKey: "DASHBOARD" as AdminMenuKey },
  { icon: User, href: "/dashboard/members", label: "회원관리", menuKey: "MEMBERS" as AdminMenuKey },
  { icon: CalendarDays, href: "/dashboard/products", label: "티켓관리", menuKey: "TICKETS" as AdminMenuKey },
  { icon: Ticket, href: "/dashboard/orders", label: "구매관리", menuKey: "ORDERS" as AdminMenuKey },
  { icon: Gift, href: "/dashboard/goods", label: "굿즈관리", menuKey: "GOODS" as AdminMenuKey },
  { icon: Shield, href: "/dashboard/admins", label: "어드민관리", menuKey: "ADMINS" as AdminMenuKey },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { menuKeys } = useAdminSession();

  // menuKeys 가 아직 로딩 전(null)이면 깜빡임 없이 기본 메뉴를 보여주고,
  // 응답이 오면 권한에 맞게 필터링한다.
  const visibleItems = menuKeys
    ? navItems.filter((item) => menuKeys.includes(item.menuKey))
    : navItems;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <nav className="bg-[#1a1a1a] rounded-full px-5 py-2.5 flex items-center gap-4 shadow-2xl">
        {visibleItems.map(({ icon: Icon, href, label }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              aria-label={label}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                isActive
                  ? "bg-white/12 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon size={22} strokeWidth={1.8} />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
