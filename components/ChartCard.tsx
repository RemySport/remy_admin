interface ChartCardProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-52">
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      )}
      <div className="mt-4 h-36 flex items-center justify-center">
        {children ?? (
          <span className="text-xs text-gray-300">차트 영역</span>
        )}
      </div>
    </div>
  );
}
