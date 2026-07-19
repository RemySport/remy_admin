import Card, { CardHeader } from "./Card";

interface PlaceholderCardProps {
  title: string;
  subtitle?: string;
  /** 본문 최소 높이 (px) */
  minBodyHeight?: number;
}

// 예매내역(온라인/현장), 고객 피드백처럼 본문이 아직 비어있는 카드
export default function PlaceholderCard({
  title,
  subtitle,
  minBodyHeight = 220,
}: PlaceholderCardProps) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <div
        className="mt-4 flex items-center justify-center rounded-xl"
        style={{ minHeight: minBodyHeight }}
      >
        <span className="text-xs text-[#cfcfcf]">표시할 내용이 없습니다</span>
      </div>
    </Card>
  );
}
