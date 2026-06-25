<template>
  <aside
    class="sidebar"
    :class="{ collapsed: !isOpen }"
  >
    <router-link class="sidebar-logo" :to="isAuthenticated ? '/news' : '/'">
      <div class="logo-badge">
        <svg viewBox="0 0 16 16"><polyline points="1,12 5,7 9,10 15,3" /></svg>
      </div>
      <span v-if="isOpen">STOCKEASY</span>
    </router-link>

    <button class="toggle-btn" :title="isOpen ? '사이드바 닫기' : '사이드바 열기'" @click="isOpen = !isOpen">
      <svg viewBox="0 0 24 24" :style="{ transform: isOpen ? 'none' : 'rotate(180deg)' }">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="9" y1="4" x2="9" y2="20" />
        <polyline points="6,9 4,12 6,15" style="display:none" />
      </svg>
    </button>

    <nav class="section-nav">
      <button
        v-for="sec in sections"
        :key="sec.key"
        class="section-btn"
        :class="{ active: isSectionActive(sec.key) }"
        :title="sec.label"
        @click="selectSection(sec.key)"
      >
        <svg viewBox="0 0 24 24" v-html="sec.icon"></svg>
        <span v-if="isOpen" class="section-label">{{ sec.label }}</span>
      </button>
    </nav>

    <div
      v-if="isOpen"
      class="section-content"
      :class="{ 'watchlist-content': activeSection === 'watchlist' }"
    >
      
      <div v-if="activeSection === 'watchlist'" class="interest-panel">
        <div v-if="!currentUser" class="empty-state-box">
          <p>로그인 후 관심 기업을 등록할 수 있습니다.</p>
        </div>

        <template v-else>
          <section class="interest-group">
            <div class="interest-heading">
              <h3>등록한 관심 기업</h3>
            </div>

            <div v-if="isInterestsLoading" class="compact-state">
              관심 기업을 불러오는 중입니다...
            </div>

            <div v-else-if="interestsError" class="compact-state error-state-box">
              {{ interestsError }}
            </div>

            <div v-else-if="interestStocks.length === 0" class="compact-state">
              아직 등록한 관심 기업이 없습니다.
            </div>

            <div v-else class="sector-grid-layout">
              <div
                v-for="interest in interestStocks"
                :key="interest.id"
                class="interest-sector-row"
                :class="{
                  active:
                    String(route.query.stockId) === String(interest.stock.id)
                }"
              >
                <button
                  type="button"
                  class="luxury-sector-chip interest-sector-chip"
                  @click="selectInterestStock(interest)"
                >
                  <strong>{{ interest.stock.stock_name }}</strong>
                  <small>{{ interest.stock.stock_code }}</small>
                </button>

                <button
                  type="button"
                  class="heart-btn active"
                  :disabled="deletingInterestId === interest.id"
                  :title="`${interest.stock.stock_name} 관심 기업 삭제`"
                  @click="removeInterestStock(interest)"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          <section class="interest-group company-search-group">
            <div class="interest-heading">
              <h3>기업 찾기</h3>
            </div>

            <div class="company-search-box">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                v-model.trim="stockSearch"
                type="search"
                placeholder="기업명 또는 종목코드 검색"
                aria-label="기업 검색"
              />
            </div>

            <p v-if="mutationError" class="mutation-error">{{ mutationError }}</p>

            <div v-if="isStocksLoading" class="compact-state">
              기업 목록을 불러오는 중입니다...
            </div>

            <div v-else-if="stocksError" class="compact-state error-state-box">
              {{ stocksError }}
            </div>

            <div v-else-if="displayStocks.length === 0" class="compact-state">
              검색 결과가 없습니다.
            </div>

            <div v-else class="company-search-results">
              <div v-for="stock in displayStocks" :key="stock.id" class="company-list-card">
                <div class="company-card-info">
                  <strong>{{ stock.stock_name }}</strong>
                  <small>{{ stock.stock_code }}</small>
                </div>

                <button
                  v-if="isRegisteredStock(stock.id)"
                  type="button"
                  class="heart-btn active"
                  disabled
                  :title="`${stock.stock_name} 등록됨`"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <button
                  v-else
                  type="button"
                  class="heart-btn"
                  :disabled="addingStockId === stock.id"
                  :title="`${stock.stock_name} 관심 기업 등록`"
                  @click="addInterestStock(stock)"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        </template>
      </div>

      <div v-else-if="activeSection === 'recommended'">
        <div v-if="!currentUser" class="empty-state-box">
          <p>관심 기업을 등록하면 맞춤 테마를 추천받을 수 있습니다.</p>
        </div>

        <div v-else-if="isRecommendedThemesLoading" class="compact-state">
          추천 테마를 불러오는 중입니다...
        </div>

        <div v-else-if="recommendedThemesError" class="compact-state error-state-box">
          {{ recommendedThemesError }}
        </div>

        <div v-else-if="recommendedThemes.length === 0" class="compact-state">
          관심 기업을 등록하면 맞춤 테마를 추천받을 수 있습니다.
        </div>

        <div v-else class="sector-grid-layout">
          <button
            v-for="theme in recommendedThemes"
            :key="theme.id || theme.name"
            type="button"
            class="luxury-sector-chip"
            :class="{
              active: isRecommendedThemeActive(theme)
            }"
            @click="selectRecommendedTheme(theme)"
          >
            {{ theme.name }}
          </button>
        </div>
      </div>

      <div v-else-if="activeSection === 'sector'">
        <div class="search-input-container">
          <svg viewBox="0 0 24 24" class="search-lens"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input v-model="themeSearch" type="text" placeholder="테마 검색..." class="premium-sector-input" />
        </div>

        <div class="sector-grid-layout">
          <div
            v-for="theme in filteredThemes"
            :key="theme"
            class="luxury-sector-chip"
            :class="{ active: theme === activeTheme }"
            @click="handleThemeClick(theme)"
          >
            {{ theme }}
          </div>
        </div>
      </div>

    </div>

    <div class="sidebar-footer">
      <div class="user-row-card">
        <button
          type="button"
          class="user-avatar-circle"
          title="마이페이지"
          @click="goToMyPage('favorites')"
        >
          {{ userInitial }}
        </button>
        <button
          v-if="isOpen"
          type="button"
          class="user-profile-meta"
          title="마이페이지"
          @click="goToMyPage('favorites')"
        >
          <div class="user-display-name">{{ userDisplayName }}</div>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "../../services/auth";
