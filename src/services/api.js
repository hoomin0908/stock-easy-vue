import axios from "axios";

export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

// GET /api/v1/accounts/me/ → 로그인 상태 확인 및 CSRF 쿠키 발급
export function fetchCurrentUser() {
  return api.get("/accounts/me/");
}

// POST /api/v1/accounts/signup/ → 회원가입
export function signupAccount(payload) {
  return api.post("/accounts/signup/", payload);
}

// POST /api/v1/accounts/login/ → 로그인
export function loginAccount(payload) {
  return api.post("/accounts/login/", payload);
}

// POST /api/v1/accounts/logout/ → 로그아웃
export function logoutAccount() {
  return api.post("/accounts/logout/");
}

/**
 * 아래 함수들은 자리만 잡아둔 상태입니다.
 * 팀원이 Django REST API를 만들면, 실제 엔드포인트 경로/파라미터에 맞춰
 * 이 함수들 내부만 채우면 됩니다. 컴포넌트 쪽 코드는 안 건드려도 되도록
 * 함수 이름과 반환 형태(news 배열, stock 배열 등)는 미리 맞춰뒀어요.
 */

// GET /api/v1/news/  → 뉴스 피드 목록
export function fetchNewsFeed(params = {}) {
  // TODO: 팀원 API 연동. 예상 응답: News + NewsAnalysis + StockImpact 합쳐진 배열
  return api.get("/news/", { params });
}

// GET /api/v1/news/:id/  → 뉴스 상세 (우측 패널 영향분석용)
export function fetchNewsDetail(newsId) {
  // TODO: 팀원 API 연동
  return api.get(`/news/${newsId}/`);
}

// GET /api/v1/stocks/  → 관심종목 후보 검색/목록
export function fetchStocks(params = {}) {
  // TODO: 팀원 API 연동
  return api.get("/stocks/", { params });
}

// GET /api/v1/accounts/watchlist/  → 내 관심종목
export function fetchWatchlist() {
  // TODO: 팀원 API 연동 (accounts 앱 쪽)
  return api.get("/accounts/watchlist/");
}

// GET /api/v1/accounts/saved-terms/  → 저장된 용어
export function fetchSavedTerms() {
  // TODO: 팀원 API 연동
  return api.get("/accounts/saved-terms/");
}
