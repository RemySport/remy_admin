// -----------------------------------------------------------------------------
// 가상 API 클라이언트
//
// 실제 백엔드가 아직 없으므로, 아래 BASE_URL 로 요청을 "실제로" 보냅니다.
// 요청이 실패(네트워크 오류 / 4xx·5xx / 타임아웃)하면 catch 로 떨어져
// 인자로 받은 mock 데이터를 그대로 반환합니다.
//
// 👉 나중에 백엔드가 준비되면 NEXT_PUBLIC_API_BASE 환경변수만 실제 주소로
//    바꿔주면 됩니다. 응답 스키마(lib/types.ts)만 맞으면 mock 은 자동으로
//    fallback 으로만 남고, 화면 코드는 손댈 필요가 없습니다.
// -----------------------------------------------------------------------------

/** 가상 API 주소 — 실제 서버가 없으므로 항상 실패 → mock 으로 폴백됩니다. */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "https://api.remy.example.com";

/** 폴백 요청 결과. fromMock 으로 지금 화면이 mock 인지 구분할 수 있습니다. */
export interface ApiResult<T> {
  data: T;
  /** true 이면 API 실패로 mock 데이터를 표시 중 */
  fromMock: boolean;
}

const DEFAULT_TIMEOUT = 4000;

/**
 * `path` 로 GET 요청을 보내고, 실패하면 `fallback`(mock) 을 반환한다.
 *
 * @param path      API_BASE 뒤에 붙는 경로 (예: "/admin/dashboard")
 * @param fallback  실패 시 사용할 mock 데이터
 */
export async function fetchWithFallback<T>(
  path: string,
  fallback: T,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      // 캐시 없이 매번 시도 (실서버 붙기 전까지는 사실상 항상 실패)
      cache: "no-store",
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
      headers: { "Content-Type": "application/json" },
      ...init,
    });

    if (!res.ok) {
      throw new Error(`API ${path} 응답 오류: ${res.status}`);
    }

    const data = (await res.json()) as T;
    return { data, fromMock: false };
  } catch (err) {
    // 실서버가 없거나 오류일 때 — mock 으로 폴백
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[api] "${path}" 요청 실패 → mock 데이터로 대체합니다.`,
        err,
      );
    }
    return { data: fallback, fromMock: true };
  }
}
