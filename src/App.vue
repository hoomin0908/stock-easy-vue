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
  --cream: #171a21;
  --cream-soft: #1d222b;
  --cream-deep: #252c37;
  --charcoal: #0f1218;
  --charcoal-soft: #171a21;

  --ai: #f59e0b;
  --ai-bg: rgba(245, 158, 11, 0.1);
  --ai-bg-strong: rgba(245, 158, 11, 0.18);
  --ai-border: rgba(245, 158, 11, 0.32);

  --signal-up-bg: rgba(220, 38, 38, 0.12);
  --signal-down-bg: rgba(37, 99, 235, 0.14);
  --signal-neutral-bg: rgba(100, 116, 139, 0.16);
  --danger: #f87171;
  --danger-bg: rgba(248, 113, 113, 0.08);
  --danger-border: rgba(248, 113, 113, 0.28);
  --danger-surface: #1f232c;
  --success: #34d399;
  --success-bg: rgba(52, 211, 153, 0.12);
  --error: #fb7185;
  --error-bg: rgba(251, 113, 133, 0.12);

  --bg: #101319;
  --bg2: #121720;
  --bg3: #1d2430;
  --border: #2b3442;
  --text1: #f8fafc;
  --text2: #d2dae7;
  --text3: #99a6b8;

  --primary-bg: rgba(255, 106, 0, 0.14);
  --primary-border: rgba(255, 126, 32, 0.34);
  --panel-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
}
</style>
