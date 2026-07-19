import type { OrderChart as OrderChartData } from "@/lib/types";
import Card from "./Card";

// viewBox 좌표계 (반응형 — 부모 폭에 맞춰 스케일)
const W = 320;
const H = 170;
const PAD = { top: 22, right: 10, bottom: 26, left: 26 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

interface OrderChartProps {
  title: string;
  subtitle?: string;
  data: OrderChartData;
}

export default function OrderChart({ title, subtitle, data }: OrderChartProps) {
  const { xLabels, yTicks, series } = data;
  const yMax = Math.max(...yTicks);
  const n = xLabels.length;

  const x = (i: number) => PAD.left + (PLOT_W * i) / (n - 1);
  const y = (v: number) => PAD.top + PLOT_H * (1 - v / yMax);

  return (
    <Card>
      {/* 헤더 + 범례 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[13px] font-extrabold text-ink">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold text-ink">
                {s.name}
              </span>
              <span className="flex items-center">
                <span
                  className="h-[2px] w-3"
                  style={{ background: s.color }}
                />
                <span
                  className="ml-0.5 h-2 w-2 rounded-full border-2 bg-white"
                  style={{ borderColor: s.color }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 차트 */}
      <div className="mt-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${title} 라인 차트`}
        >
          {/* 가로 점선 그리드 + y축 라벨 */}
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                y1={y(t)}
                x2={W - PAD.right}
                y2={y(t)}
                stroke="#eeeeee"
                strokeDasharray="3 3"
              />
              <text
                x={PAD.left - 6}
                y={y(t) + 3}
                textAnchor="end"
                className="fill-[#cccccc]"
                fontSize={8}
              >
                {t}
              </text>
            </g>
          ))}

          {/* x축 라벨 */}
          {xLabels.map((lbl, i) => (
            <text
              key={lbl}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-[#aaaaaa]"
              fontSize={8}
            >
              {lbl}
            </text>
          ))}

          {/* 시리즈 라인 + 포인트 */}
          {series.map((s) => {
            const d = s.points
              .map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`)
              .join(" ");
            return (
              <g key={s.name}>
                <path
                  d={d}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {s.points.map((v, i) => (
                  <circle
                    key={i}
                    cx={x(i)}
                    cy={y(v)}
                    r={3}
                    fill="white"
                    stroke={s.color}
                    strokeWidth={2}
                  />
                ))}
              </g>
            );
          })}

          {/* 대표 값 주석 (예매 12시 지점) */}
          {series[0] && series[0].points[2] !== undefined && (
            <text
              x={x(2)}
              y={y(series[0].points[2]) - 8}
              textAnchor="middle"
              className="fill-ink"
              fontSize={9}
              fontWeight={700}
            >
              {series[0].points[2]}
            </text>
          )}
        </svg>

        <p className="mt-2 text-right text-[11px] text-muted">
          (4시간 단위로 예매된 내역을 표시)
        </p>
      </div>
    </Card>
  );
}