import {
  createInterestStock,
  deleteInterestStock,
  fetchInterestStocks,
  fetchRecommendedThemes,
  fetchStocks,
} from "../../services/api";

const route = useRoute();
const router = useRouter();
const isOpen = ref(true);
const activeSection = ref("watchlist");
const themeSearch = ref("");
const { currentUser, isAuthenticated } = useAuth();
const interestStocks = ref([]);
const stocks = ref([]);
const stockSearch = ref("");
const isInterestsLoading = ref(false);
const isStocksLoading = ref(false);
const interestsError = ref("");
const stocksError = ref("");
const mutationError = ref("");
const addingStockId = ref(null);
const deletingInterestId = ref(null);
const recommendedThemes = ref([]);
const isRecommendedThemesLoading = ref(false);
const recommendedThemesError = ref("");
let searchTimer = null;

const displayStocks = computed(() => stocks.value);
const registeredStockIds = computed(
  () => new Set(interestStocks.value.map((interest) => interest.stock.id))
);

const userDisplayName = computed(() => {
  if (!isAuthenticated.value) return "로그인이 필요합니다";
  return currentUser.value?.nickname || currentUser.value?.email || "사용자";
});

const userInitial = computed(() => {
  if (!isAuthenticated.value) return "?";
  return userDisplayName.value.slice(0, 2);
});

const sections = [
  { key: "watchlist", label: "내 관심 기업", icon: '<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />' },
  { key: "recommended", label: "추천 테마", icon: '<path d="M12 3l1.8 4.4L18 9.2l-4.2 1.8L12 15.5 10.2 11 6 9.2l4.2-1.8L12 3z" /><path d="M18.5 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z" />' },
  { key: "sector", label: "인기 테마", icon: '<rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />' },
];

