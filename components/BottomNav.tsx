"use client";

import { CalendarDays, Gift, Home, Ticket, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { icon: Home, href: "/dashboard", label: "홈" },
  { icon: User, href: "/dashboard/members", label: "회원관리" },
  { icon: CalendarDays, href: "/dashboard/products", label: "티켓관리" },
  { icon: Ticket, href: "/dashboard/orders", label: "구매관리" },
  { icon: Gift, href: "/dashboard/goods", label: "굿즈관리" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <nav className="bg-[#1a1a1a] rounded-full px-5 py-2.5 flex items-center gap-4 shadow-2xl">
        {navItems.map(({ icon: Icon, href, label }) => {
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
