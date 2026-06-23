<template>
  <div class="split-container">
    <aside class="list-side" :class="{ 'has-detail': route.params.id }">
      <div class="filter-bar">
        <button
          v-for="f in filters"
          :key="f.value"
          class="filter-chip"
          :class="{ active: activeFilter === f.value }"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>

      <div class="list-scroll">
        <div v-if="newsList.length === 0" class="empty-state" style="margin-top: 40px">
          <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="1.6" fill="none">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          표시할 뉴스가 없어요<br />
          <span style="font-size: 11px; color: var(--text3)">백엔드 데이터를 가져오지 못했습니다.</span>
        </div>

        <NewsCard 
          v-for="newsItem in newsList" 
          :key="newsItem.id" 
          :news="newsItem" 
          :class="{ active: route.params.id == newsItem.id }"
        />
      </div>
    </aside>

    <section class="detail-side">
      <div v-if="!route.params.id" class="empty-state select-notice">
        <svg class="notice-icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        
        <h3>StockEasy 실시간 AI 브리핑</h3>
        
        <p v-if="activeFilter === 'ALL'">
          현재 시장에 총 <strong>{{ newsList.length }}개</strong>의 실시간 뉴스가 수신되었습니다.<br>
          상단의 <strong>호재 / 악재</strong> 필터를 선택하시면 감정별 뉴스만 모아 볼 수 있습니다.
        </p>
        <p v-else-if="activeFilter === 'POSITIVE'">
          현재 시장의 <span style="color: #22c55e; font-weight: 600;">호재성 모멘텀</span>을 지닌 뉴스 <strong>{{ newsList.length }}개</strong>를 분석 중입니다.<br>
          상승 여력이 있는 종목의 팩트를 왼쪽 피드에서 확인해 보세요.
        </p>
        <p v-else-if="activeFilter === 'NEGATIVE'">
          현재 리스크 관리가 필요한 <span style="color: #ef4444; font-weight: 600;">악재성 리스크</span> 뉴스 <strong>{{ newsList.length }}개</strong>가 노출 중입니다.<br>
          주요 지지선 및 하방 압력 요소를 체크하세요.
        </p>
        <p v-else>
          시장에 중립적인 영향을 미치는 뉴스 <strong>{{ newsList.length }}개</strong>를 표시 중입니다.
        </p>
      </div>

      <router-view v-else :news-list="newsList" />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import NewsCard from "../components/news/NewsCard.vue";
import { fetchNewsFeed } from "../services/api";

const route = useRoute();

const filters = [
  { label: "전체", value: "ALL" },
  { label: "호재", value: "POSITIVE" },
  { label: "악재", value: "NEGATIVE" },
  { label: "중립", value: "NEUTRAL" },
];
const activeFilter = ref("ALL");
const newsList = ref([]);

const loadNews = async () => {
  try {
    const params = activeFilter.value !== "ALL" ? { sentiment: activeFilter.value } : {};
    const response = await fetchNewsFeed(params);
    newsList.value = response.data;
    console.log("백엔드 수신 데이터:", response.data);
  } catch (error) {
    console.error("API 요청 실패:", error);
  }
};

onMounted(() => {
  loadNews();
});

watch(activeFilter, () => {
  loadNews();
});
</script>

<style scoped>
.split-container {
  display: flex;
  width: 100%;
  height: 100%;
  background: var(--bg);
  overflow: hidden;
}

/* 🍊 왼쪽 리스트 영역: 기본 상태에서는 화면을 가장 길고 넓게 사용 (flex: 2) */
.list-side {
  flex: 2; 
  min-width: 420px;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  background: var(--bg2);
  transition: flex 0.3s ease, width 0.3s ease; /* 부드러운 밀림 효과 */
}

/* 🍊 뉴스를 선택해서 상세 분석창이 열리면, 왼쪽 리스트가 콤팩트하게 밀림 (flex: 0.8 또는 고정폭) */
.list-side.has-detail {
  flex: 0.7;
  min-width: 380px;
  max-width: 420px;
}

.filter-bar {
  display: flex;
  gap: 8px;
  padding: 16px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.filter-chip {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--bg);
  font-size: 12.5px;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.15s ease;
}
.filter-chip:hover {
  border-color: var(--primary-border);
  color: var(--primary);
}
.filter-chip.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
  font-weight: 600;
}

.list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 🍊 오른쪽 상세 화면 영역: 뉴스 클릭 전에는 작게 유지되다가 클릭 시 대폭 확장 (flex: 1.3) */
.detail-side {
  flex: 1.3;
  min-width: 0;
  height: 100%;
  background: var(--bg);
  display: flex;
  flex-direction: column;
}

.select-notice {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}
.select-notice h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text1);
  margin-top: 16px;
}
.select-notice p {
  color: var(--text3);
  font-size: 13px;
  line-height: 1.6;
  margin-top: 8px;
}

.notice-icon {
  width: 40px;
  height: 40px;
  stroke: var(--text3);
  stroke-width: 1.5;
  fill: none;
}
</style>