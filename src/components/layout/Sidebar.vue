<template>
  <aside class="sidebar" :class="{ collapsed: !isOpen }">
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
        :class="{ active: activeSection === sec.key }"
        :title="sec.label"
        @click="selectSection(sec.key)"
      >
        <svg viewBox="0 0 24 24" v-html="sec.icon"></svg>
        <span v-if="isOpen" class="section-label">{{ sec.label }}</span>
      </button>
    </nav>

    <div v-if="isOpen" class="section-content">
      
      <div v-if="activeSection === 'watchlist'">
        <div v-if="!currentUser" class="empty-state-box">
          <p>로그인 후 관심 기업을 등록할 수 있습니다.</p>
        </div>

        <div v-else-if="isInterestsLoading" class="empty-state-box">
          <p>관심 기업을 불러오는 중입니다...</p>
        </div>

        <div v-else-if="interestsError" class="empty-state-box error-state-box">
          <p>{{ interestsError }}</p>
        </div>

        <div v-else-if="interestStocks.length === 0" class="empty-state-box">
          <svg viewBox="0 0 24 24" class="empty-icon"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
          <p>아직 등록한 관심 기업이 없습니다.</p>
        </div>

        <div v-else class="stock-list-wrapper">
          <button
            v-for="interest in interestStocks"
            :key="interest.id"
            type="button"
            class="stock-item-card"
            :class="{
              'filter-active':
                String(route.query.stockId) === String(interest.stock.id)
            }"
            @click="selectInterestStock(interest)"
          >
            <div class="stock-avatar-badge">
              {{ interest.stock.stock_name.slice(0, 2) }}
            </div>
            <div class="stock-meta-info">
              <div class="stock-title-name">{{ interest.stock.stock_name }}</div>
              <div class="stock-price-tag">{{ interest.stock.stock_code }}</div>
            </div>
            <div
              v-if="String(route.query.stockId) === String(interest.stock.id)"
              class="active-indicator-dot"
            ></div>
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

      <div v-else-if="activeSection === 'terms'">
        <div v-if="savedTerms.length === 0" class="empty-state-box">
          <p>저장한 용어가 없어요</p>
        </div>
        <div class="word-pills">
          <span v-for="term in savedTerms" :key="term.id" class="word-pill">{{ term.name }}</span>
        </div>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="user-row-card">
        <div class="user-avatar-circle">{{ userInitial }}</div>
        <div v-if="isOpen" class="user-profile-meta">
          <div class="user-display-name">{{ userDisplayName }}</div>
        </div>
        <button v-if="isOpen" class="icon-btn-sm" title="설정">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "../../services/auth";
import { fetchInterestStocks } from "../../services/api";

const route = useRoute();
const router = useRouter();
const isOpen = ref(true);
const activeSection = ref("watchlist");
const themeSearch = ref("");
const { currentUser, isAuthenticated } = useAuth();
const interestStocks = ref([]);
const isInterestsLoading = ref(false);
const interestsError = ref("");

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
  { key: "sector", label: "인기 테마", icon: '<rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />' },
  { key: "terms", label: "저장된 용어", icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />' }
];

