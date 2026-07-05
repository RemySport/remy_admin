"use client";

import { Home, User, LayoutList, FileText } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { icon: Home, href: "/dashboard", label: "홈" },
  { icon: User, href: "/dashboard/members", label: "회원" },
  { icon: LayoutList, href: "/dashboard/products", label: "제품" },
  { icon: FileText, href: "/dashboard/orders", label: "주문" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <nav className="bg-gray-900 rounded-full px-8 py-3.5 flex items-center gap-10 shadow-2xl">
        {navItems.map(({ icon: Icon, href, label }) => {
          const isActive = pathname === href;
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              aria-label={label}
              className={`transition-colors ${
                isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon size={22} />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
