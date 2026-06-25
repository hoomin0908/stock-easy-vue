<template>
  <div ref="splitContainer" class="split-container" :class="{ resizing: isResizing }">
    <aside
      class="list-side"
      :class="{ 'has-detail': route.params.id }"
      :style="route.params.id ? { width: `${listWidth}px` } : undefined"
    >
      
      <div class="filter-bar">
        <div
          v-if="selectedNewsScopeLabel"
          class="selected-company-label"
          :class="{ 'topic-search-label': isTopicSearch }"
        >
          <strong>
            {{ selectedNewsScopeLabel }}
          </strong>
          <span>{{ isTopicSearch ? "주제 검색 결과" : "관련 뉴스" }}</span>
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

      <div class="list-scroll" :class="{ 'detail-open': route.params.id }">
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
const clientFilterMode = ref({ stock: false, theme: false });
let latestNewsRequestId = 0;

const isTopicSearch = computed(() => Boolean(route.query.sector));
const selectedNewsScopeLabel = computed(() => {
  if (route.query.sector) return `"${route.query.sector}"`;
  return route.query.stockName || route.query.themeName || "";
});

function normalizeNewsResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

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

function getTopicSearchText(item) {
  const relatedThemes = Array.isArray(item.related_themes)
    ? item.related_themes
        .map(theme => theme.name || theme.theme_name || theme.title)
        .filter(Boolean)
        .join(" ")
    : "";

  return [
    item.topic,
    item.subject,
    item.category,
    item.theme,
    item.theme_name,
    item.ai_analysis?.topic,
    item.ai_analysis?.theme,
    relatedThemes,
    item.title,
    item.content,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getRelatedStocks(item) {
  return [
    ...(Array.isArray(item.related_stocks) ? item.related_stocks : []),
    ...(Array.isArray(item.news_stocks) ? item.news_stocks : []),
  ];
}

function normalizeSearchValue(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "");
}

function getStockAliases(stockName) {
  const normalizedName = normalizeSearchValue(stockName);
  const aliases = [normalizedName];

  if (normalizedName.includes("현대자동차")) aliases.push("현대차");
  if (normalizedName.includes("현대차")) aliases.push("현대자동차");
  if (normalizedName.includes("삼성전자")) aliases.push("삼전");
  if (normalizedName.includes("kb국민은행")) aliases.push("국민은행", "kb금융");

  return aliases.filter(Boolean);
}

function getStockSearchText(item) {
  const relatedStocks = getRelatedStocks(item)
    .map(stock => [
      stock.id,
      stock.stock_id,
      stock.stock?.id,
      stock.stock_name,
      stock.stockName,
      stock.name,
      stock.stock?.stock_name,
      stock.stock?.name,
      stock.stock_code,
      stock.stock?.stock_code,
    ].filter(Boolean).join(" "))
    .join(" ");

  return [
    relatedStocks,
    item.title,
    item.content,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesStockFilter(item) {
  const stockId = route.query.stockId ? String(route.query.stockId) : "";
  const stockName = route.query.stockName ? String(route.query.stockName) : "";
  const relatedStocks = getRelatedStocks(item);

  const idMatches = stockId && relatedStocks.some(stock => {
    const candidateIds = [
      stock.id,
      stock.stock_id,
      stock.stock?.id,
    ].filter(value => value !== undefined && value !== null).map(String);

    return candidateIds.includes(stockId);
  });

  if (idMatches) return true;
  if (!stockName) return false;

  const searchText = normalizeSearchValue(getStockSearchText(item));
  return getStockAliases(stockName).some(alias => searchText.includes(alias));
}

function matchesThemeFilter(item) {
  const themeId = route.query.themeId ? String(route.query.themeId) : "";
  const themeName = route.query.themeName ? String(route.query.themeName).toLowerCase() : "";
  const relatedThemes = Array.isArray(item.related_themes) ? item.related_themes : [];

  const idMatches = themeId && relatedThemes.some(theme => {
    const candidateIds = [
      theme.id,
      theme.theme_id,
      theme.theme?.id,
    ].filter(value => value !== undefined && value !== null).map(String);

    return candidateIds.includes(themeId);
  });

  if (idMatches) return true;
  if (!themeName) return false;

  return getTopicSearchText(item).includes(themeName);
}

// 1. 백엔드 전체 목록 원본 데이터 스캔 엔진 (API 명세 완전 방어)
const loadNews = async () => {
  const requestId = ++latestNewsRequestId;
  const stockId = route.query.stockId;
  const themeId = route.query.themeId;

  isNewsLoading.value = true;
  newsError.value = "";

  try {
    let response;
    let shouldClientFilterStock = false;
    let shouldClientFilterTheme = false;

    if (stockId) {
      response = await fetchNewsFeed();
      shouldClientFilterStock = true;
    } else if (themeId) {
      response = await fetchNewsByTheme(themeId);
      if (normalizeNewsResponse(response.data).length === 0) {
        response = await fetchNewsFeed();
        shouldClientFilterTheme = true;
      }
    } else {
      response = await fetchNewsFeed();
    }

    if (requestId !== latestNewsRequestId) return;

    newsList.value = normalizeNewsResponse(response.data);
    clientFilterMode.value = {
      stock: shouldClientFilterStock,
      theme: shouldClientFilterTheme,
    };
  } catch (error) {
    if (requestId !== latestNewsRequestId) return;

    console.error("API 요청 실패:", error);
    if (stockId || themeId) {
      try {
        const fallbackResponse = await fetchNewsFeed();
        if (requestId !== latestNewsRequestId) return;

        newsList.value = normalizeNewsResponse(fallbackResponse.data);
        clientFilterMode.value = {
          stock: Boolean(stockId),
          theme: Boolean(themeId),
        };
        return;
      } catch (fallbackError) {
        console.error("전체 뉴스 fallback 요청 실패:", fallbackError);
      }
    }

    newsList.value = [];
    clientFilterMode.value = { stock: false, theme: false };
    newsError.value = "뉴스를 불러오지 못했습니다.";
  } finally {
    if (requestId === latestNewsRequestId) {
      isNewsLoading.value = false;
    }
  }
};

function handleFilterClick(value) {
  activeFilter.value = value;

  if (value === "ALL" && (route.query.stockId || route.query.themeId || route.query.sector)) {
    router.push({ path: "/news", query: {} });
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

  // [필터 1] 등록한 관심 기업 클릭 필터링
  if (clientFilterMode.value.stock && (route.query.stockId || route.query.stockName)) {
    list = list.filter(matchesStockFilter);
  }

  // [필터 1-2] 추천 테마 클릭 필터링
  if (clientFilterMode.value.theme && (route.query.themeId || route.query.themeName)) {
    list = list.filter(matchesThemeFilter);
  }

  // [필터 1-3] 상단 관심 종목 검색바 필터링
  if (selectedStockFilter.value) {
    list = list.filter(n => {
      const matchImpact = getRelatedStocks(n).some(s => {
        const stockName = s.stock_name || s.stockName || s.name || s.stock?.stock_name || "";
        return stockName === selectedStockFilter.value;
      });
      const matchTitle = n.title?.includes(selectedStockFilter.value);
      return matchImpact || matchTitle;
    });
  }

  // [필터 2] 사이드바 인기 섹터/테마 필터링 (딕셔너리 연관어 매핑)
  if (route.query.sector) {
    const targetTheme = String(route.query.sector);
    const keywords = themeKeywords[targetTheme];

    if (keywords && keywords.length > 0) {
      list = list.filter(n => {
        const topicSearchText = getTopicSearchText(n);
        return keywords.some(keyword => {
          const kwLower = keyword.toLowerCase();
          return topicSearchText.includes(kwLower);
        });
      });
    } else {
      list = list.filter(n => {
        return getTopicSearchText(n).includes(targetTheme.toLowerCase());
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
.split-container { display: flex; width: 100%; height: 100%; background: var(--cream); overflow: hidden; }
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
  box-shadow: var(--panel-shadow);
}
.list-side.has-detail { flex: 0 0 auto; min-width: 240px; max-width: 760px; }
.split-resizer { position: relative; flex: 0 0 8px; margin-left: -4px; margin-right: -4px; z-index: 5; cursor: col-resize; touch-action: none; }
.split-resizer::before { content: ""; position: absolute; top: 0; bottom: 0; left: 3px; width: 2px; background: transparent; transition: background 0.15s ease; }
.split-resizer:hover::before, .resizing .split-resizer::before { background: var(--primary, #ff5a1f); }
.split-resizer span { position: absolute; top: 50%; left: 1px; width: 6px; height: 42px; transform: translateY(-50%); border-radius: 4px; background: #cbd5e1; opacity: 0; transition: opacity 0.15s ease, background 0.15s ease; }
.split-resizer:hover span, .resizing .split-resizer span { opacity: 1; background: var(--primary, #ff5a1f); }
.filter-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; padding: 18px; background: var(--cream); }
.selected-company-label {
  display: inline-flex;
  align-items: center;
  flex: 0 0 100%;
  gap: 8px;
  padding: 12px 14px;
  border: none;
  border-radius: var(--radius);
  background: var(--bg2);
  color: var(--text1);
  font-size: 15px;
}
.selected-company-label strong {
  color: var(--text1);
  font-size: 18px;
  font-weight: 800;
}
.selected-company-label span {
  color: var(--text3);
  font-size: 14px;
  font-weight: 600;
}
.selected-company-label.topic-search-label {
  background: var(--bg2);
  border: none;
}
.filter-chip { flex: 0 0 auto; min-width: 54px; padding: 8px 16px; border-radius: 999px; border: 1px solid var(--border); background: var(--cream); font-size: 12.5px; font-weight: 700; color: var(--text2); cursor: pointer; transition: all 0.18s ease; white-space: nowrap; }
.filter-chip:hover { border-color: var(--primary-border); color: var(--primary); }
.filter-chip.active { background: var(--primary); color: #ffffff; border-color: var(--primary); font-weight: 800; box-shadow: none; }
.list-scroll { flex: 1; overflow-y: auto; padding: 16px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-content: start; gap: 14px; background: var(--bg2); }
.list-scroll.detail-open { display: flex; flex-direction: column; gap: 12px; }
.list-scroll > .empty-state { grid-column: 1 / -1; }
.list-scroll::-webkit-scrollbar { width: 4px; }
.list-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
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
.detail-side { flex: 1.3; min-width: 0; height: 100%; background: var(--cream); display: flex; flex-direction: column; }
.mobile-list-back { display: none; }
.select-notice { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px; }
.select-notice h3 { font-size: 16px; font-weight: 700; color: var(--text1); margin-top: 16px; }
.select-notice p { color: var(--text3); font-size: 13px; line-height: 1.6; margin-top: 8px; }
.notice-icon { width: 40px; height: 40px; stroke: var(--text3); stroke-width: 1.5; fill: none; }
.empty-state { text-align: center; color: var(--text3); font-size: 13px; line-height: 1.6; }

@media (max-width: 1100px) {
  .list-side.has-detail { min-width: 240px; }
  .filter-bar { padding: 12px; gap: 6px; }
  .selected-company-label { padding: 10px 12px; font-size: 14px; }
  .selected-company-label strong { font-size: 16px; }
  .selected-company-label span { font-size: 13px; }
  .filter-chip { flex: 1 1 0; min-width: 44px; padding: 6px 8px; font-size: 11.5px; }
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