function selectSection(key) {
  const isSameSection = activeSection.value === key;

  if (
    isSameSection &&
    (route.path !== "/news" || route.params.id || Object.keys(route.query).length > 0)
  ) {
    router.push("/news");
    return;
  }

  activeSection.value = key;
  if (!isOpen.value) isOpen.value = true;
  if (key === "watchlist" && currentUser.value) {
    loadInterestStocks();
    loadStocks();
  }
  if (key === "recommended" && currentUser.value) {
    loadRecommendedThemes();
  }
}

function isSectionActive(key) {
  return activeSection.value === key && route.path !== "/mypage";
}

function goToMyPage() {
  router.push({ path: "/mypage" });
}

async function loadInterestStocks() {
  if (!currentUser.value) {
    interestStocks.value = [];
    interestsError.value = "";
    return;
  }

  isInterestsLoading.value = true;
  interestsError.value = "";

  try {
    const { data } = await fetchInterestStocks();
    interestStocks.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("관심 기업 조회 실패", error);
    interestStocks.value = [];
    interestsError.value = "관심 기업을 불러오지 못했습니다.";
  } finally {
    isInterestsLoading.value = false;
  }
}

async function loadRecommendedThemes() {
  if (!currentUser.value) {
    recommendedThemes.value = [];
    recommendedThemesError.value = "";
    return;
  }

  isRecommendedThemesLoading.value = true;
  recommendedThemesError.value = "";

  try {
    const { data } = await fetchRecommendedThemes();
    const apiThemes = normalizeList(data).map(normalizeTheme).filter(theme => theme.name);
    recommendedThemes.value = apiThemes.length > 0
      ? apiThemes
      : buildRecommendedThemesFromInterests();
  } catch (error) {
    console.error("추천 테마 조회 실패", error);
    recommendedThemes.value = buildRecommendedThemesFromInterests();
    recommendedThemesError.value = recommendedThemes.value.length > 0
      ? ""
      : "추천 테마를 불러오지 못했습니다.";
  } finally {
    isRecommendedThemesLoading.value = false;
  }
}

function selectInterestStock(interest) {
  router.push({
    path: "/news",
    query: {
      stockId: interest.stock.id,
      stockName: interest.stock.stock_name,
    },
  });
}

async function selectRecommendedTheme(theme) {
  const themeQuery = theme.id
    ? { themeId: String(theme.id), themeName: theme.name }
    : { sector: theme.name };

  await router.push({
    path: "/news",
    query: themeQuery,
  });
}

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.themes)) return data.themes;
  if (Array.isArray(data?.recommended_themes)) return data.recommended_themes;
  if (Array.isArray(data?.recommendedThemes)) return data.recommendedThemes;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function normalizeTheme(theme) {
  if (typeof theme === "string") {
    return { id: null, name: theme };
  }

  if (!theme || typeof theme !== "object") {
    return { id: null, name: "" };
  }

  return {
    ...theme,
    id: theme.id ?? theme.theme_id ?? theme.theme?.id ?? null,
    name: theme.name || theme.theme_name || theme.title || theme.theme?.name || theme.theme?.theme_name || "",
  };
}

function uniqueThemes(themes) {
  const seen = new Set();

  return themes.filter(theme => {
    if (!theme.name || seen.has(theme.name)) return false;
    seen.add(theme.name);
    return true;
  });
}

function buildRecommendedThemesFromInterests() {
  const themes = [];

  interestStocks.value.forEach((interest) => {
    const stock = interest.stock || {};
    const rawThemes = [
      ...(Array.isArray(stock.themes) ? stock.themes : []),
      ...(Array.isArray(stock.related_themes) ? stock.related_themes : []),
      ...(Array.isArray(stock.sectors) ? stock.sectors : []),
      stock.theme,
      stock.theme_name,
      stock.sector,
      stock.industry,
    ].filter(Boolean);

    rawThemes.forEach(theme => {
      themes.push(normalizeTheme(theme));
    });

    inferThemesFromStock(stock).forEach(themeName => {
      themes.push({ id: null, name: themeName });
    });
  });

  return uniqueThemes(themes).slice(0, 8);
}

