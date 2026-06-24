<template>
  <div ref="splitContainer" class="split-container" :class="{ resizing: isResizing }">
    <aside
      class="list-side"
      :class="{ 'has-detail': route.params.id }"
      :style="route.params.id ? { width: `${listWidth}px` } : undefined"
    >
      
      <div class="filter-bar">
        <div v-if="route.query.stockId || route.query.themeId" class="selected-company-label">
          <strong>
            {{ route.query.stockName || route.query.themeName || "선택 항목" }}
          </strong>
          <span>관련 뉴스</span>
        </div>

        <button
          v-for="f in filters"
          :key="f.value"
          class="filter-chip"
          :class="{ active: activeFilter === f.value }"
          @click="handleFilterClick(f.value)"
        >
          {{ f.label }}
        </button>
      </div>

      <div class="list-scroll">
        <div v-if="isNewsLoading" class="empty-state" style="margin-top: 40px">
          뉴스를 불러오는 중입니다...
        </div>

        <div v-else-if="newsError" class="empty-state error-state" style="margin-top: 40px">
          {{ newsError }}
          <button class="retry-btn" type="button" @click="loadNews">다시 시도</button>
        </div>

        <div v-else-if="displayNewsList.length === 0" class="empty-state" style="margin-top: 40px">
          <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="1.6" fill="none">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          표시할 뉴스가 없어요<br />
          <span style="font-size: 11px; color: var(--text3)">선택하신 테마 및 감정 조건의 기사가 부재합니다.</span>
        </div>

        <NewsCard 
          v-for="newsItem in displayNewsPage" 
          :key="newsItem.id" 
          :news="newsItem" 
          :class="{ active: route.params.id == newsItem.id }"
        />
      </div>

      <div v-if="displayNewsList.length > pageSize" class="pagination-bar">
        <button type="button" class="page-nav-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
          이전
        </button>

        <div class="page-number-list">
          <button
            v-for="page in visiblePageNumbers"
            :key="page"
            type="button"
            class="page-number-btn"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button type="button" class="page-nav-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
          다음
        </button>
      </div>
    </aside>

    <div
      v-if="route.params.id"
      class="split-resizer"
      role="separator"
      aria-label="뉴스 목록과 상세 화면 너비 조절"
      aria-orientation="vertical"
      @pointerdown="startResize"
    >
      <span></span>
    </div>

    <section v-if="route.params.id" class="detail-side">
      <button
        type="button"
        class="mobile-list-back"
        @click="goBackToList"
      >
        ← 뉴스 목록
      </button>

      <router-view :news-list="newsList" />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import NewsCard from "../components/news/NewsCard.vue";
import {
  fetchNewsFeed,
  fetchNewsByStock,
  fetchNewsByTheme,
} from "../services/api";

const route = useRoute();
const router = useRouter();
const splitContainer = ref(null);
const listWidth = ref(400);
const isResizing = ref(false);

// App.vue 전역 관심종목 검색어 Inject
const selectedStockFilter = inject("selectedStockFilter", ref(null));

const filters = [
  { label: "전체", value: "ALL" },
  { label: "호재", value: "POSITIVE" },
  { label: "악재", value: "NEGATIVE" },
  { label: "중립", value: "NEUTRAL" },
];
const activeFilter = ref("ALL");
const newsList = ref([]);
const isNewsLoading = ref(false);
const newsError = ref("");
const currentPage = ref(1);
const pageSize = 14;
let latestNewsRequestId = 0;

function clampListWidth(width) {
  const containerWidth = splitContainer.value?.clientWidth || window.innerWidth;
  const minWidth = containerWidth < 1100 ? 240 : 280;
  const maxWidth = Math.min(760, containerWidth - 280);
  return Math.min(Math.max(width, minWidth), maxWidth);
}

function startResize(event) {
  if (window.innerWidth <= 760) return;

  event.preventDefault();
  isResizing.value = true;
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
  window.addEventListener("pointermove", handleResize);
  window.addEventListener("pointerup", stopResize, { once: true });
}

