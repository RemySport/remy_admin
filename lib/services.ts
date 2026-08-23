// 화면에서 호출하는 데이터 서비스.
// 각 함수는 가상 API 로 요청 → 실패 시 mock 으로 폴백한다.
import { apiRequest, apiUpload, fetchWithFallback, type ApiResult } from "./api";
import { mockDashboard } from "./mock/dashboard";
import { mockMembers } from "./mock/members";
import {
  mockAdminAccounts,
  mockAdminGrades,
  mockAdminMe,
} from "./mock/admin";
import { mockGoodsDetail, mockGoodsList } from "./mock/goods";
import { mockOrderDetail, mockOrders } from "./mock/orders";
import {
  mockLeagues,
  mockStadiums,
  mockTeams,
  mockTicketDetail,
  mockTickets,
} from "./mock/tickets";
import type {
  AdminAccountListResponse,
  AdminAccountSummary,
  AdminGoodsDetail,
  AdminGoodsListResponse,
  AdminGradeListResponse,
  AdminGradeSummary,
  AdminMeResponse,
  CreateAdminAccountRequest,
  CreateAdminGradeRequest,
  CreateGoodsRequest,
  CreateTicketRequest,
  DashboardData,
  LeagueBrief,
  MemberGroup,
  MemberListResponse,
  MemberStatus,
  OrderDetail,
  OrderListResponse,
  StadiumBrief,
  TeamBrief,
  TicketDetail,
  TicketListResponse,
  UpdateAdminGradeRequest,
  UpdateGoodsRequest,
  UpdateTicketRequest,
} from "./types";

/** 대시보드 데이터 조회 */
export function getDashboard(): Promise<ApiResult<DashboardData>> {
  return fetchWithFallback("/admin/dashboard", mockDashboard);
}

// ---------------------------------------------------------------------------
// 회원(유저) 관리
// ---------------------------------------------------------------------------

export interface MemberQuery {
  group?: string;
  status?: string;
  keyword?: string;
}

/** 회원 목록 조회 (필터/검색은 쿼리스트링으로 전달) */
export function getMembers(
  query: MemberQuery = {},
): Promise<ApiResult<MemberListResponse>> {
  const params = new URLSearchParams();
  if (query.group && query.group !== "전체") params.set("group", query.group);
  if (query.status && query.status !== "전체") params.set("status", query.status);
  if (query.keyword) params.set("keyword", query.keyword);

  const qs = params.toString();
  return fetchWithFallback(
    `/admin/members${qs ? `?${qs}` : ""}`,
    mockMembers,
  );
}

/** 회원 그룹 변경 */
export function updateMemberGroup(id: number, group: MemberGroup) {
  return apiRequest(`/admin/members/${id}/group`, {
    method: "PATCH",
    body: JSON.stringify({ group }),
  });
}