function inferThemesFromStock(stock) {
  const text = [
    stock.stock_name,
    stock.name,
    stock.stock_code,
  ].filter(Boolean).join(" ");

  const hints = [
    { theme: "반도체", keywords: ["삼성전자", "SK하이닉스", "하이닉스", "DB하이텍", "한미반도체"] },
    { theme: "IT · 플랫폼", keywords: ["네이버", "NAVER", "카카오", "KAKAO"] },
    { theme: "자동차", keywords: ["현대차", "현대자동차", "기아", "현대모비스"] },
    { theme: "바이오", keywords: ["셀트리온", "삼성바이오", "유한양행", "한미약품"] },
    { theme: "금융", keywords: ["KB", "신한", "우리금융", "하나금융", "은행", "증권"] },
    { theme: "에너지", keywords: ["SK이노베이션", "S-Oil", "한국전력", "한화솔루션"] },
    { theme: "2차전지", keywords: ["LG에너지솔루션", "삼성SDI", "에코프로", "포스코퓨처"] },
    { theme: "엔터테인먼트", keywords: ["하이브", "JYP", "SM", "와이지", "YG"] },
    { theme: "우주항공", keywords: ["한화에어로", "KAI", "한국항공우주"] },
    { theme: "인공지능(AI)", keywords: ["로보", "AI", "인공지능"] },
  ];

  return hints
    .filter(({ keywords }) => keywords.some(keyword => text.includes(keyword)))
    .map(({ theme }) => theme);
}

function isRecommendedThemeActive(theme) {
  if (theme.id) {
    return String(route.query.themeId) === String(theme.id);
  }

  return route.query.sector === theme.name;
}

async function loadStocks() {
  if (!currentUser.value) {
    stocks.value = [];
    stocksError.value = "";
    return;
  }

  isStocksLoading.value = true;
  stocksError.value = "";

  try {
    const params = stockSearch.value
      ? { search: stockSearch.value }
      : {};
    const { data } = await fetchStocks(params);
    stocks.value = normalizeList(data);
  } catch (error) {
    console.error("기업 목록 조회 실패", error);
    stocks.value = [];
    stocksError.value = "기업 목록을 불러오지 못했습니다.";
  } finally {
    isStocksLoading.value = false;
  }
}

function isRegisteredStock(stockId) {
  return registeredStockIds.value.has(stockId);
}

async function addInterestStock(stock) {
  if (
    !currentUser.value ||
    addingStockId.value !== null ||
    isRegisteredStock(stock.id)
  ) {
    return;
  }

  addingStockId.value = stock.id;
  mutationError.value = "";

  try {
    await createInterestStock(stock.id);
    await Promise.all([loadInterestStocks(), loadRecommendedThemes()]);
  } catch (error) {
    console.error("관심 기업 등록 실패", error);
    mutationError.value =
      error.response?.data?.detail ||
      error.response?.data?.stock_id?.[0] ||
      "관심 기업을 등록하지 못했습니다.";
  } finally {
    addingStockId.value = null;
  }
}

async function removeInterestStock(interest) {
  if (deletingInterestId.value !== null) return;
  if (!window.confirm(`${interest.stock.stock_name}을(를) 관심 기업에서 삭제하시겠습니까?`)) return;

  deletingInterestId.value = interest.id;
  mutationError.value = "";

  try {
    await deleteInterestStock(interest.id);
    if (String(route.query.stockId) === String(interest.stock.id)) {
      await router.push("/news");
    }
    await Promise.all([loadInterestStocks(), loadRecommendedThemes()]);
  } catch (error) {
    console.error("관심 기업 삭제 실패", error);
    mutationError.value =
      error.response?.data?.detail ||
      "관심 기업을 삭제하지 못했습니다.";
  } finally {
    deletingInterestId.value = null;
  }
}

// 💡 10대 인기 테마 하드코딩 리스트 구성 완료
const popularThemes = [
  
  "반도체", 
  "IT · 플랫폼", 
  "자동차", 
  "바이오", 
  "금융", 
  "에너지", 
  "2차전지", 
  "엔터테인먼트",
  "우주항공",
  "인공지능(AI)"
];

const activeTheme = ref("전체");

