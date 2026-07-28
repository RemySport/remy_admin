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

/**
 * API 요청 베이스 URL.
 *
 * - 로컬 개발: .env.local 의 NEXT_PUBLIC_API_BASE (예: http://localhost:8080) 사용.
 * - 배포(Netlify) 프로덕션: 빈 문자열("")로 두어 같은(HTTPS) 오리진으로 요청하고,
 *   netlify.toml 의 프록시 redirect(/admin/*, /leagues, /teams)가 실제 백엔드로
 *   중계한다. 백엔드가 아직 인증서 없는 IP(http://13.209.84.103:8080)라서
 *   브라우저가 직접 호출하면 Mixed Content 로 차단되기 때문.
 * - 백엔드 도메인(https://api.remy-sp.com)에 인증서가 붙으면, 프록시 없이
 *   NEXT_PUBLIC_API_BASE 를 그 도메인으로 바로 지정해도 된다.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

/** 폴백 요청 결과. fromMock 으로 지금 화면이 mock 인지 구분할 수 있습니다. */
export interface ApiResult<T> {
  data: T;
  /** true 이면 API 실패로 mock 데이터를 표시 중 */
  fromMock: boolean;
}

const DEFAULT_TIMEOUT = 4000;

/** BaseResponse 공통 포맷 (백엔드 global/common/BaseResponse). */
interface BaseResponse<T> {
  code: number | string;
  message: string;
  result: T;
  isSuccess: boolean;
}

function isBaseResponse(body: unknown): body is BaseResponse<unknown> {
  return (
    typeof body === "object" &&
    body !== null &&
    "isSuccess" in body &&
    "result" in body
  );
}

/** 백엔드가 BaseResponse 포맷({ code, message, result, isSuccess })이면 result 를 벗겨서 반환한다. */
function unwrap<T>(body: unknown): T {
  return (isBaseResponse(body) ? body.result : body) as T;
}

export class ApiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiRequestError";
  }
}

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
      // 쿠키(accessToken/refreshToken) 기반 인증이므로 항상 함께 전송
      credentials: "include",
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
      headers: { "Content-Type": "application/json" },
      ...init,
    });

    const body = await res.json();

    if (!res.ok || (isBaseResponse(body) && body.isSuccess === false)) {
      throw new Error(`API ${path} 응답 오류: ${res.status}`);
    }

    return { data: unwrap<T>(body), fromMock: false };
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

/**
 * mock 폴백 없이 실패 시 throw 하는 요청 헬퍼. 로그인/생성/수정/삭제 등 쓰기 작업에 사용한다.
 * 백엔드 응답이 BaseResponse 포맷이면 result 를 벗겨서 반환한다.
 */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    credentials: "include",
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok || (isBaseResponse(body) && body.isSuccess === false)) {
    const message =
      (isBaseResponse(body) ? body.message : null) ?? `API ${path} 요청 실패 (${res.status})`;
    throw new ApiRequestError(message);
  }

  return unwrap<T>(body);
}