/** 회원 상태(정상/차단) 변경 */
export function updateMemberStatus(id: number, status: MemberStatus) {
  return apiRequest(`/admin/members/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ---------------------------------------------------------------------------
// 티켓(경기) 관리
// ---------------------------------------------------------------------------

export interface TicketQuery {
  keyword?: string;
  status?: string;
  leagueId?: number;
  page?: number;
  size?: number;
}

export function getTickets(query: TicketQuery = {}): Promise<ApiResult<TicketListResponse>> {
  const params = new URLSearchParams();
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.status && query.status !== "전체") params.set("status", query.status);
  if (query.leagueId) params.set("leagueId", String(query.leagueId));
  params.set("page", String(query.page ?? 1));
  params.set("size", String(query.size ?? 20));
  return fetchWithFallback(`/admin/tickets?${params.toString()}`, mockTickets);
}

export function getTicket(id: number): Promise<ApiResult<TicketDetail>> {
  return fetchWithFallback(`/admin/tickets/${id}`, mockTicketDetail);
}

export function createTicket(request: CreateTicketRequest) {
  return apiRequest<TicketDetail>("/admin/tickets", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateTicket(id: number, request: UpdateTicketRequest) {
  return apiRequest<TicketDetail>(`/admin/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export function deleteTicket(id: number) {
  return apiRequest<string>(`/admin/tickets/${id}`, { method: "DELETE" });
}

export function updateTicketStatus(
  id: number,
  request: { reservationStatus?: string; isReservable?: boolean },
) {
  return apiRequest<TicketDetail>(`/admin/tickets/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export function getTicketStadiums(): Promise<ApiResult<StadiumBrief[]>> {
  return fetchWithFallback("/admin/tickets/stadiums", mockStadiums);
}

/** 리그 목록 — 공개 API 재사용 (등록 폼 드롭다운용) */
export function getLeagues(): Promise<ApiResult<LeagueBrief[]>> {
  return fetchWithFallback("/leagues", mockLeagues);
}

/** 팀 목록 — 공개 API 재사용 (등록 폼 드롭다운용) */
export function getTeams(leagueId?: number): Promise<ApiResult<TeamBrief[]>> {
  const qs = leagueId ? `?leagueId=${leagueId}` : "";
  return fetchWithFallback(`/teams${qs}`, mockTeams);
}

// ---------------------------------------------------------------------------
// 구매(예약) 관리
// ---------------------------------------------------------------------------

export interface OrderQuery {
  status?: string;
  keyword?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export function getOrders(query: OrderQuery = {}): Promise<ApiResult<OrderListResponse>> {
  const params = new URLSearchParams();
  if (query.status && query.status !== "전체") params.set("status", query.status);
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  params.set("page", String(query.page ?? 1));
  params.set("size", String(query.size ?? 20));
  return fetchWithFallback(`/admin/orders?${params.toString()}`, mockOrders);
}

export function getOrder(id: number): Promise<ApiResult<OrderDetail>> {
  return fetchWithFallback(`/admin/orders/${id}`, mockOrderDetail);
}

export function cancelOrder(id: number, reason?: string) {
  return apiRequest(`/admin/orders/${id}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

// ---------------------------------------------------------------------------
// 굿즈 관리
// ---------------------------------------------------------------------------

export interface GoodsQuery {
  keyword?: string;
  page?: number;
  size?: number;
}

export function getGoodsList(query: GoodsQuery = {}): Promise<ApiResult<AdminGoodsListResponse>> {
  const params = new URLSearchParams();
  if (query.keyword) params.set("keyword", query.keyword);
  params.set("page", String(query.page ?? 1));
  params.set("size", String(query.size ?? 20));
  return fetchWithFallback(`/admin/goods?${params.toString()}`, mockGoodsList);
}

export function getGoods(id: number): Promise<ApiResult<AdminGoodsDetail>> {
  return fetchWithFallback(`/admin/goods/${id}`, mockGoodsDetail);
}

export function createGoods(request: CreateGoodsRequest) {
  return apiRequest<AdminGoodsDetail>("/admin/goods", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateGoods(id: number, request: UpdateGoodsRequest) {
  return apiRequest<AdminGoodsDetail>(`/admin/goods/${id}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export function deleteGoods(id: number) {
  return apiRequest<string>(`/admin/goods/${id}`, { method: "DELETE" });
}

/** 굿즈 이미지 첨부 업로드 — S3(goods/images/)에 저장되고 접근 URL을 반환한다. */
export function uploadGoodsImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload<{ url: string }>("/admin/goods/images", formData);
}

// ---------------------------------------------------------------------------
// 어드민 로그인
// ---------------------------------------------------------------------------

export interface AdminLoginResponse {
  userId: number;
  name: string;
  email: string;
}

export function adminLogin(email: string, password: string) {
  return apiRequest<AdminLoginResponse>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function adminLogout() {
  return apiRequest<string>("/admin/auth/logout", { method: "POST" });
}

/** 로그인한 어드민 세션 정보 + 등급별 메뉴 권한 조회 */
export function getAdminMe(): Promise<ApiResult<AdminMeResponse>> {
  return fetchWithFallback("/admin/auth/me", mockAdminMe);
}

// ---------------------------------------------------------------------------
// 어드민 계정 관리 (슈퍼 관리자 전용)
// ---------------------------------------------------------------------------

export function getAdminAccounts(): Promise<ApiResult<AdminAccountListResponse>> {
  return fetchWithFallback("/admin/accounts", mockAdminAccounts);
}

export function createAdminAccount(request: CreateAdminAccountRequest) {
  return apiRequest<AdminAccountSummary>("/admin/accounts", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateAdminAccountGrade(id: number, gradeId: number) {
  return apiRequest<AdminAccountSummary>(`/admin/accounts/${id}/grade`, {
    method: "PATCH",
    body: JSON.stringify({ gradeId }),
  });
}

export function updateAdminAccountStatus(id: number, status: "ACTIVE" | "BLOCKED") {
  return apiRequest<AdminAccountSummary>(`/admin/accounts/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ---------------------------------------------------------------------------
// 어드민 등급 관리 (슈퍼 관리자 전용)
// ---------------------------------------------------------------------------

export function getAdminGrades(): Promise<ApiResult<AdminGradeListResponse>> {
  return fetchWithFallback("/admin/grades", mockAdminGrades);
}

export function createAdminGrade(request: CreateAdminGradeRequest) {
  return apiRequest<AdminGradeSummary>("/admin/grades", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateAdminGrade(id: number, request: UpdateAdminGradeRequest) {
  return apiRequest<AdminGradeSummary>(`/admin/grades/${id}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export function deleteAdminGrade(id: number) {
  return apiRequest<string>(`/admin/grades/${id}`, { method: "DELETE" });
}
