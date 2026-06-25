<template>
  <div class="news-card" :class="{ viewed: shouldShowViewedState }" @click="goToDetail">
    <span v-if="shouldShowViewedState" class="viewed-label">읽음</span>
    <div class="card-body-layout">
      <div class="news-thumb-box">
        <img
          :src="thumbnailSrc"
          alt="뉴스 썸네일"
          class="thumb-img"
          :class="{ 'is-placeholder': usesPlaceholder }"
          @error="handleThumbnailError"
        />
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

        <div v-if="$slots.footer" class="news-card-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import newsPlaceholder from "../../assets/images/news-placeholder.png";

const props = defineProps({
  news: {
    type: Object,
    required: true
  },
  showViewedState: {
    type: Boolean,
    default: true
  }
});

const router = useRouter();
const route = useRoute();
const thumbnailFailed = ref(false);
const viewedNewsIds = ref(readViewedNewsIds());

const thumbnailSrc = computed(() => props.news.thumbnail_url || newsPlaceholder);
const usesPlaceholder = computed(
  () => !props.news.thumbnail_url || thumbnailFailed.value
);
const isViewed = computed(() => viewedNewsIds.value.has(String(props.news.id)));
const shouldShowViewedState = computed(() => props.showViewedState && isViewed.value);

function handleThumbnailError(event) {
  thumbnailFailed.value = true;
  if (event.currentTarget.src !== newsPlaceholder) {
    event.currentTarget.src = newsPlaceholder;
  }
}

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
  saveRecentNews();
  router.push({ 
    path: `/news/${props.news.id}`, 
    query: route.query 
  });
}

function saveRecentNews() {
  const storageKey = "stockeasy-recent-news";
  const currentNews = {
    id: props.news.id,
    title: props.news.title,
    publisher: props.news.publisher,
    viewedAt: new Date().toISOString(),
  };

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const list = Array.isArray(saved) ? saved : [];
    const nextList = [
      currentNews,
      ...list.filter(item => String(item.id) !== String(currentNews.id)),
    ].slice(0, 10);

    localStorage.setItem(storageKey, JSON.stringify(nextList));
    viewedNewsIds.value = new Set(nextList.map(item => String(item.id)));
  } catch (error) {
    console.error("최근 본 뉴스 저장 실패", error);
  }
}

function readViewedNewsIds() {
  try {
    const saved = JSON.parse(localStorage.getItem("stockeasy-recent-news") || "[]");
    return new Set(
      Array.isArray(saved)
        ? saved.map(item => String(item.id))
        : []
    );
  } catch {
    return new Set();
  }
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
  position: relative;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 18px;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  cursor: pointer;
  container-type: inline-size;
  box-shadow: var(--panel-shadow);
}
.viewed-label {
  position: absolute;
  top: 10px;
  left: 12px;
  z-index: 2;
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.72);
  color: #ffffff;
  font-size: 10px;
  font-weight: 750;
  line-height: 1;
}
.news-card.viewed .card-body-layout {
  opacity: 0.48;
  filter: saturate(0.72);
}
.news-card:hover {
  z-index: 2;
  transform: translateY(-7px) scale(1.035);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.14);
}
.news-card.active { border-color: var(--primary); background: var(--primary-bg); opacity: 1; box-shadow: inset 0 0 0 1px rgba(255,106,0,.12), 0 0 28px rgba(255,106,0,.08); }

.card-body-layout { display: flex; gap: 20px; align-items: stretch; }

.news-thumb-box {
  width: clamp(88px, 28cqw, 168px);
  aspect-ratio: 1.44 / 1;
  height: auto;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid var(--border);
  transition: width 0.18s ease;
}
.thumb-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.thumb-img.is-placeholder { transform: scale(1.35); }
.news-card:hover .thumb-img { transform: scale(1.04); }
.news-card:hover .thumb-img.is-placeholder { transform: scale(1.42); }

.news-text-content { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; text-align: left; }

.news-top-row { display: flex; align-items: center; font-size: clamp(11.5px, 1.6cqw, 13.5px); color: var(--text3); margin-bottom: 10px; }
.meta-divider { margin: 0 8px; color: var(--border); }

.sentiment-badge { padding: 3px 9px; border-radius: 4px; font-size: clamp(10.5px, 1.45cqw, 12.5px); font-weight: 700; letter-spacing: -0.2px; }
.sentiment-badge.up { background: var(--signal-up-bg, #fef2f2); color: var(--signal-up, #dc2626); }
.sentiment-badge.down { background: var(--signal-down-bg, #eff6ff); color: var(--signal-down, #2563eb); }
.sentiment-badge.neutral { background: var(--signal-neutral-bg, #f1f5f9); color: var(--signal-neutral, #64748b); }

.publisher-txt { font-weight: 650; color: var(--text2); }

.news-title-link {
  max-width: 100%;
  overflow: hidden;
  color: var(--text1);
  font-size: clamp(15px, 2.2cqw, 20px);
  font-weight: 800;
  line-height: 1.45;
  margin-bottom: 8px;
  letter-spacing: -0.4px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.news-card:hover .news-title-link { color: var(--primary, #ff5a1f); }

.news-author-row { display: flex; align-items: center; flex-wrap: wrap; margin-top: 6px; }
.news-author-txt { font-size: clamp(11.5px, 1.6cqw, 13.5px); color: var(--text3); font-weight: 500; }
.inline-divider { font-size: 11px; margin: 0 8px; color: var(--border); }

.origin-link-btn { display: inline-flex; align-items: center; gap: 4px; font-size: clamp(11.5px, 1.6cqw, 13.5px); color: var(--text3, #94a3b8); text-decoration: none; transition: color 0.15s ease; font-weight: 500; }
.origin-link-btn:hover { color: var(--primary); }
.link-icon { width: 13px; height: 13px; stroke: currentColor; stroke-width: 2; fill: none; }
.news-card-footer {
  margin-top: 7px;
  color: var(--text3);
  font-size: clamp(11px, 1.5cqw, 12.5px);
  font-weight: 500;
}

:global(.theme-dark) .news-card {
  background: #111318;
  border-color: #303743;
  box-shadow: none;
}
:global(.theme-dark) .news-card:hover {
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.32);
}
:global(.theme-dark) .news-thumb-box {
  border-color: #313b4d;
}

@container (max-width: 390px) {
  .news-thumb-box { width: clamp(84px, 27cqw, 104px); }
  .card-body-layout { gap: 12px; }
  .news-top-row { flex-wrap: wrap; row-gap: 5px; }
}

@container (min-width: 760px) {
  .news-card { padding: clamp(18px, 2.3cqw, 24px); }
  .card-body-layout { gap: clamp(20px, 2.5cqw, 28px); }
  .news-title-link { line-height: 1.55; }
}

@media (max-width: 760px) {
  .news-card { padding: 14px; }
  .news-thumb-box { width: clamp(92px, 26cqw, 132px); }
  .card-body-layout { gap: 12px; }
}
</style>