const filteredThemes = computed(() => {
  if (!themeSearch.value) return popularThemes;
  return popularThemes.filter(t => t.toLowerCase().includes(themeSearch.value.toLowerCase()) || t === "전체");
});

function handleThemeClick(theme) {
  activeTheme.value = theme;
  // 주소창에 ?sector=테마명 파라미터를 넘겨주어 NewsFeedView와 동기화
  router.push({
    path: "/news",
    query: theme === "전체" ? {} : { sector: theme },
  });
}

onMounted(() => {
  if (currentUser.value) {
    loadInterestStocks();
    loadStocks();
    loadRecommendedThemes();
  }
});

watch(currentUser, (user) => {
  stockSearch.value = "";
  mutationError.value = "";

  if (user) {
    loadInterestStocks();
    loadStocks();
    loadRecommendedThemes();
  } else {
    interestStocks.value = [];
    stocks.value = [];
    recommendedThemes.value = [];
  }
});

watch(stockSearch, () => {
  if (!currentUser.value) return;
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(loadStocks, 300);
});

watch(
  () => route.query.sector,
  (sector) => {
    activeTheme.value = typeof sector === "string" ? sector : "전체";
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  window.clearTimeout(searchTimer);
});
</script>

<style scoped>
.sidebar { width: 270px; flex-shrink: 0; border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 12px 0 0; transition: width 0.25s ease; background: var(--cream); overflow: visible; position: relative; }
.sidebar.collapsed { width: 68px; }
.sidebar-logo { min-height: 44px; display: flex; align-items: center; gap: 9px; margin: 0 12px 8px; padding: 6px 8px; color: var(--text1); font-size: 17px; font-weight: 850; letter-spacing: 0; overflow: hidden; }
.sidebar.collapsed .sidebar-logo { justify-content: center; padding: 6px 0; }
.logo-badge { width: 32px; height: 32px; border-radius: 9px; background: var(--primary); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 22px rgba(255, 106, 0, 0.32); flex-shrink: 0; }
.logo-badge svg { width: 14px; height: 14px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; }
.toggle-btn { width: 34px; height: 34px; margin: 0 0 12px 16px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: var(--text2); transition: all 0.2s ease; }
.toggle-btn:hover { background: var(--bg2); color: var(--text1); }
.toggle-btn svg { width: 18px; height: 18px; stroke: currentColor; stroke-width: 1.8; fill: none; transition: transform 0.25s ease; }
.section-nav { display: flex; flex-direction: column; gap: 4px; padding: 0 12px; }
.section-btn { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border: none; background: transparent; border-radius: var(--radius); cursor: pointer; color: var(--text2); font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; transition: all 0.2s ease; }
.section-btn:hover { background: var(--bg2); color: var(--text1); }
.section-btn.active { background: linear-gradient(90deg, rgba(255,106,0,.12), rgba(255,106,0,.03)); color: var(--primary); font-weight: 750; box-shadow: inset 3px 0 0 var(--primary); }
.sidebar.collapsed .section-btn.active { background: transparent; color: var(--text2); box-shadow: none; font-weight: inherit; }
.sidebar.collapsed .section-btn.active:hover { background: var(--bg2); color: var(--text1); }
.section-btn svg { width: 18px; height: 18px; stroke: currentColor; stroke-width: 1.8; fill: none; flex-shrink: 0; }
.section-label { overflow: hidden; text-overflow: ellipsis; }
.section-content { flex: 1; overflow-y: auto; padding: 16px 16px 0; margin-top: 4px; border-top: 1px solid var(--border); display: flex; flex-direction: column; }
.section-content.watchlist-content { overflow: hidden; padding-bottom: 0; }
.section-content::-webkit-scrollbar { width: 4px; }
.section-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.filter-notice-bar { display: flex; justify-content: space-between; align-items: center; background: var(--primary-bg); color: var(--primary); border: 1px solid var(--primary-border); font-size: 13px; padding: 9px 12px; border-radius: 6px; margin-bottom: 12px; font-weight: 650; }
.clear-filter-btn { border: none; background: transparent; color: var(--primary); cursor: pointer; font-size: 13px; }
.empty-state-box { padding: 24px 0; text-align: center; color: var(--text3); font-size: 13px; line-height: 1.55; }
.empty-icon { width: 22px; height: 24px; stroke: var(--text3); stroke-width: 1.5; fill: none; margin-bottom: 6px; }
.interest-panel { height: 100%; min-height: 0; display: flex; flex-direction: column; }
.interest-group { flex-shrink: 0; margin-bottom: 20px; }
.interest-group + .interest-group { padding-top: 16px; border-top: 1px solid var(--border); }
.interest-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.interest-heading h3 { color: var(--text1); font-size: 14px; font-weight: 750; }
.compact-state { padding: 16px 10px; border-radius: var(--radius); background: var(--bg2); color: var(--text3); font-size: 12.5px; line-height: 1.55; text-align: center; }
.stock-list-wrapper { display: flex; flex-direction: column; gap: 6px; }