function handleResize(event) {
  if (!isResizing.value || !splitContainer.value) return;

  const containerLeft = splitContainer.value.getBoundingClientRect().left;
  listWidth.value = clampListWidth(event.clientX - containerLeft);
}

function stopResize() {
  isResizing.value = false;
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
  window.removeEventListener("pointermove", handleResize);
}

function handleWindowResize() {
  listWidth.value = clampListWidth(listWidth.value);
}

function goBackToList() {
  router.push({ path: "/news", query: route.query });
}

const themeKeywords = {
  "반도체": ["반도체", "칩", "삼성전자", "SK하이닉스", "엔비디아", "파운드리", "HBM", "설계"],
  "IT · 플랫폼": ["IT", "플랫폼", "네이버", "카카오", "구글", "소프트웨어", "포털", "웹툰", "서비스"],
  "자동차": ["자동차", "차량", "현대차", "기아", "완성차", "모빌리티", "부품", "전기차"],
  "바이오": ["바이오", "제약", "헬스케어", "임상", "신약", "셀트리온", "삼성바이오", "의료", "백신"],
  "금융": ["금융", "은행", "금리", "환율", "KB국민", "신한", "우리", "하나", "증권", "투자", "대출"],
  "에너지": ["에너지", "정유", "태양광", "풍력", "유가", "석유", "가스", "전력", "발전"],
  "2차전지": ["2차전지", "배터리", "양극재", "에코프로", "포스코퓨처", "LG엔솔", "삼성SDI", "리튬"],
  "엔터테인먼트": ["엔터", "하이브", "SM", "JYP", "YG", "콘서트", "음원", "K팝", "드라마", "영화"],
  "우주항공": ["우주", "항공", "위성", "발사체", "KAI", "한화에어로", "드론", "UAM", "방산"],
  "인공지능(AI)": ["인공지능", "AI", "챗GPT", "LLM", "딥러닝", "머신러닝", "생성형", "로봇"]
};

// 1. 백엔드 전체 목록 원본 데이터 스캔 엔진 (API 명세 완전 방어)
const loadNews = async () => {
  const requestId = ++latestNewsRequestId;
  const stockId = route.query.stockId;
  const themeId = route.query.themeId;

  isNewsLoading.value = true;
  newsError.value = "";

  try {
    let response;

    if (stockId) {
      response = await fetchNewsByStock(stockId);
    } else if (themeId) {
      response = await fetchNewsByTheme(themeId);
    } else {
      response = await fetchNewsFeed();
    }

    if (requestId !== latestNewsRequestId) return;

    newsList.value = Array.isArray(response.data)
      ? response.data
      : (response.data?.results || []);
  } catch (error) {
    if (requestId !== latestNewsRequestId) return;

    console.error("API 요청 실패:", error);
    newsList.value = [];
    newsError.value = stockId
      ? "관심 기업 뉴스를 불러오지 못했습니다."
      : themeId
        ? "추천 테마 뉴스를 불러오지 못했습니다."
        : "뉴스를 불러오지 못했습니다.";
  } finally {
    if (requestId === latestNewsRequestId) {
      isNewsLoading.value = false;
    }
  }
};

function handleFilterClick(value) {
  activeFilter.value = value;

  if (value === "ALL" && (route.query.stockId || route.query.themeId)) {
    router.push({ path: "/", query: {} });
  }
}

