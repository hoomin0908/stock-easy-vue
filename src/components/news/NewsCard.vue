<template>
  <article class="news-card" @click="handleSelectNews(news)">
    <div class="badge-col">
      <span class="badge" :class="badgeClass">{{ sentimentLabel }}</span>
    </div>

    <div class="news-body">
      <div class="news-meta">
        <span class="source">{{ news?.publisher || '언론사 정보 없음' }}</span>
        <span class="sep">·</span>
        <span class="time">{{ formatTime(news?.published_at) }}</span>
        
        <template v-if="news?.stockImpacts && news.stockImpacts.length">
          <span v-for="s in news.stockImpacts" :key="s.stockCode" class="stag">{{ s.stockName }}</span>
        </template>
      </div>

      <div class="news-title">{{ news?.title || '제목이 없는 뉴스입니다.' }}</div>
      
      <div class="news-summary">
        {{ news?.description || news?.content || news?.author || '상세 내용이 없는 기사입니다.' }}
      </div>

      <div class="news-footer">
        <span v-if="news?.analysis?.rewrittenContent" class="ai-note">
          <svg viewBox="0 0 24 24"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" /></svg>
          AI 재구성 기사
        </span>
        <a class="src-link" :href="news?.url || '#'" target="_blank" @click.stop>
          <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
          원문 보기
        </a>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  news: { type: Object, required: true },
});

const handleSelectNews = (newsItem) => {
  console.log("선택된 뉴스:", newsItem);
};

const formatTime = (isoString) => {
  if (!isoString) return "방금 전";
  const date = new Date(isoString);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const sentimentLabel = computed(() => {
  const s = props.news?.analysis?.sentiment;
  if (s === "POSITIVE") return "호재";
  if (s === "NEGATIVE") return "악재";
  if (s === "NEUTRAL") return "중립";
  return "분류 대기";
});

const badgeClass = computed(() => {
  const s = props.news?.analysis?.sentiment;
  if (s === "POSITIVE") return "badge-up";
  if (s === "NEGATIVE") return "badge-down";
  return "badge-neutral";
});
</script>

<style scoped>
.news-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 8px;
  cursor: pointer;
  background: var(--bg, #ffffff);
  margin-bottom: 12px;
}
.news-card:hover { border-color: #3b82f6; }
.badge-col { flex-shrink: 0; }
.badge { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.badge-up { background: #fee2e2; color: #ef4444; }
.badge-down { background: #dbeafe; color: #3b82f6; }
.badge-neutral { background: #f1f5f9; color: #64748b; }
.news-body { flex: 1; min-width: 0; text-align: left; }
.news-meta { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: #64748b; margin-bottom: 6px; flex-wrap: wrap; }
.source { font-weight: 600; color: #475569; }
.stag { padding: 2px 7px; border-radius: 10px; background: #f1f5f9; font-size: 10.5px; color: #334155; }
.news-title { font-size: 15px; font-weight: 600; line-height: 1.4; margin-bottom: 6px; color: #1e293b; }
.news-summary {
  font-size: 12.5px;
  color: #475569;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2; /* 호환성 경고 해결을 위해 표준 속성 추가 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.news-footer { display: flex; align-items: center; gap: 10px; margin-top: 10px; font-size: 11.5px; }
.ai-note { display: flex; align-items: center; gap: 4px; color: #d97706; font-weight: 600; }
.ai-note svg { width: 12px; height: 12px; fill: #d97706; }
.src-link { display: flex; align-items: center; gap: 4px; color: #64748b; text-decoration: none; }
.src-link svg { width: 12px; height: 12px; stroke: #64748b; stroke-width: 1.8; fill: none; }
</style>