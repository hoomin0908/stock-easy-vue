<template>
  <div class="news-card" @click="goToDetail">
    <div class="card-body-layout">
      <div v-if="news.thumbnail_url" class="news-thumb-box">
        <img :src="news.thumbnail_url" alt="뉴스 썸네일" class="thumb-img" />
      </div>

      <div class="news-text-content">
        <div class="news-top-row">
          <span class="sentiment-badge" :class="calculatedSentiment.class">
            {{ calculatedSentiment.label }}
          </span>
          <span class="meta-divider">•</span>
          <span class="publisher-txt">{{ news.publisher }}</span>
          <span class="meta-divider">•</span>
          <span class="time-txt">{{ formattedTime }}</span>
        </div>

        <h3 class="news-title-link">
          {{ news.title }}
        </h3>
        
        <div class="news-author-row">
          <span class="news-author-txt" v-if="news.author">
            {{ news.author }}
          </span>
          <span class="inline-divider" v-if="news.author">•</span>
          
          <a :href="news.url" target="_blank" class="origin-link-btn" @click.stop>
            <svg viewBox="0 0 24 24" class="link-icon">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            원문 보기
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";

const props = defineProps({
  news: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const route = useRoute();

// 실시간 프론트엔드 자체 컨텍스트 감정 분류 가중치 알고리즘
const calculatedSentiment = computed(() => {
  if (props.news.ai_analysis?.sentiment) {
    const s = props.news.ai_analysis.sentiment.toLowerCase();
    if (s === "positive") return { label: "호재", class: "up" };
    if (s === "negative") return { label: "악재", class: "down" };
    return { label: "중립", class: "neutral" };
  }

  const title = props.news.title || "";
  const content = props.news.content || "";
  const fullText = (title + " " + content).toLowerCase();

  const positiveKeywords = [
    "상승", "돌파", "기부", "호실적", "최대", "급등", "성장", "흑자", 
    "순항", "강세", "오름세", "인상", "수혜", "계약 체결", "도약", "유치"
  ];
  
  const negativeKeywords = [
    "폭락", "대폭락", "낙폭", "증발", "털썩", "곡소리", "급락", "하락", 
    "적자", "손실", "리스크", "붕괴", "위기", "압박", "쇼크", "우려", "통보"
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  positiveKeywords.forEach(kw => { if (fullText.includes(kw)) positiveScore += 1.5; });
  negativeKeywords.forEach(kw => { if (fullText.includes(kw)) negativeScore += 1.5; });

  if (positiveScore > negativeScore) {
    return { label: "호재", class: "up" };
  } else if (negativeScore > positiveScore) {
    return { label: "악재", class: "down" };
  }
  
  return { label: "중립", class: "neutral" };
});

// 💡 2. 라우터 라벨 네임 버그를 차단하기 위해 직관적인 주소창 경로(path) 직접 매핑 방식으로 대폭 고도화
function goToDetail() {
  router.push({ 
    path: `/news/${props.news.id}`, 
    query: route.query 
  });
}

const formattedTime = computed(() => {
  if (!props.news.published_at) return "방금 전";
  const pubDate = new Date(props.news.published_at);
  const now = new Date();
  const diffMin = Math.floor((now - pubDate) / (1000 * 60));

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  
  return `${pubDate.getMonth() + 1}월 ${pubDate.getDate()}일`;
});
</script>

<style scoped>
.news-card {
  background: #ffffff; border: 1px solid var(--border, #e2e8f0);
  border-radius: var(--radius, 14px); padding: 18px;
  transition: all 0.2s ease; cursor: pointer;
}
.news-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05); border-color: var(--border-hover, #cbd5e1); }
.news-card.active { border-color: var(--primary, #ff5a1f); background: var(--primary-bg, #fff5f1); }

.card-body-layout { display: flex; gap: 20px; align-items: flex-start; }

.news-thumb-box { width: 124px; height: 86px; border-radius: 8px; overflow: hidden; flex-shrink: 0; border: 1px solid var(--border, #e2e8f0); }
.thumb-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.news-card:hover .thumb-img { transform: scale(1.04); }

.news-text-content { flex: 1; min-width: 0; text-align: left; }

.news-top-row { display: flex; align-items: center; font-size: 12.5px; color: var(--text3, #64748b); margin-bottom: 10px; }
.meta-divider { margin: 0 8px; color: var(--border, #e2e8f0); }

.sentiment-badge { padding: 3px 9px; border-radius: 4px; font-size: 11.5px; font-weight: 700; letter-spacing: -0.2px; }
.sentiment-badge.up { background: #e8f5e9; color: #2e7d32; }
.sentiment-badge.down { background: #ffebee; color: #c62828; }
.sentiment-badge.neutral { background: #f1f5f9; color: #475569; }

.publisher-txt { font-weight: 600; color: var(--text2, #475569); }

.news-title-link { font-size: 16px; font-weight: 700; color: var(--text1, #1e293b); line-height: 1.5; margin-bottom: 8px; letter-spacing: -0.3px; }
.news-card:hover .news-title-link { color: var(--primary, #ff5a1f); }

.news-author-row { display: flex; align-items: center; flex-wrap: wrap; margin-top: 6px; }
.news-author-txt { font-size: 13px; color: var(--text3, #64748b); font-weight: 500; }
.inline-divider { font-size: 11px; margin: 0 8px; color: var(--border, #cbd5e1); }

.origin-link-btn { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: var(--text3, #94a3b8); text-decoration: none; transition: color 0.15s ease; font-weight: 500; }
.origin-link-btn:hover { color: var(--text1, #1e293b); }
.link-icon { width: 13px; height: 13px; stroke: currentColor; stroke-width: 2; fill: none; }
</style>