// 💡 2. 자식(NewsCard)의 가중치 판별 알고리즘을 100% 동일하게 복제
function getNewsSentiment(item) {
  if (item.ai_analysis?.sentiment) {
    return item.ai_analysis.sentiment.toLowerCase().trim();
  }

  const title = item.title || "";
  const content = item.content || "";
  const fullText = (title + " " + content).toLowerCase();

  const positiveKeywords = ["상승", "돌파", "기부", "호실적", "최대", "급등", "성장", "흑자", "순항", "강세", "오름세", "인상", "수혜", "계약 체결", "도약", "유치"];
  const negativeKeywords = ["폭락", "대폭락", "낙폭", "증발", "털썩", "곡소리", "급락", "하락", "적자", "손실", "리스크", "붕괴", "위기", "압박", "쇼크", "우려", "통보"];

  let positiveScore = 0;
  let negativeScore = 0;

  positiveKeywords.forEach(kw => { if (fullText.includes(kw)) positiveScore += 1.5; });
  negativeKeywords.forEach(kw => { if (fullText.includes(kw)) negativeScore += 1.5; });

  if (positiveScore > negativeScore) return "positive";
  if (negativeScore > positiveScore) return "negative";
  return "neutral";
}

// 3. 💡 실시간 클라이언트 삼중 필터링 코어 (동적 반응성 축)
const displayNewsList = computed(() => {
  let list = [...newsList.value];

  // [필터 1] 상단 관심 종목 검색바 필터링
  if (selectedStockFilter.value) {
    list = list.filter(n => {
      const matchImpact = n.related_stocks?.some(s => s.stock_name === selectedStockFilter.value);
      const matchTitle = n.title?.includes(selectedStockFilter.value);
      return matchImpact || matchTitle;
    });
  }

  // [필터 2] 사이드바 인기 섹터/테마 필터링 (딕셔너리 연관어 매핑)
  if (route.query.sector) {
    const targetTheme = route.query.sector;
    const keywords = themeKeywords[targetTheme];

    if (keywords && keywords.length > 0) {
      list = list.filter(n => {
        const titleLower = n.title?.toLowerCase() || "";
        const contentLower = n.content?.toLowerCase() || "";
        return keywords.some(keyword => {
          const kwLower = keyword.toLowerCase();
          return titleLower.includes(kwLower) || contentLower.includes(kwLower);
        });
      });
    } else {
      list = list.filter(n => {
        return n.title?.toLowerCase().includes(targetTheme.toLowerCase()) || 
               n.content?.toLowerCase().includes(targetTheme.toLowerCase());
      });
    }
  }

  // [필터 3] 🎯 상단 호재/악재 칩 버튼 실시간 필터링
  if (activeFilter.value !== "ALL") {
    const targetValue = activeFilter.value.toLowerCase();
    list = list.filter(n => getNewsSentiment(n) === targetValue);
  }

  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(displayNewsList.value.length / pageSize))
);

const displayNewsPage = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return displayNewsList.value.slice(start, start + pageSize);
});

const visiblePageNumbers = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;

  const start = Math.max(1, current - 2);
  const end = Math.min(total, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  const pages = [];

  for (let page = adjustedStart; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
});

function goToPage(page) {
  currentPage.value = Math.min(
    Math.max(page, 1),
    totalPages.value
  );
}

watch(
  [
    () => route.query.stockId,
    () => route.query.themeId,
    () => route.query.sector,
  ],
  () => {
    selectedStockFilter.value = null;
    loadNews();
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener("resize", handleWindowResize);
});

onUnmounted(() => {
  stopResize();
  window.removeEventListener("resize", handleWindowResize);
});

watch(
  [() => activeFilter.value, () => route.query.sector, () => selectedStockFilter.value, () => newsList.value.length],
  () => {
    currentPage.value = 1;
  }
);
</script>

