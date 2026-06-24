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

// GET /api/v1/stocks/interests/ → 내 관심 기업 조회
export function fetchInterestStocks() {
  return api.get("/stocks/interests/");
}

// POST /api/v1/stocks/interests/ → 관심 기업 등록
export function createInterestStock(stockId) {
  return api.post("/stocks/interests/", { stock_id: stockId });
}

// DELETE /api/v1/stocks/interests/:interestStockId/ → 관심 기업 삭제
export function deleteInterestStock(interestStockId) {
  return api.delete(`/stocks/interests/${interestStockId}/`);
}

// GET /api/v1/news/stocks/:stockId/ → 관심 기업별 뉴스 조회
export function fetchNewsByStock(stockId) {
  return api.get(`/news/stocks/${stockId}/`);
}

// GET /api/v1/stocks/interests/themes/ → 관심 기업 기반 추천 테마 조회
export function fetchRecommendedThemes() {
  return api.get("/stocks/interests/themes/");
}

// GET /api/v1/news/themes/:themeId/ → 테마별 뉴스 조회
export function fetchNewsByTheme(themeId) {
  return api.get(`/news/themes/${themeId}/`);
}

// GET /api/v1/accounts/watchlist/  → 내 관심종목
export function fetchWatchlist() {
  // TODO: 팀원 API 연동 (accounts 앱 쪽)
  return api.get("/accounts/watchlist/");
}

// GET /api/v1/terms/my/ → 저장 용어 조회
export function fetchSavedTerms() {
  return api.get("/terms/my/");
}

// POST /api/v1/terms/my/ → 저장 용어 등록
export function saveTerm(term, explanation, newsId) {
  return api.post("/terms/my/", {
    term,
    explanation,
    news_id: newsId ?? null,
  });
}

// DELETE /api/v1/terms/my/:userTermId/ → 저장 용어 삭제
export function deleteSavedTerm(userTermId) {
  return api.delete(`/terms/my/${userTermId}/`);
}

// GET /api/v1/comments/news/:newsId/ → 뉴스별 댓글 조회
export function fetchComments(newsId) {
  return api.get(`/comments/news/${newsId}/`);
}

// POST /api/v1/comments/news/:newsId/create/ → 댓글 작성
export function createComment(newsId, content) {
  return api.post(`/comments/news/${newsId}/create/`, { content });
}

// PATCH /api/v1/comments/:commentId/ → 댓글 수정
export function updateComment(commentId, content) {
  return api.patch(`/comments/${commentId}/`, { content });
}

// DELETE /api/v1/comments/:commentId/ → 댓글 삭제
export function deleteComment(commentId) {
  return api.delete(`/comments/${commentId}/`);
}
