<template>
  <aside
    class="sidebar"
    :class="{ collapsed: !isOpen, resizing: isResizing }"
    :style="isOpen ? { width: `${sidebarWidth}px` } : undefined"
  >
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
        <div v-if="selectedStockFilter" class="filter-notice-bar">
          <span class="notice-txt">🎯 '{{ selectedStockFilter }}' 필터 중</span>
          <button class="clear-filter-btn" @click="selectedStockFilter = null">✕</button>
        </div>

        <div v-if="watchlistItems.length === 0" class="empty-state-box">
          <svg viewBox="0 0 24 24" class="empty-icon"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
          <p>아직 등록한 관심 종목이 없어요</p>
        </div>

        <div class="stock-list-wrapper">
          <div 
            v-for="stock in watchlistItems" 
            :key="stock.id" 
            class="stock-item-card"
            :class="{ 'filter-active': selectedStockFilter === stock.name }"
            @click="toggleStockFilter(stock.name)"
          >
            <div class="stock-avatar-badge">{{ stock.shortName }}</div>
            <div class="stock-meta-info">
              <div class="stock-title-name">{{ stock.name }}</div>
              <div class="stock-price-tag">{{ stock.price }}</div>
            </div>
            <div class="active-indicator-dot" v-if="selectedStockFilter === stock.name"></div>
          </div>
        </div>

        <div class="add-btn">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          종목 추가
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

    <div
      v-if="isOpen"
      class="sidebar-resizer"
      role="separator"
      aria-label="사이드바 너비 조절"
      aria-orientation="vertical"
      @pointerdown="startResize"
    >
      <span></span>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, inject, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "../../services/auth";

const route = useRoute();
const router = useRouter();
const isOpen = ref(true);
const sidebarWidth = ref(250);
const isResizing = ref(false);
const activeSection = ref("watchlist");
const themeSearch = ref("");
const { currentUser, isAuthenticated } = useAuth();

const userDisplayName = computed(() => {
  if (!isAuthenticated.value) return "로그인이 필요합니다";
  return currentUser.value?.nickname || currentUser.value?.email || "사용자";
});

const userInitial = computed(() => {
  if (!isAuthenticated.value) return "?";
  return userDisplayName.value.slice(0, 2);
});

// 부모(App.vue) 전역 Provide 데이터 인젝션
const watchlistItems = inject("watchlistItems", ref([]));
const selectedStockFilter = inject("selectedStockFilter", ref(null));
const toggleStockFilter = inject("toggleStockFilter");

