<template>
  <div class="saved-page">
    <header class="page-header">
      <div>
        <p class="page-kicker">SAVED NEWS</p>
        <h1>저장한 뉴스</h1>
        <p class="page-description">저장해 둔 뉴스를 다시 확인하고 관리할 수 있습니다.</p>
      </div>
      <span v-if="!isLoading && !errorMessage" class="saved-count">
        {{ savedItems.length }}개
      </span>
    </header>

    <div v-if="isLoading" class="saved-grid" aria-label="저장한 뉴스 로딩 중">
      <div v-for="index in 3" :key="index" class="saved-card skeleton-card">
        <div class="skeleton skeleton-thumb"></div>
        <div class="skeleton-content">
          <div class="skeleton skeleton-line short"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line medium"></div>
          <div class="skeleton skeleton-line tiny"></div>
        </div>
      </div>
    </div>

    <div v-else-if="errorMessage" class="state-box error-state">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="8" x2="12" y2="13" />
        <circle cx="12" cy="17" r="0.7" fill="currentColor" />
      </svg>
      <strong>{{ errorMessage }}</strong>
      <button type="button" @click="loadSavedNews">다시 시도</button>
    </div>

    <div v-else-if="savedItems.length === 0" class="state-box empty-state-box">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
      </svg>
      <strong>저장한 뉴스가 없습니다.</strong>
      <p>뉴스를 저장하면 여기에서 다시 확인할 수 있습니다.</p>
    </div>

    <div v-else class="saved-grid">
      <div
        v-for="item in savedItems"
        :key="item.id"
        class="saved-card-shell"
      >
        <NewsCard :news="item.news" :show-viewed-state="false">
          <template #footer>
            {{ formatSavedDate(item.created_at) }} 저장
          </template>
        </NewsCard>
        <button
          type="button"
          class="delete-btn"
          :disabled="deletingId === item.id"
          :title="`${item.news.title} 저장 삭제`"
          aria-label="저장 뉴스 삭제"
          @click.stop="removeSavedNews(item.id)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M8 6V4h8v2M19 6l-1 15H6L5 6" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { deleteSavedNews, fetchSavedNews } from "../services/api";
import NewsCard from "../components/news/NewsCard.vue";

const savedItems = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const deletingId = ref(null);

function normalizeSavedNews(data) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];

  return [...list].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

async function loadSavedNews() {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const { data } = await fetchSavedNews();
    savedItems.value = normalizeSavedNews(data);
  } catch (error) {
    console.error("저장 뉴스 조회 실패", error);
    savedItems.value = [];
    errorMessage.value = "저장한 뉴스를 불러오지 못했습니다.";
  } finally {
    isLoading.value = false;
  }
}

async function removeSavedNews(savedNewsId) {
  if (deletingId.value !== null) return;

  deletingId.value = savedNewsId;

  try {
    await deleteSavedNews(savedNewsId);
    savedItems.value = savedItems.value.filter(
      (item) => item.id !== savedNewsId
    );
  } catch (error) {
    console.error("저장 뉴스 삭제 실패", error);
    window.alert("저장한 뉴스를 삭제하지 못했습니다.");
  } finally {
    deletingId.value = null;
  }
}

function formatSavedDate(value) {
  if (!value) return "날짜 정보 없음";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "날짜 정보 없음";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

onMounted(loadSavedNews);
</script>

<style scoped>
.saved-page {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #eef2f7;
}
.saved-page > * {
  width: 100%;
  max-width: none;
  margin-left: auto;
  margin-right: auto;
}
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}
.page-kicker {
  color: var(--primary);
  font-size: 11px;
  font-weight: 850;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.page-header h1 {
  color: var(--text1);
  font-size: 24px;
  line-height: 1.25;
}
.page-description {
  color: var(--text3);
  font-size: 12.5px;
  margin-top: 6px;
}
.saved-count {
  padding: 6px 10px;
  border: 1px solid var(--primary-border);
  border-radius: 999px;
  background: var(--primary-bg);
  color: var(--primary);
  font-size: 11.5px;
  font-weight: 750;
}
.saved-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
  gap: 18px;
}
.saved-card,
.saved-card-shell {
  position: relative;
  min-width: 0;
}
.saved-card-shell :deep(.news-top-row) {
  padding-right: 34px;
}
.saved-card {
  display: flex;
  gap: 18px;
  padding: 17px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #fffdfb 100%);
  cursor: pointer;
  outline: none;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
.delete-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text3);
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}
.delete-btn:hover {
  background: #fff1f2;
  color: #dc2626;
}
.delete-btn:disabled {
  opacity: 0.4;
  cursor: wait;
}
.delete-btn svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.state-box {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 42px 24px;
  color: var(--text3);
  text-align: center;
}
.state-box svg {
  width: 42px;
  height: 42px;
  margin-bottom: 4px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.state-box strong {
  color: var(--text2);
  font-size: 14px;
}
.state-box p {
  font-size: 12px;
  line-height: 1.6;
}
.error-state { color: #dc2626; }
.error-state button {
  margin-top: 5px;
  padding: 7px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--cream);
  color: var(--text2);
  cursor: pointer;
}
.skeleton-card { cursor: default; pointer-events: none; }
.skeleton {
  border-radius: 7px;
  background: linear-gradient(90deg, var(--bg3) 25%, var(--border) 50%, var(--bg3) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.3s infinite;
}
.skeleton-thumb {
  width: 128px;
  aspect-ratio: 1.44 / 1;
  flex-shrink: 0;
}
.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 3px;
}
.skeleton-line { width: 100%; height: 14px; }
.skeleton-line.short { width: 34%; height: 10px; }
.skeleton-line.medium { width: 72%; }
.skeleton-line.tiny { width: 45%; height: 9px; margin-top: auto; }
@keyframes shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
@media (max-width: 900px) {
  .saved-grid { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .saved-page { padding: 18px 14px 38px; }
}
</style>
