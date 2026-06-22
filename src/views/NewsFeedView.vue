<template>
  <div class="feed">
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

    <div class="feed-list">
      <div v-if="newsList.length === 0" class="empty-state" style="margin-top: 60px">
        <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="1.6" fill="none">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        표시할 뉴스가 없어요<br /><span style="font-size: 11px">백엔드 데이터를 가져오지 못했습니다.</span>
      </div>

      <NewsCard v-for="newsItem in newsList" :key="newsItem.id" :news="newsItem" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import NewsCard from "../components/news/NewsCard.vue";
import { fetchNewsFeed } from "../services/api";

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
    
    // Django REST Framework가 주는 순수 리스트 배열 주입
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
.feed { flex: 1; overflow-y: auto; padding: 20px 24px; }
.filter-bar { display: flex; gap: 8px; margin-bottom: 16px; }
.filter-chip {
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid var(--border, #e2e8f0);
  background: var(--bg, #ffffff);
  font-size: 12.5px;
  color: var(--text2, #475569);
  cursor: pointer;
}
.filter-chip.active { background: var(--text1, #1e293b); color: #fff; border-color: var(--text1, #1e293b); font-weight: 500; }
.feed-list { display: flex; flex-direction: column; gap: 12px; }
.empty-state { text-align: center; color: #94a3b8; font-size: 14px; line-height: 1.6; }
</style>