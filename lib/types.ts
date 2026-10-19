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
  paymentOrderId: string | null;
  paymentStatus: string | null;
  paymentMethod: "CARD" | "TRANSFER" | null;
  buyerName: string;
  buyerEmail: string;
  ticketTitle: string;
  seatType: string | null;
  quantity: number;
  totalPrice: number;
  status: string;
  reservedAt: string | null;
}

export type RefundReason = "LEGAL_REFUND" | "MATCH_CANCELLED" | "SUPPLY_FAILED";

export interface PaymentOperationResponse {
  orderId: string;
  status: string;
  paymentMethod: "CARD" | "TRANSFER";
  paidAmount: number | null;
  approvedAt: string | null;
  reservationStatus: string;
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
// 굿즈 결제(주문) 관리 — 구매관리 화면의 "굿즈" 탭
// ---------------------------------------------------------------------------

export interface AdminGoodsOrderItem {
  goodsId: number;
  name: string;
  /** 예: "사이즈: M / 컬러: 레드". 옵션 없는 상품이면 빈 문자열 */
  optionLabel: string | null;
  quantity: number;
  unitPrice: number;
}

export interface AdminGoodsOrderShipping {
  recipientName: string;
  shippingMethod: string;
  zonecode: string;
  address: string;
  addressDetail: string;
  deliveryMessage: string | null;
}

export interface AdminGoodsOrderSummary {
  orderId: number;
  /** 결제 시도 전이면 null */
  paymentOrderId: string | null;
  paymentStatus: string | null;
  paymentMethod: "CARD" | "TRANSFER" | null;
  buyerName: string;
  buyerEmail: string;
  items: AdminGoodsOrderItem[];
  totalQuantity: number;
  totalPrice: number;
  status: string;
  orderedAt: string | null;
  /** 배송지 필드 추가 이전 주문은 null */
  shipping: AdminGoodsOrderShipping | null;
}

export interface AdminGoodsOrderListResponse {
  totalElements: number;
  totalPages: number;
  orders: AdminGoodsOrderSummary[];
}

// ---------------------------------------------------------------------------
// 굿즈 관리
// ---------------------------------------------------------------------------

export interface AdminGoodsSummary {
  goodsId: number;
  name: string;
  /** 정가 */
  price: number;
  /** 할인율(%), 할인 없으면 0 */
  discountRate: number;
  /** 할인 적용 판매가 (원 단위 미만 버림) */
  salePrice: number;
  /** 옵션 조합(사이즈 등)별 재고 합계 */
  stock: number;
  thumbnailUrl: string | null;
  isSoldOut: boolean;
  status: GoodsStatus;
  /** 공급처 코드(CAPOSTORE). 직접 등록 상품은 null */
  source: string | null;
  taxonomy: AdminGoodsTaxonomy | null;
}

/** ON_SALE: 판매중 / HIDDEN: 관리자 숨김 / SOURCE_UNAVAILABLE: 공급처에서 내려가거나 할인으로 바뀌어 동기화가 판매중지 */
export type GoodsStatus = "ON_SALE" | "HIDDEN" | "SOURCE_UNAVAILABLE";

export interface AdminGoodsTaxonomy {
  brandId: number | null;
  brandName: string | null;
  clubId: number | null;
  clubName: string | null;
  categoryId: number | null;
  categoryName: string | null;
  /** true 면 관리자가 지정한 상품종류라 동기화 자동분류가 덮어쓰지 않음 */
  categoryLocked: boolean;
}

/** 분류 선택지. extra 는 구단이면 리그, 상품종류면 code */
export interface GoodsTaxonomyOption {
  id: number;
  name: string;
  extra: string | null;
}

export interface GoodsTaxonomyOptionsResponse {
  brands: GoodsTaxonomyOption[];
  clubs: GoodsTaxonomyOption[];
  categories: GoodsTaxonomyOption[];
}

export type GoodsSyncStatus = "RUNNING" | "SUCCEEDED" | "PARTIAL" | "FAILED";

export interface GoodsSyncRun {
  runId: number;
  source: string;
  /** GITHUB(주간 워크플로) / ADMIN(어드민 수동 실행) */
  triggerType: string;
  status: GoodsSyncStatus;
  startedAt: string;
  finishedAt: string | null;
  seenCount: number;
  createdCount: number;
  updatedCount: number;
  unavailableCount: number;
  skippedCount: number;
  failedCount: number;
  message: string | null;
}

export interface GoodsSyncRunListResponse {
  totalElements: number;
  runs: GoodsSyncRun[];
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

export interface AdminGoodsVariant {
  variantId: number | null;
  /** goods.options 배열 순서에 대응하는 값 조합 (예: ["M"], ["M", "블랙"]) */
  optionValues: string[];
  stock: number;
}

export interface AdminGoodsDetail {
  goodsId: number;
  name: string;
  description: string | null;
  price: number;
  discountRate: number;
  salePrice: number;
  stock: number;
  imageUrls: string[];
  options: AdminGoodsOption[];
  variants: AdminGoodsVariant[];
  status: GoodsStatus;
  source: string | null;
  /** 공급처 상품 페이지 */
  sourceUrl: string | null;
  /** 마지막 공급처 동기화 시각 */
  sourceSyncedAt: string | null;
  taxonomy: AdminGoodsTaxonomy | null;
}

export interface GoodsOptionInput {
  name: string;
  values: string[];
}

export interface GoodsVariantInput {
  optionValues: string[];
  stock: number;
}

export interface CreateGoodsRequest {
  name: string;
  description?: string | null;
  price: number;
  /** 할인율(%), 0~99 */
  discountRate?: number;
  stock?: number;
  imageUrls?: string[];
  options?: GoodsOptionInput[];
  variants?: GoodsVariantInput[];
  brandId?: number | null;
  clubId?: number | null;
  /** 지정하면 상품종류가 잠겨 동기화 자동분류가 덮어쓰지 않는다 */
  categoryId?: number | null;
}

/** 공급처 동기화 상품은 options/variants 를 보낼 수 없다(409 GDS4015). status 는 ON_SALE/HIDDEN 만 가능. */
export type UpdateGoodsRequest = Partial<CreateGoodsRequest> & {
  status?: Exclude<GoodsStatus, "SOURCE_UNAVAILABLE">;
};

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
