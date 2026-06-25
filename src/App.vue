<template>
  <div class="app" :class="{ 'theme-dark': themeMode === 'dark' }">
    <div class="body">
      <Sidebar v-if="!route.meta.authPage" />
      <div class="content-shell">
        <TopNav v-if="!route.meta.hideTopNav" />
        <main class="main">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, provide, watch } from "vue";
import { useRoute } from "vue-router";
import TopNav from "./components/layout/TopNav.vue";
import Sidebar from "./components/layout/Sidebar.vue";

const route = useRoute();
const themeMode = ref(localStorage.getItem("stockeasy-theme") || "light");

// 1. 상태 정의
const watchlistItems = ref([]); // 관심 종목 리스트
const selectedStockFilter = ref(null); // 관심 종목 클릭 시 피드 필터링용 상태

// 2. 관심 종목 토글 (추가/삭제) 함수
function toggleWatchlist(stock) {
  const index = watchlistItems.value.findIndex(i => i.stockCode === stock.stockCode);
  if (index > -1) {
    watchlistItems.value.splice(index, 1);
  } else {
    watchlistItems.value.push({
      id: stock.stockCode,
      stockCode: stock.stockCode,
      shortName: stock.stockName.substring(0, 2),
      name: stock.stockName,
      price: "대기 중..."
    });
  }
}

// 3. 관심 종목 여부 확인 함수
function isWatched(stockCode) {
  return watchlistItems.value.some(i => i.stockCode === stockCode);
}

// 4. 관심 기업 필터 토글 함수
function toggleStockFilter(stockName) {
  if (selectedStockFilter.value === stockName) {
    selectedStockFilter.value = null;
  } else {
    selectedStockFilter.value = stockName;
  }
}

// 하위 컴포넌트가 꺼내 쓸 수 있도록 주입(Provide)
provide("watchlistItems", watchlistItems);
provide("selectedStockFilter", selectedStockFilter);
provide("toggleWatchlist", toggleWatchlist);
provide("isWatched", isWatched);
provide("toggleStockFilter", toggleStockFilter);
provide("themeMode", themeMode);
provide("toggleTheme", () => {
  themeMode.value = themeMode.value === "dark" ? "light" : "dark";
});

watch(themeMode, (mode) => {
  localStorage.setItem("stockeasy-theme", mode);
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
}, { immediate: true });

onMounted(() => {
  document.documentElement.dataset.theme = themeMode.value;
});
</script>

<style scoped>
.app { display: flex; height: 100vh; background: var(--bg); }
.body { display: flex; flex: 1; overflow: hidden; }
.content-shell { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
.main { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }

.app.theme-dark {
  --cream: #111318;
  --cream-soft: #161a21;
  --cream-deep: #1b2029;
  --charcoal: #0b0d11;
  --charcoal-soft: #111318;

  --ai: #f59e0b;
  --ai-bg: #251806;
  --ai-bg-strong: #332007;
  --ai-border: #6b460f;

  --signal-up-bg: #2a1113;
  --signal-down-bg: #101b33;
  --signal-neutral-bg: #1c222b;
  --danger: #f87171;
  --danger-bg: #221113;
  --danger-border: #5b262b;
  --danger-surface: #15181f;
  --success: #34d399;
  --success-bg: #0d241b;
  --error: #fb7185;
  --error-bg: #2b1118;

  --bg: #0b0d11;
  --bg2: #0f1218;
  --bg3: #171c24;
  --border: #303743;
  --text1: #ffffff;
  --text2: #d9dee7;
  --text3: #a9b1bf;

  --primary-bg: #2a180c;
  --primary-border: #7a4217;
  --panel-shadow: none;
}

.app.theme-dark :deep(.data-panel),
.app.theme-dark :deep(.list-side),
.app.theme-dark :deep(.news-card),
.app.theme-dark :deep(.saved-card),
.app.theme-dark :deep(.detail-article-body),
.app.theme-dark :deep(.ai-terms-section),
.app.theme-dark :deep(.ai-checkpoint-section),
.app.theme-dark :deep(.ai-highlight-section),
.app.theme-dark :deep(.related-widgets-section),
.app.theme-dark :deep(.highlight-item-box),
.app.theme-dark :deep(.widget-content-body),
.app.theme-dark :deep(.comment-menu-popover) {
  box-shadow: none;
}

.app.theme-dark :deep(.nav-tab.active),
.app.theme-dark :deep(.play-icon) {
  text-shadow: none;
}
</style>