const sections = [
  { key: "watchlist", label: "관심 종목", icon: '<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />' },
  { key: "sector", label: "인기 테마", icon: '<rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />' },
  { key: "terms", label: "저장된 용어", icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />' }
];

function selectSection(key) {
  activeSection.value = key;
  if (!isOpen.value) isOpen.value = true;
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
  if (!isResizing.value) return;
  sidebarWidth.value = Math.min(Math.max(event.clientX, 210), 380);
}

function stopResize() {
  isResizing.value = false;
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
  window.removeEventListener("pointermove", handleResize);
}

onUnmounted(stopResize);
</script>

<style scoped>
.sidebar { width: 250px; flex-shrink: 0; border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 18px 0 0; transition: width 0.25s ease; background: var(--cream); overflow: visible; position: relative; }
.sidebar.resizing { transition: none; }
.sidebar.collapsed { width: 68px; }
.sidebar-resizer { position: absolute; top: 0; right: -5px; bottom: 0; z-index: 20; width: 10px; cursor: col-resize; touch-action: none; }
.sidebar-resizer::before { content: ""; position: absolute; top: 0; bottom: 0; left: 4px; width: 2px; background: transparent; transition: background 0.15s ease; }
.sidebar-resizer span { position: absolute; top: 50%; left: 2px; width: 6px; height: 44px; transform: translateY(-50%); border-radius: 4px; background: #cbd5e1; opacity: 0; transition: opacity 0.15s ease, background 0.15s ease; }
.sidebar-resizer:hover::before, .sidebar.resizing .sidebar-resizer::before { background: var(--primary, #ff5a1f); }
.sidebar-resizer:hover span, .sidebar.resizing .sidebar-resizer span { opacity: 1; background: var(--primary, #ff5a1f); }
.toggle-btn { width: 34px; height: 34px; margin: 0 0 14px 16px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: var(--text2); transition: all 0.2s ease; }
.toggle-btn:hover { background: var(--bg2); color: var(--text1); }
.toggle-btn svg { width: 18px; height: 18px; stroke: currentColor; stroke-width: 1.8; fill: none; transition: transform 0.25s ease; }
.section-nav { display: flex; flex-direction: column; gap: 4px; padding: 0 12px; }
.section-btn { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border: none; background: transparent; border-radius: var(--radius); cursor: pointer; color: var(--text2); font-size: 13.5px; white-space: nowrap; overflow: hidden; transition: all 0.2s ease; }
.section-btn:hover { background: var(--bg2); color: var(--text1); }
.section-btn.active { background: linear-gradient(90deg, rgba(255,106,0,.12), rgba(255,106,0,.03)); color: var(--primary); font-weight: 750; box-shadow: inset 3px 0 0 var(--primary); }
.section-btn svg { width: 18px; height: 18px; stroke: currentColor; stroke-width: 1.8; fill: none; flex-shrink: 0; }
.section-label { overflow: hidden; text-overflow: ellipsis; }
.section-content { flex: 1; overflow-y: auto; padding: 18px 16px 0; margin-top: 8px; border-top: 1px solid var(--border); display: flex; flex-direction: column; color: var(--text1); }
.section-content::-webkit-scrollbar { width: 4px; }
.section-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.filter-notice-bar { display: flex; justify-content: space-between; align-items: center; background: var(--primary-bg); color: var(--primary); border: 1px solid var(--primary-border); font-size: 11.5px; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; font-weight: 600; }
.clear-filter-btn { border: none; background: transparent; color: var(--primary); cursor: pointer; font-size: 12px; }
.empty-state-box { padding: 24px 0; text-align: center; color: var(--text3); }
.empty-icon { width: 22px; height: 24px; stroke: var(--text3); stroke-width: 1.5; fill: none; margin-bottom: 6px; }
.stock-list-wrapper { display: flex; flex-direction: column; gap: 6px; }
.stock-item-card { display: flex; align-items: center; gap: 12px; padding: 11px; border-radius: 10px; border: 1px solid var(--border); cursor: pointer; position: relative; transition: all 0.2s ease; background: var(--cream); }
.stock-item-card:hover { background: var(--bg2); border-color: #c7d1da; transform: translateX(2px); }
.stock-item-card.filter-active { background: var(--primary-bg); border-color: var(--primary-border); }
.stock-avatar-badge { width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0; background: #fff4ea; border: 1px solid #ffd0a7; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: var(--primary); }
.stock-meta-info { flex: 1; min-width: 0; text-align: left; }
.stock-title-name { font-size: 13px; font-weight: 700; color: var(--text1); }
.stock-price-tag { font-size: 11px; color: var(--text3); margin-top: 2px; }
.active-indicator-dot { width: 6px; height: 6px; background: var(--primary); border-radius: 50%; position: absolute; right: 12px; top: calc(50% - 3px); }
.add-btn { display: flex; align-items: center; gap: 6px; padding: 10px; font-size: 12.5px; color: var(--text2); border: 1px dashed #c9d3dd; border-radius: var(--radius); margin-top: 12px; cursor: pointer; justify-content: center; transition: all 0.15s ease; background: var(--cream); }
.add-btn:hover { border-color: var(--primary-border); color: var(--primary); background: var(--primary-bg); }
.word-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.word-pill { padding: 5px 10px; border-radius: 20px; background: var(--primary-bg); border: 1px solid var(--primary-border); font-size: 11px; color: var(--primary); font-weight: 600; }
.search-input-container { position: relative; margin-bottom: 14px; display: flex; align-items: center; }
.search-lens { position: absolute; left: 10px; width: 14px; height: 14px; stroke: var(--text3); stroke-width: 2; fill: none; }
.premium-sector-input { width: 100%; padding: 9px 12px 9px 32px; border-radius: 9px; border: 1px solid var(--border); font-size: 12.5px; background: var(--cream); color: var(--text1); transition: all 0.2s ease; }
.premium-sector-input:focus { outline: none; border-color: var(--primary); background: var(--cream); box-shadow: 0 0 0 3px rgba(255, 90, 31, 0.08); }
.sector-grid-layout { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.luxury-sector-chip { padding: 9px 12px; border-radius: var(--radius); font-size: 12.5px; border: 1px solid transparent; color: var(--text2); cursor: pointer; transition: all 0.15s ease; }
.luxury-sector-chip:hover { background: var(--bg2); color: var(--text1); }
.luxury-sector-chip.active { background: var(--primary-bg); color: var(--primary); border-color: var(--primary-border); font-weight: 600; }
.sidebar-footer { border-top: 1px solid var(--border); padding: 14px 12px; margin-top: auto; }
.user-row-card { display: flex; align-items: center; gap: 10px; }
.user-avatar-circle { width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; background: var(--primary); color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(255, 90, 31, 0.2); }
.user-profile-meta { flex: 1; min-width: 0; text-align: left; }
.user-display-name { font-size: 13px; font-weight: 600; color: var(--text1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.icon-btn-sm { width: 28px; height: 28px; flex-shrink: 0; border: none; background: transparent; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text3); }
.icon-btn-sm:hover { background: var(--bg2); color: var(--text1); }
.icon-btn-sm svg { width: 16px; height: 16px; stroke: currentColor; stroke-width: 1.7; fill: none; }

@media (max-width: 1180px) {
  .sidebar { width: 68px !important; }
  .sidebar-resizer { display: none; }
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
