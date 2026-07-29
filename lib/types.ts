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

// ---------------------------------------------------------------------------
// 티켓(경기) 관리
// ---------------------------------------------------------------------------

export interface TicketSummary {
  ticketId: number;
  title: string;
  matchDatetime: string;
  stadiumName: string | null;
  leagueName: string | null;
  reservationStatus: string;
  isReservable: boolean;
  minPrice: number | null;
}

export interface TicketListResponse {
  totalElements: number;
  totalPages: number;
  tickets: TicketSummary[];
}

export interface TicketOptionItem {
  ticketOptionId: number;
  seatType: string;
  price: number;
  currency: string;
  maxQuantity: number;
  isActive: boolean;
}

export interface TicketDetail {
  ticketId: number;
  competitionType: string;
  leagueId: number | null;
  leagueName: string | null;
  tournamentId: number | null;
  tournamentName: string | null;
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
  stadiumId: number;
  stadiumName: string;
  matchDatetime: string;
  timezone: string;
  reservationStatus: string;
  isReservable: boolean;
  sourceUrl: string | null;
  ticketOptions: TicketOptionItem[];
}

export interface TicketOptionInput {
  seatType: string;
  price: number;
  currency: string;
  maxQuantity?: number;
}

export interface CreateTicketRequest {
  competitionType: string;
  leagueId?: number | null;
  tournamentId?: number | null;
  homeTeamId: number;
  awayTeamId: number;
  stadiumId: number;
  matchDatetime: string;
  timezone: string;
  reservationStatus: string;
  isReservable?: boolean;
  sourceUrl?: string | null;
  ticketOptions?: TicketOptionInput[];
}

export type UpdateTicketRequest = Partial<CreateTicketRequest>;

export interface StadiumBrief {
  stadiumId: number;
  name: string;
  city: string | null;
  country: string | null;
}

export interface LeagueBrief {
  leagueId: number;
  name: string;
  country: string | null;
  logoUrl: string | null;
}

export interface TeamBrief {
  teamId: number;
  name: string;
  leagueId: number | null;
  leagueName: string | null;
  logoUrl: string | null;
}

// ---------------------------------------------------------------------------
// 구매(예약) 관리
// ---------------------------------------------------------------------------

export interface OrderSummary {
  orderId: number;
  buyerName: string;
  buyerEmail: string;
  ticketTitle: string;
  seatType: string | null;
  quantity: number;
  totalPrice: number;
  status: string;
  reservedAt: string | null;
}

export interface OrderListResponse {
  totalElements: number;
  totalPages: number;
  orders: OrderSummary[];
}

export interface OrderDetail {
  orderId: number;
  buyerId: number;
  buyerName: string;
  buyerEmail: string;
  ticketId: number;
  ticketTitle: string;
  seatType: string | null;
  quantity: number;
  deliveryMethod: string;
  totalPrice: number;
  status: string;
  reservedAt: string | null;
}

// ---------------------------------------------------------------------------
// 굿즈 관리
// ---------------------------------------------------------------------------

export interface AdminGoodsSummary {
  goodsId: number;
  name: string;
  price: number;
  stock: number;
  thumbnailUrl: string | null;
  isSoldOut: boolean;
}

export interface AdminGoodsListResponse {
  totalElements: number;
  totalPages: number;
  goodsList: AdminGoodsSummary[];
}

export interface AdminGoodsOption {
  optionId: number | null;
  name: string;
  values: string[];
}

export interface AdminGoodsDetail {
  goodsId: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrls: string[];
  options: AdminGoodsOption[];
}

export interface GoodsOptionInput {
  name: string;
  values: string[];
}

export interface CreateGoodsRequest {
  name: string;
  description?: string | null;
  price: number;
  stock?: number;
  imageUrls?: string[];
  options?: GoodsOptionInput[];
}

export type UpdateGoodsRequest = Partial<CreateGoodsRequest>;

// ---------------------------------------------------------------------------
// 어드민 계정 / 등급 / 메뉴 권한
// ---------------------------------------------------------------------------

/** 어드민 콘솔 메뉴 키 (BottomNav 항목과 1:1) */
export type AdminMenuKey =
  | "DASHBOARD"
  | "MEMBERS"
  | "TICKETS"
  | "ORDERS"
  | "GOODS"
  | "ADMINS";

/** 로그인한 어드민 계정의 세션 정보 — /admin/auth/me 응답 */
export interface AdminMeResponse {
  userId: number;
  name: string;
  email: string;
  gradeId: number | null;
  gradeName: string | null;
  isSuper: boolean;
  menuKeys: AdminMenuKey[];
}

export interface AdminAccountSummary {
  adminId: number;
  email: string;
  name: string;
  gradeId: number | null;
  gradeName: string | null;
  isSuper: boolean;
  status: "ACTIVE" | "BLOCKED";
}

export interface AdminAccountListResponse {
  total: number;
  accounts: AdminAccountSummary[];
}

export interface CreateAdminAccountRequest {
  email: string;
  password: string;
  name: string;
  gradeId: number;
}

export interface AdminMenuItem {
  menuKey: AdminMenuKey;
  label: string;
  path: string;
}

export interface AdminGradeSummary {
  gradeId: number;
  name: string;
  description: string | null;
  isSuper: boolean;
  menuKeys: AdminMenuKey[];
  adminCount: number;
}

export interface AdminGradeListResponse {
  grades: AdminGradeSummary[];
  allMenus: AdminMenuItem[];
}

export interface CreateAdminGradeRequest {
  name: string;
  description?: string;
  menuKeys: AdminMenuKey[];
}

export type UpdateAdminGradeRequest = Partial<CreateAdminGradeRequest>;
