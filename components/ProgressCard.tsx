import { LucideIcon, Users2, Repeat2, MonitorSmartphone } from "lucide-react";

export type StatIconType = "users" | "subscription" | "consulting";

export interface StatItem {
  icon: StatIconType;
  label: string;
  value: number;
  unit: string;
}

interface ProgressCardProps {
  title: string;
  subtitle?: string;
  stats: StatItem[];
}

const iconMap: Record<StatIconType, LucideIcon> = {
  users: Users2,
  subscription: Repeat2,
  consulting: MonitorSmartphone,
};

export default function ProgressCard({ title, subtitle, stats }: ProgressCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: title */}
        <div className="min-w-[140px]">
          <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Right: stats */}
        <div className="flex items-center gap-12 flex-wrap">
          {stats.map((stat) => {
            const Icon = iconMap[stat.icon];
            return (
              <div key={stat.label} className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                  <Icon size={22} color="white" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 leading-tight">
                    {stat.value.toLocaleString()}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      {stat.unit}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
