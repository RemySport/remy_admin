import type { DashboardData } from "../types";

// 대시보드 mock 데이터 — 레미 축구 티켓 예약 서비스
export const mockDashboard: DashboardData = {
  date: "2026.07.01 (수)",
  memberInfo: {
    date: "2026.07.01 (수)",
    stats: [
      { value: "350", label: "전체회원", arrow: true },
      { value: "264", label: "시즌권", arrow: true },
      { value: "16", label: "신규회원" },
      { value: "04", label: "이탈회원" },
    ],
  },
  ticketInfo: {
    subtitle: "2026 시즌",
    stats: [
      { value: "1680", label: "누적 예매", arrow: true },
      { value: "23", label: "예정 경기" },
      { value: "860", label: "이달 오픈" },
    ],
  },
  orderChart: {
    xLabels: ["4시", "8시", "12시", "16시", "20시", "24시"],
    yTicks: [10, 20, 30, 40],
    series: [
      { name: "예매", color: "#F6AE24", points: [16, 5, 24, 19, 26, 31] },
      { name: "취소", color: "#DA1D52", points: [9, 9, 15, 13, 29, 27] },
    ],
  },
};
