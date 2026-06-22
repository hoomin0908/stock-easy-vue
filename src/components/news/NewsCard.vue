<template>
  <article class="news-card" @click="handleSelectNews(news)">
    
    <div class="news-thumbnail-wrapper">
      <img 
        v-if="news?.thumbnail_url" 
        :src="news.thumbnail_url" 
        alt="news thumbnail" 
        class="news-thumbnail" 
      />
      <div v-else class="news-thumbnail-fallback">
        <span>Stock</span>
        <span class="highlight">Easy</span>
      </div>
    </div>

    <div class="news-body">
      <div class="main-content">
        <div class="news-meta">
          <span class="badge" :class="badgeClass">{{ sentimentLabel }}</span>
          <span class="source">{{ news?.publisher || '언론사 정보 없음' }}</span>
          <span class="sep">·</span>
          <span class="time">{{ formatTimeAgo(news?.published_at) }}</span>
          
          <template v-if="news?.stockImpacts && news.stockImpacts.length">
            <span v-for="s in news.stockImpacts" :key="s.stockCode" class="stag">{{ s.stockName }}</span>
          </template>
        </div>

        <div class="news-title">{{ news?.title || '제목이 없는 뉴스입니다.' }}</div>
        
        <div class="news-summary">
          {{ news?.description || news?.content || news?.author || '상세 내용이 없는 기사입니다.' }}
        </div>
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

// 몇 분 전, 몇 시간 전 계산 함수
const formatTimeAgo = (isoString) => {
  if (!isoString) return "방금 전";
  const now = new Date();
  const past = new Date(isoString);
  const diffMs = now - past;
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${diffDays}일 전`;
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
  gap: 18px;
  padding: 16px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 8px;
  cursor: pointer;
  background: var(--bg, #ffffff);
  margin-bottom: 12px;
  /* 💡 핵심: 정렬 기준을 center로 잡아 이미지가 세로로 길어지며 찢어지는 현상 원천 차단 */
  align-items: center; 
}
.news-card:hover { border-color: #3b82f6; }

/* 1. 이미지 영역: 원문보기 높이에 의존하지 않고 고정된 카드용 비율(약 4:3) 확보 */
.news-thumbnail-wrapper {
  flex-shrink: 0;
  width: 120px;
  height: 90px; /* 💡 가로 120, 세로 90으로 비율을 완전히 고정해 찌그러짐을 방지합니다 */
  border-radius: 6px;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}
.news-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 이미지가 잘리더라도 고정 영역 안에 꽉 차도록 크롭 처리 */
}

/* 대체 플레이스홀더 */
.news-thumbnail-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: -0.3px;
  line-height: 1.3;
}
.news-thumbnail-fallback .highlight {
  color: #3b82f6;
  font-size: 11px;
  margin-top: 2px;
}

/* 2. 본문 텍스트 영역 */
.news-body {
  flex: 1;
  min-width: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 6px; /* 각 요소들 사이의 촘촘하고 일정한 간격 유지 */
}

.main-content {
  width: 100%;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}
.badge-up { background: #fee2e2; color: #ef4444; }
.badge-down { background: #dbeafe; color: #3b82f6; }
.badge-neutral { background: #f1f5f9; color: #64748b; }

.source { font-weight: 600; color: #475569; }
.sep { color: #cbd5e1; }
.stag { padding: 1px 6px; border-radius: 4px; background: #f1f5f9; font-size: 11px; color: #475569; font-weight: 500; }

.news-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 4px;
  color: #1e293b;
}
.news-summary {
  font-size: 12.5px;
  color: #475569;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 푸터 스타일 */
.news-footer { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  font-size: 11.5px; 
}
.ai-note { display: flex; align-items: center; gap: 4px; color: #d97706; font-weight: 600; }
.ai-note svg { width: 12px; height: 12px; fill: #d97706; }
.src-link { display: flex; align-items: center; gap: 4px; color: #94a3b8; text-decoration: none; }
.src-link:hover { color: #64748b; }
.src-link svg { width: 12px; height: 12px; stroke: currentColor; stroke-width: 1.8; fill: none; }
</style>