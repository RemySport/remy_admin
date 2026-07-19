// 대시보드 공통 카드 셸
export default function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#eeeeee] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${className}`}
    >
      {children}
    </div>
  );
}

// 카드 헤더 (제목 + 보조 텍스트/날짜)
export function CardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="text-[13px] font-extrabold text-ink">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-xs font-normal text-muted">{subtitle}</p>
      )}
    </div>
  );
}
