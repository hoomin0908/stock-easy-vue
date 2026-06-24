<template>
  <div class="app">
    <TopNav v-if="!route.meta.hideTopNav" />
    <div class="body">
      <Sidebar v-if="!route.meta.authPage" />
      <main class="main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from "vue";
import { useRoute } from "vue-router";
import TopNav from "./components/layout/TopNav.vue";
import Sidebar from "./components/layout/Sidebar.vue";

const route = useRoute();

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
</script>

<style scoped>
.app { display: flex; flex-direction: column; height: 100vh; background: var(--bg); }
.body { display: flex; flex: 1; overflow: hidden; }
.main { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
</style>
