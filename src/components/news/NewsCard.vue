<template>
  <article class="news-card" @click="handleSelectNews">
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
          <span class="source">{{ news?.publisher || "언론사 정보 없음" }}</span>
          <span class="sep">·</span>
          <span class="time">{{ formatTimeAgo(news?.published_at) }}</span>

          <template v-if="news?.stockImpacts && news.stockImpacts.length">
            <span v-for="s in news.stockImpacts" :key="s.stockCode" class="stag">{{ s.stockName }}</span>
          </template>
        </div>

        <div class="news-title">{{ news?.title || "제목이 없는 뉴스입니다." }}</div>

        <div class="news-summary">
          {{ news?.description || news?.content || news?.author || "상세 내용이 없는 기사입니다." }}
        </div>
      </div>

      <div class="news-footer">
        <span v-if="news?.ai_analysis?.rewritten_content" class="ai-note">
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
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  news: { type: Object, required: true },
});

function handleSelectNews() {
  router.push(`/news/${props.news.id}`);
}

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

// 백엔드 감정 분석 라벨 처리
const sentimentLabel = computed(() => {
  const a = props.news?.ai_analysis;
  if (!a || a.status !== "success") return "분류 대기";
  const s = a.sentiment?.toLowerCase();
  if (s === "positive") return "호재";
  if (s === "negative") return "악재";
  if (s === "neutral") return "중립";
  return "분류 대기";
});

// 호재/악재 뱃지 클래스
const badgeClass = computed(() => {
  const a = props.news?.ai_analysis;
  if (!a || a.status !== "success") return "badge-neutral";
  const s = a.sentiment?.toLowerCase();
  if (s === "positive") return "badge-up";
  if (s === "negative") return "badge-down";
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
  align-items: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 🍊 마우스 호버 시 주황색 보더 힌트 */
.news-card:hover { 
  border-color: var(--primary-border, #ffe2d5); 
  box-shadow: 0 4px 12px rgba(255, 90, 31, 0.02);
}

/* 🍊 클릭되어 선택된 상태일 때 전체 주황색 테두리 + 연한 주황 배경 */
.news-card.active {
  border-color: var(--primary, #ff5a1f);
  background: var(--primary-bg, #fff5f1);
  box-shadow: 0 4px 12px rgba(255, 90, 31, 0.06);
}

.news-thumbnail-wrapper {
  flex-shrink: 0;
  width: 120px;
  height: 90px;
  border-radius: 6px;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid var(--border, #e2e8f0);
}
.news-thumbnail { width: 100%; height: 100%; object-fit: cover; }

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
/* 🍊 대체 이미지 안의 'Easy' 텍스트 포인트 오렌지화 */
.news-thumbnail-fallback .highlight { color: var(--primary, #ff5a1f); font-size: 11px; margin-top: 2px; }

.news-body { flex: 1; min-width: 0; text-align: left; display: flex; flex-direction: column; gap: 6px; }
.main-content { width: 100%; }

.news-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b; margin-bottom: 6px; flex-wrap: wrap; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }

.badge-up { background: var(--red-bg, #fee2e2); color: var(--red, #ef4444); }
/* 🔵 악재 뱃지는 가독성이 떨어지던 기존 하늘색 대신 선명한 다크블루 톤으로 변경 */
.badge-down { background: #dbeafe; color: #2563eb; }
.badge-neutral { background: var(--bg3, #f1f5f9); color: var(--text2, #475569); }

.source { font-weight: 600; color: var(--text2, #475569); }
.sep { color: #cbd5e1; }
.stag { padding: 1px 6px; border-radius: 4px; background: var(--bg3, #f1f5f9); font-size: 11px; color: var(--text2, #475569); font-weight: 500; }

.news-title { font-size: 15px; font-weight: 600; line-height: 1.4; margin-bottom: 4px; color: var(--text1, #0f172a); }

.news-summary {
  font-size: 12.5px;
  color: var(--text2, #475569);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-footer { display: flex; align-items: center; gap: 10px; font-size: 11.5px; }

/* 🍊 AI 마크 컬러 앰버에서 오렌지로 변경 */
.ai-note { display: flex; align-items: center; gap: 4px; color: var(--primary, #ff5a1f); font-weight: 600; }
.ai-note svg { width: 12px; height: 12px; fill: var(--primary, #ff5a1f); }

.src-link { display: flex; align-items: center; gap: 4px; color: var(--text3, #94a3b8); text-decoration: none; transition: color 0.15s; }
.src-link:hover, .news-card.active .src-link { color: var(--primary, #ff5a1f); }
.src-link svg { width: 12px; height: 12px; stroke: currentColor; stroke-width: 1.8; fill: none; }
</style>