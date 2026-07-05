import ChartCard from "@/components/ChartCard";
import ProgressCard from "@/components/ProgressCard";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      {/* Top row: two chart cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard
          title="결제내역 현황 (표시)"
          subtitle="- 퍼센트와 숫자로 표시"
        />
        <ChartCard
          title="결제내역 현황 (표시)"
          subtitle="- 퍼센트와 숫자로 표시"
        />
      </div>

      {/* Bottom: progress/stats card */}
      <ProgressCard
        title="진행현황"
        subtitle="- 이번주에 회원"
        stats={[
          { icon: "users",        label: "가입 (기업)", value: 1421, unit: "명" },
          { icon: "subscription", label: "구독수",      value: 245,  unit: "건 (누적)" },
          { icon: "consulting",   label: "컨설팅수",    value: 86,   unit: "건" },
        ]}
      />
    </div>
  );
}
