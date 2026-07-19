// 도메인 타입 정의 — API 응답과 mock 데이터가 공유하는 스키마

/** 대시보드 상단 숫자 통계 한 칸 (예: 350 / 전체회원) */
export interface StatItem {
  /** 표시 값 (문자열로 두어 "04" 같은 0 패딩 유지) */
  value: string;
  /** 하단 라벨 */
  label: string;
  /** 우상단 주황 화살표(↗) 강조 여부 */
  arrow?: boolean;
}

/** 라인 차트 시리즈 */
export interface ChartSeries {
  name: string;
  color: string;
  points: number[];
}

export interface OrderChart {
  xLabels: string[];
  yTicks: number[];
  series: ChartSeries[];
}

export interface DashboardData {
  /** 상단에 공통으로 노출되는 기준일자 */
  date: string;
  memberInfo: {
    date: string;
    stats: StatItem[];
  };
  ticketInfo: {
    subtitle: string;
    stats: StatItem[];
  };
  orderChart: OrderChart;
}

export type MemberGroup = "일반" | "단골" | "제휴A" | "제휴B";
export type MemberStatus = "정상" | "차단";

export interface Member {
  id: number;
  name: string;
  nickname: string;
  birthYear: number;
  gender: "남성" | "여성";
  group: MemberGroup;
  status: MemberStatus;
  stats: {
    /** 결제수단 (건) */
    payment: number;
  };
}

export interface MemberListResponse {
  total: number;
  members: Member[];
}