function selectSection(key) {
  activeSection.value = key;
  if (!isOpen.value) isOpen.value = true;
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

function selectInterestStock(interest) {
  router.push({
    path: "/",
    query: {
      stockId: interest.stock.id,
      stockName: interest.stock.stock_name,
    },
  });
}

// 💡 10대 인기 테마 하드코딩 리스트 구성 완료
const popularThemes = [
  "전체", 
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
  router.push({ path: '/', query: { ...route.query, sector: theme === '전체' ? undefined : theme } });
}

const savedTerms = ref([]);

onMounted(loadInterestStocks);
watch(currentUser, loadInterestStocks);
</script>

<style scoped>
.sidebar { width: 250px; flex-shrink: 0; border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 12px 0 0; transition: width 0.25s ease; background: var(--bg); overflow: hidden; }
.sidebar.collapsed { width: 68px; }
.toggle-btn { width: 34px; height: 34px; margin: 0 0 14px 16px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: var(--text3); transition: all 0.2s ease; }
.toggle-btn:hover { background: var(--bg2); color: var(--text1); }
.toggle-btn svg { width: 18px; height: 18px; stroke: currentColor; stroke-width: 1.8; fill: none; transition: transform 0.25s ease; }
.section-nav { display: flex; flex-direction: column; gap: 4px; padding: 0 12px; }
.section-btn { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border: none; background: transparent; border-radius: var(--radius); cursor: pointer; color: var(--text2); font-size: 13.5px; white-space: nowrap; overflow: hidden; transition: all 0.2s ease; }
.section-btn:hover { background: var(--bg2); color: var(--text1); }
.section-btn.active { background: var(--primary-bg, #fff5f1); color: var(--primary, #ff5a1f); font-weight: 600; }
.section-btn svg { width: 18px; height: 18px; stroke: currentColor; stroke-width: 1.8; fill: none; flex-shrink: 0; }
.section-label { overflow: hidden; text-overflow: ellipsis; }
.section-content { flex: 1; overflow-y: auto; padding: 16px 16px 0; margin-top: 4px; border-top: 1px solid var(--border); display: flex; flex-direction: column; }
.section-content::-webkit-scrollbar { width: 4px; }
.section-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.filter-notice-bar { display: flex; justify-content: space-between; align-items: center; background: var(--primary-bg); color: var(--primary); border: 1px solid var(--primary-border); font-size: 11.5px; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; font-weight: 600; }
.clear-filter-btn { border: none; background: transparent; color: var(--primary); cursor: pointer; font-size: 12px; }
.empty-state-box { padding: 24px 0; text-align: center; color: var(--text3); }
.empty-icon { width: 22px; height: 24px; stroke: var(--text3); stroke-width: 1.5; fill: none; margin-bottom: 6px; }
.stock-list-wrapper { display: flex; flex-direction: column; gap: 6px; }
.stock-item-card { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: var(--radius); border: 1px solid transparent; cursor: pointer; position: relative; transition: all 0.2s ease; background: var(--bg2); font: inherit; }
.stock-item-card:hover { background: #ffffff; border-color: var(--border); transform: translateX(2px); }
.stock-item-card.filter-active { background: var(--primary-bg); border-color: var(--primary-border); }
.stock-avatar-badge { width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0; background: #ffffff; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--text2); }
.stock-meta-info { flex: 1; min-width: 0; text-align: left; }
.stock-title-name { font-size: 13px; font-weight: 600; color: var(--text1); }
.stock-price-tag { font-size: 11px; color: var(--text3); margin-top: 2px; }
.active-indicator-dot { width: 6px; height: 6px; background: var(--primary); border-radius: 50%; position: absolute; right: 12px; top: calc(50% - 3px); }
.error-state-box { color: #dc2626; background: #fff1f2; border-radius: var(--radius); }
.add-btn { display: flex; align-items: center; gap: 6px; padding: 10px; font-size: 12.5px; color: var(--text3); border: 1px dashed var(--border); border-radius: var(--radius); margin-top: 12px; cursor: pointer; justify-content: center; transition: all 0.15s ease; background: #fff; }
.add-btn:hover { border-color: var(--primary-border); color: var(--primary); background: var(--primary-bg); }
.word-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.word-pill { padding: 5px 10px; border-radius: 20px; background: var(--primary-bg); border: 1px solid var(--primary-border); font-size: 11px; color: var(--primary); font-weight: 600; }
.search-input-container { position: relative; margin-bottom: 14px; display: flex; align-items: center; }
.search-lens { position: absolute; left: 10px; width: 14px; height: 14px; stroke: var(--text3); stroke-width: 2; fill: none; }
.premium-sector-input { width: 100%; padding: 8px 12px 8px 32px; border-radius: var(--radius); border: 1px solid var(--border); font-size: 12.5px; background: var(--bg2); transition: all 0.2s ease; }
.premium-sector-input:focus { outline: none; border-color: var(--primary); background: #ffffff; box-shadow: 0 0 0 3px rgba(255, 90, 31, 0.08); }
.sector-grid-layout { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.luxury-sector-chip { padding: 9px 12px; border-radius: var(--radius); font-size: 12.5px; border: 1px solid transparent; color: var(--text2); cursor: pointer; transition: all 0.15s ease; }
.luxury-sector-chip:hover { background: var(--bg2); color: var(--text1); }
.luxury-sector-chip.active { background: var(--primary); color: #ffffff; font-weight: 600; }
.sidebar-footer { border-top: 1px solid var(--border); padding: 14px 12px; margin-top: auto; }
.user-row-card { display: flex; align-items: center; gap: 10px; }
.user-avatar-circle { width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; background: var(--primary); color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(255, 90, 31, 0.2); }
.user-profile-meta { flex: 1; min-width: 0; text-align: left; }
.user-display-name { font-size: 13px; font-weight: 600; color: var(--text1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.icon-btn-sm { width: 28px; height: 28px; flex-shrink: 0; border: none; background: transparent; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text3); }
.icon-btn-sm:hover { background: var(--bg2); color: var(--text1); }
.icon-btn-sm svg { width: 16px; height: 16px; stroke: currentColor; stroke-width: 1.7; fill: none; }
</style>
