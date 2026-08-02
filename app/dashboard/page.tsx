"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MockBanner from "@/components/MockBanner";
import OrderChart from "@/components/dashboard/OrderChart";
import PlaceholderCard from "@/components/dashboard/PlaceholderCard";
import StatNumberCard from "@/components/dashboard/StatNumberCard";
import { useAdminSession } from "@/lib/admin-session";
import { getDashboard } from "@/lib/services";
import type { DashboardData } from "@/lib/types";

export default function DashboardPage() {
  const { name } = useAdminSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [fromMock, setFromMock] = useState(false);

  useEffect(() => {
    let alive = true;
    getDashboard().then((res) => {
      if (!alive) return;
      setData(res.data);
      setFromMock(res.fromMock);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Header title="레미 어드민" userName={name || "관리자"} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-32 pt-6">
        {fromMock && <MockBanner />}

        {!data ? (
          <LoadingState />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* 좌측 열 */}
            <div className="flex flex-col gap-4">
              <StatNumberCard
                title="회원정보"
                subtitle={data.memberInfo.date}
                stats={data.memberInfo.stats}
              />
              <OrderChart
                title="예매현황"
                subtitle="시간대별 예매내역 표시"
                data={data.orderChart}
              />
              <PlaceholderCard
                title="고객 피드백"
                subtitle={data.date}
                minBodyHeight={140}
              />
            </div>

            {/* 중앙 열 */}
            <div className="flex flex-col gap-4">
              <PlaceholderCard
                title="예매내역 (온라인)"
                subtitle={data.date}
                minBodyHeight={300}
              />
              <PlaceholderCard
                title="예매내역 (현장)"
                subtitle={data.date}
                minBodyHeight={300}
              />
            </div>

            {/* 우측 열 */}
            <div className="flex flex-col gap-4">
              <StatNumberCard
                title="티켓 판매현황"
                subtitle={data.ticketInfo.subtitle}
                stats={data.ticketInfo.stats}
                className="flex-1"
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-64 animate-pulse rounded-2xl border border-[#eeeeee] bg-white/60"
        />
      ))}
    </div>
  );
}
