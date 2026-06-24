<template>
  <main class="terms-view">
    <section class="terms-content">
      <header class="view-heading">
        <div>
          <p class="eyebrow">Glossary</p>
          <h1>용어사전</h1>
          <p class="view-description">저장한 투자 용어와 설명을 확인할 수 있습니다.</p>
        </div>
        <span class="term-count">{{ savedTerms.length }}개</span>
      </header>

      <section class="terms-panel">
        <div v-if="isLoading" class="state-box" role="status">
          <span class="spinner" aria-hidden="true"></span>
          저장한 용어를 불러오는 중입니다...
        </div>

        <div v-else-if="errorMessage" class="state-box error-state" role="alert">
          <p>{{ errorMessage }}</p>
          <button type="button" class="retry-btn" @click="loadSavedTerms">다시 시도</button>
        </div>

        <div v-else-if="savedTerms.length === 0" class="state-box">
          저장한 용어가 없습니다.
        </div>

        <div v-else class="term-list">
          <article v-for="item in savedTerms" :key="item.id" class="term-card">
            <div class="term-copy">
              <h2>{{ item.term?.name || "이름 없는 용어" }}</h2>
              <p>{{ item.term?.description || "설명 정보가 없습니다." }}</p>
              <p v-if="item.news?.id" class="source-news" :title="item.news.title">
                출처 뉴스: {{ item.news.title || "제목 정보 없음" }}
              </p>
            </div>
            <div class="term-actions">
              <button
                v-if="item.news?.id"
                type="button"
                class="news-btn"
                :aria-label="`${item.news.title || '연결된'} 뉴스 보기`"
                @click="goToNews(item.news.id)"
              >
                뉴스 보기
              </button>
              <button
                type="button"
                class="delete-btn"
                :disabled="deletingIds.has(item.id)"
                :aria-label="`${item.term?.name || '용어'} 삭제`"
                @click="handleDelete(item.id)"
              >
                {{ deletingIds.has(item.id) ? "삭제 중" : "삭제" }}
              </button>
            </div>
          </article>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { deleteSavedTerm, fetchSavedTerms } from "../services/api";

const router = useRouter();
const savedTerms = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const deletingIds = ref(new Set());

function normalizeList(data) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];

  return [...list].sort((a, b) => {
    const aTime = new Date(a?.created_at).getTime();
    const bTime = new Date(b?.created_at).getTime();

    if (Number.isNaN(aTime)) return Number.isNaN(bTime) ? 0 : 1;
    if (Number.isNaN(bTime)) return -1;
    return aTime - bTime;
  });
}

async function loadSavedTerms() {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const { data } = await fetchSavedTerms();
    savedTerms.value = normalizeList(data);
  } catch (error) {
    console.error("저장 용어 조회 실패", error);
    savedTerms.value = [];
    errorMessage.value = "저장한 용어를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
  } finally {
    isLoading.value = false;
  }
}

function goToNews(newsId) {
  if (!newsId) return;
  router.push({ path: `/news/${newsId}` });
}

async function handleDelete(userTermId) {
  if (deletingIds.value.has(userTermId)) return;

  deletingIds.value = new Set(deletingIds.value).add(userTermId);
  errorMessage.value = "";

  try {
    await deleteSavedTerm(userTermId);
    await loadSavedTerms();
  } catch (error) {
    console.error("저장 용어 삭제 실패", error);
    errorMessage.value = "용어를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  } finally {
    const nextDeletingIds = new Set(deletingIds.value);
    nextDeletingIds.delete(userTermId);
    deletingIds.value = nextDeletingIds;
  }
}

onMounted(loadSavedTerms);
</script>

<style scoped>
.terms-view {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  background: var(--bg2);
  padding: 24px;
}
.terms-content {
  max-width: 920px;
  margin: 0 auto;
}
.view-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.eyebrow {
  color: var(--primary);
  font-size: 11px;
  font-weight: 850;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.view-heading h1 {
  color: var(--text1);
  font-size: 24px;
  line-height: 1.25;
}
.view-description {
  color: var(--text3);
  font-size: 12.5px;
  margin-top: 6px;
}
.term-count {
  flex-shrink: 0;
  color: var(--primary);
  font-size: 12px;
  font-weight: 850;
}
.terms-panel {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--cream);
  padding: 18px;
}
.state-box {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: var(--radius);
  background: var(--bg2);
  color: var(--text3);
  padding: 24px;
  text-align: center;
  font-size: 13px;
}
.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.error-state {
  color: #dc2626;
}
.retry-btn,
.delete-btn {
  border: 1px solid var(--primary-border);
  border-radius: var(--radius);
  background: var(--primary-bg);
  color: var(--primary);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}
.retry-btn {
  padding: 9px 14px;
}
.term-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.term-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg2);
  padding: 16px;
}
.term-copy {
  flex: 1;
  min-width: 0;
}
.term-copy h2 {
  color: var(--text1);
  font-size: 15px;
  font-weight: 850;
  line-height: 1.4;
}
.term-copy p {
  color: var(--text3);
  font-size: 12.5px;
  line-height: 1.65;
  margin-top: 6px;
}
.term-copy .source-news {
  max-width: 100%;
  overflow: hidden;
  color: var(--text2);
  font-size: 11.5px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.term-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.news-btn,
.delete-btn {
  padding: 8px 12px;
}
.news-btn {
  border: 1px solid var(--primary-border);
  border-radius: var(--radius);
  background: transparent;
  color: var(--primary);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}
.news-btn:hover {
  border-color: var(--primary);
  background: var(--primary-bg);
}
.retry-btn:hover {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}
.delete-btn:hover:not(:disabled) {
  border-color: #dc2626;
  background: #dc2626;
  color: #fff;
}
.delete-btn {
  border-color: #fecaca;
  background: #fff7f7;
  color: #dc2626;
}
.delete-btn:disabled {
  cursor: wait;
  opacity: 0.6;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .terms-view {
    padding: 18px 14px;
  }
  .view-heading {
    align-items: flex-start;
  }
  .term-card {
    flex-direction: column;
  }
  .term-actions {
    align-self: flex-end;
  }
}
</style>
