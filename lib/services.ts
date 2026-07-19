// 화면에서 호출하는 데이터 서비스.
// 각 함수는 가상 API 로 요청 → 실패 시 mock 으로 폴백한다.
import { fetchWithFallback, type ApiResult } from "./api";
import { mockDashboard } from "./mock/dashboard";
import { mockMembers } from "./mock/members";
import type { DashboardData, MemberListResponse } from "./types";

/** 대시보드 데이터 조회 */
export function getDashboard(): Promise<ApiResult<DashboardData>> {
  return fetchWithFallback("/admin/dashboard", mockDashboard);
}

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
