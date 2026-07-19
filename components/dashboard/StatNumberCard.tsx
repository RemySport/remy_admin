import { ArrowUpRight } from "lucide-react";
import type { StatItem } from "@/lib/types";
import Card, { CardHeader } from "./Card";

interface StatNumberCardProps {
  title: string;
  subtitle?: string;
  stats: StatItem[];
  className?: string;
}

// 회원정보 / 티켓 판매현황처럼 큰 숫자 통계를 나열하는 카드
export default function StatNumberCard({
  title,
  subtitle,
  stats,
  className = "",
}: StatNumberCardProps) {
  return (
    <Card className={className}>
      <CardHeader title={title} subtitle={subtitle} />

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-4">
        {stats.map((s) => (
          <div key={s.label} className="min-w-[52px]">
            <div className="relative inline-flex items-start">
              <span className="text-[34px] font-extrabold leading-none tracking-tight text-ink">
                {s.value}
              </span>
              {s.arrow && (
                <ArrowUpRight
                  size={15}
                  className="ml-0.5 mt-0.5 text-brand-strong"
                  strokeWidth={2.5}
                />
              )}
            </div>
            <p className="mt-2 text-[11px] text-muted underline underline-offset-2 decoration-[#dddddd]">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