<style scoped>
.split-container { display: flex; width: 100%; height: 100%; background: var(--bg2); overflow: hidden; }
.split-container.resizing { cursor: col-resize; }
.list-side {
  flex: 1;
  min-width: 0;
  height: calc(100% - 16px);
  margin: 8px;
  border: 1px solid var(--border);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  background: var(--cream);
  overflow: hidden;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.42);
}
.list-side.has-detail { flex: 0 0 auto; min-width: 240px; max-width: 760px; }
.split-resizer { position: relative; flex: 0 0 8px; margin-left: -4px; margin-right: -4px; z-index: 5; cursor: col-resize; touch-action: none; }
.split-resizer::before { content: ""; position: absolute; top: 0; bottom: 0; left: 3px; width: 2px; background: transparent; transition: background 0.15s ease; }
.split-resizer:hover::before, .resizing .split-resizer::before { background: var(--primary, #ff5a1f); }
.split-resizer span { position: absolute; top: 50%; left: 1px; width: 6px; height: 42px; transform: translateY(-50%); border-radius: 4px; background: #cbd5e1; opacity: 0; transition: opacity 0.15s ease, background 0.15s ease; }
.split-resizer:hover span, .resizing .split-resizer span { opacity: 1; background: var(--primary, #ff5a1f); }
.filter-bar { display: flex; gap: 10px; padding: 18px; background: var(--cream); border-bottom: 1px solid var(--border); }
.filter-chip { padding: 8px 16px; border-radius: 999px; border: 1px solid var(--border); background: var(--cream); font-size: 12.5px; font-weight: 700; color: var(--text2); cursor: pointer; transition: all 0.18s ease; }
.filter-chip:hover { border-color: var(--primary-border); color: var(--primary); }
.filter-chip.active { background: linear-gradient(90deg, #ff5a00, #ff9500); color: #ffffff; border-color: transparent; font-weight: 800; box-shadow: 0 0 22px rgba(255, 106, 0, 0.18); }
.list-scroll { flex: 1; overflow-y: auto; padding: 16px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-content: start; gap: 14px; }
.list-scroll.detail-open { display: flex; flex-direction: column; gap: 12px; }
.list-scroll > .empty-state { grid-column: 1 / -1; }
.list-scroll::-webkit-scrollbar { width: 4px; }
.list-scroll::-webkit-scrollbar-thumb { background: #d6dde5; border-radius: 2px; }
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 18px 18px;
  border-top: 1px solid var(--border);
  background: var(--cream);
}
.page-number-list { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: center; }
.page-nav-btn,
.page-number-btn {
  border: 1px solid var(--border);
  background: var(--cream);
  color: var(--text2);
  border-radius: 999px;
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.page-nav-btn:hover,
.page-number-btn:hover { border-color: var(--primary-border); color: var(--primary); }
.page-number-btn.active { background: var(--primary); border-color: var(--primary); color: #ffffff; }
.page-nav-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.detail-side { flex: 1.3; min-width: 0; height: 100%; background: var(--bg2); display: flex; flex-direction: column; }
.mobile-list-back { display: none; }
.select-notice { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px; }
.select-notice h3 { font-size: 16px; font-weight: 700; color: var(--text1); margin-top: 16px; }
.select-notice p { color: var(--text3); font-size: 13px; line-height: 1.6; margin-top: 8px; }
.notice-icon { width: 40px; height: 40px; stroke: var(--text3); stroke-width: 1.5; fill: none; }
.empty-state { text-align: center; color: var(--text3); font-size: 13px; line-height: 1.6; }

@media (max-width: 1100px) {
  .list-side.has-detail { min-width: 240px; }
  .filter-bar { padding: 12px; gap: 6px; }
  .filter-chip { flex: 1; padding: 6px 8px; }
  .list-scroll { padding: 12px; }
}

@media (max-width: 900px) {
  .list-scroll { grid-template-columns: 1fr; }
}

@media (max-width: 760px) {
  .split-container { position: relative; }
  .list-side.has-detail { display: none; }
  .split-resizer { display: none; }
  .detail-side { flex: 1; width: 100%; }
  .mobile-list-back { display: inline-flex; align-items: center; align-self: flex-start; margin: 10px 12px 0; padding: 7px 11px; border: 1px solid var(--border); border-radius: 7px; background: var(--cream); color: var(--text2); font-size: 12px; font-weight: 650; cursor: pointer; z-index: 2; }
}
</style>