.stock-item-card { display: flex; align-items: center; gap: 12px; padding: 11px; border-radius: 10px; border: 1px solid var(--border); cursor: pointer; position: relative; transition: all 0.2s ease; background: var(--cream); }
.stock-item-card:hover { background: var(--bg2); border-color: #c7d1da; transform: translateX(2px); }
.stock-item-card.filter-active { background: var(--primary-bg); border-color: var(--primary-border); }
.stock-avatar-badge { width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0; background: #fff4ea; border: 1px solid #ffd0a7; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: var(--primary); }
.stock-meta-info { flex: 1; min-width: 0; text-align: left; }
.stock-title-name { font-size: 13px; font-weight: 700; color: var(--text1); }
.stock-price-tag { font-size: 11px; color: var(--text3); margin-top: 2px; }
.active-indicator-dot { width: 6px; height: 6px; background: var(--primary); border-radius: 50%; position: absolute; right: 12px; top: calc(50% - 3px); }

.company-list-card { min-height: 60px; display: flex; align-items: center; gap: 8px; padding: 10px 7px 10px 12px; border: 1px solid transparent; border-radius: var(--radius); background: transparent; transition: all 0.15s ease; }
.company-list-card:hover { background: var(--bg2); border-color: var(--border); }
.company-list-card.filter-active { border-color: var(--primary); background: var(--primary-bg); }
.company-card-main { flex: 1; min-width: 0; align-self: stretch; display: flex; align-items: center; padding: 0; border: none; background: transparent; cursor: pointer; font: inherit; }
.company-card-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; text-align: left; }
.company-card-info strong { overflow: hidden; color: var(--text1); font-size: 14px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.company-card-info small { color: var(--text3); font-size: 12px; line-height: 1.1; }
.interest-sector-row { display: flex; align-items: center; gap: 6px; border: 1px solid transparent; border-radius: var(--radius); padding: 2px 5px 2px 0; transition: background 0.15s ease, border-color 0.15s ease; }
.interest-sector-row:hover { background: var(--bg2); border-color: var(--border); }
.interest-sector-row.active { background: var(--primary-bg); border-color: var(--primary-border); }
.interest-sector-row.active .luxury-sector-chip { color: var(--primary); font-weight: 600; }
.interest-sector-chip { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; border-color: transparent !important; background: transparent !important; }
.interest-sector-chip strong { max-width: 100%; overflow: hidden; color: var(--text1); font-size: 14px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.interest-sector-chip small { color: var(--text3); font-size: 12px; line-height: 1.25; }
.interest-sector-row.active .interest-sector-chip strong { color: var(--primary); }
.interest-sector-row.active .interest-sector-chip small { color: var(--primary); opacity: 0.74; }
.heart-btn { width: 30px; height: 30px; flex-shrink: 0; display: grid; place-items: center; padding: 0; border: none; border-radius: 50%; background: transparent; color: #cbd5e1; cursor: pointer; transition: all 0.15s ease; }
.heart-btn:hover { background: #fff1f2; color: #fb7185; }
.heart-btn svg { width: 17px; height: 17px; fill: transparent; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.heart-btn.active { color: var(--primary); }
.heart-btn.active svg { fill: currentColor; stroke: currentColor; }
.heart-btn.active:hover { background: var(--primary-bg); color: var(--primary-hover); }
.heart-btn:disabled { opacity: 0.65; cursor: not-allowed; }
.error-state-box { color: #dc2626; background: #fff1f2; border-radius: var(--radius); }
.company-search-box { position: relative; display: flex; align-items: center; margin-bottom: 10px; }
.company-search-box svg { position: absolute; left: 10px; width: 14px; height: 14px; stroke: var(--text3); stroke-width: 2; fill: none; pointer-events: none; }
.company-search-box input { width: 100%; padding: 9px 10px 9px 31px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg2); outline: none; font-size: 13px; }
.company-search-box input:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(255, 90, 31, 0.08); }
.company-search-results { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 6px; overflow-y: auto; padding-right: 2px; }
.mutation-error { margin: 0 0 9px; padding: 8px 9px; border-radius: 6px; background: #fff1f2; color: #dc2626; font-size: 12px; line-height: 1.45; }
.company-search-group { flex: 1; min-height: 0; margin-bottom: 0; display: flex; flex-direction: column; }
.company-search-results::-webkit-scrollbar { width: 4px; }
.company-search-results::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.add-btn { display: flex; align-items: center; gap: 6px; padding: 10px; font-size: 12.5px; color: var(--text3); border: 1px dashed var(--border); border-radius: var(--radius); margin-top: 12px; cursor: pointer; justify-content: center; transition: all 0.15s ease; background: #fff; }

.add-btn:hover { border-color: var(--primary-border); color: var(--primary); background: var(--primary-bg); }
.search-input-container { position: relative; margin-bottom: 14px; display: flex; align-items: center; }
.search-lens { position: absolute; left: 10px; width: 14px; height: 14px; stroke: var(--text3); stroke-width: 2; fill: none; }
.premium-sector-input { width: 100%; padding: 10px 12px 10px 32px; border-radius: 9px; border: 1px solid var(--border); font-size: 13.5px; background: var(--cream); color: var(--text1); transition: all 0.2s ease; }
.premium-sector-input:focus { outline: none; border-color: var(--primary); background: var(--cream); box-shadow: 0 0 0 3px rgba(255, 90, 31, 0.08); }
.sector-grid-layout { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.luxury-sector-chip { width: 100%; padding: 11px 12px; border-radius: var(--radius); border: 1px solid transparent; background: transparent; color: var(--text1); cursor: pointer; font: inherit; font-size: 14px; font-weight: 650; line-height: 1.35; text-align: left; transition: all 0.15s ease; }
.luxury-sector-chip:hover { background: var(--bg2); color: var(--text1); }
.luxury-sector-chip.active { background: var(--primary-bg); color: var(--primary); border-color: var(--primary-border); font-weight: 600; }
.sidebar-footer { border-top: 1px solid var(--border); padding: 14px 12px; margin-top: auto; }
.user-row-card { display: flex; align-items: center; gap: 10px; }
.user-avatar-circle { width: 36px; height: 36px; border: none; border-radius: 50%; flex-shrink: 0; background: var(--primary); color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(255, 90, 31, 0.2); cursor: pointer; }
.user-avatar-circle:hover { background: var(--primary-hover); }
.user-profile-meta { flex: 1; min-width: 0; text-align: left; border: none; background: transparent; padding: 0; cursor: pointer; }
.user-display-name { font-size: 14px; font-weight: 750; color: var(--primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.icon-btn-sm { width: 28px; height: 28px; flex-shrink: 0; border: none; background: transparent; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text3); }
.icon-btn-sm:hover { background: var(--bg2); color: var(--text1); }
.icon-btn-sm svg { width: 16px; height: 16px; stroke: currentColor; stroke-width: 1.7; fill: none; }

@media (max-width: 1180px) {
  .sidebar { width: 68px !important; }
  .sidebar .section-label,
  .sidebar .section-content,
  .sidebar .user-profile-meta,
  .sidebar .sidebar-footer .icon-btn-sm { display: none; }
  .sidebar .toggle-btn { margin-left: 16px; }
  .sidebar .section-btn { justify-content: center; padding: 10px; }
  .sidebar .sidebar-footer { padding: 14px 17px; }
}

@media (max-width: 760px) {
  .sidebar { display: none; }
}
</style>
