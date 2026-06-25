<template>
  <div class="youtube-feed-container">
    <div class="feed-header">
      <div class="header-title">
      </div>
      <p class="header-caption" v-if="companyName && companyName !== '해당 기업'">
        '<strong>{{ companyName }}</strong>' 관련 최신 시장 브리핑입니다.
      </p>
    </div>

    <div v-if="isLoading" class="feed-state-box">
      <div class="loading-spinner"></div>
      <p>고화질 썸네일을 가져오는 중...</p>
    </div>

    <div v-else-if="videos.length === 0" class="feed-state-box empty">
      <p class="no-data-text">{{ errorMessage || "관련 영상을 찾지 못했습니다." }}</p>
      <button
        v-if="errorMessage"
        type="button"
        class="retry-btn"
        @click="loadComponentData"
      >
        다시 시도
      </button>
    </div>

    <div v-else class="video-browser">
      <section v-if="selectedVideo" class="selected-video-card">
        <div class="video-player">
          <iframe
            :key="selectedVideo.id.videoId"
            :src="selectedVideoEmbedUrl"
            :title="selectedVideo.snippet.title"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>

        <div class="selected-video-info">
          <h3 v-html="selectedVideo.snippet.title"></h3>
          <p v-if="selectedVideo.snippet.channelTitle">
            {{ selectedVideo.snippet.channelTitle }}
          </p>
        </div>
      </section>

      <div class="video-carousel" aria-label="관련 유튜브 영상 목록">
        <button
          v-for="video in videos"
          :key="video.id.videoId"
          type="button"
          class="video-select-card"
          :class="{ active: isSelectedVideo(video) }"
          :aria-pressed="isSelectedVideo(video)"
          @click="selectVideo(video)"
        >
          <span class="carousel-thumbnail">
            <img
              :src="video.snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${video.id.videoId}/mqdefault.jpg`"
              :alt="video.snippet.title"
            />
            <span class="play-badge" aria-hidden="true">▶</span>
          </span>
          <span class="carousel-video-info">
            <strong v-html="video.snippet.title"></strong>
            <small>{{ video.snippet.channelTitle }}</small>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import axios from "axios";

const props = defineProps({
  companyName: { type: String, required: true, default: "해당 기업" }
});

const videos = ref([]);
const selectedVideo = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");

const selectedVideoEmbedUrl = computed(() => {
  const videoId = selectedVideo.value?.id?.videoId;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
});

async function fetchYoutubeVideos(query) {
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/search`;

  if (!API_KEY) {
    throw new Error("YOUTUBE_API_KEY_MISSING");
  }

  try {
    const response = await axios.get(url, {
      params: { key: API_KEY, q: query, part: "snippet", type: "video", maxResults: 5, regionCode: "KR", safeSearch: "moderate" }
    });
    return response.data.items || [];
  } catch (err) {
    const status = err.response?.status;
    const reason = err.response?.data?.error?.errors?.[0]?.reason;

    if (
      status === 429 ||
      reason === "quotaExceeded" ||
      reason === "dailyLimitExceeded" ||
      reason === "rateLimitExceeded"
    ) {
      throw new Error("YOUTUBE_QUOTA_EXCEEDED");
    }

    if (status === 400 || status === 403) {
      throw new Error("YOUTUBE_API_KEY_INVALID");
    }

    throw new Error("YOUTUBE_REQUEST_FAILED");
  }
}

async function loadComponentData() {
  if (!props.companyName || props.companyName === "해당 기업") {
    videos.value = [];
    selectedVideo.value = null;
    return;
  }
  isLoading.value = true;
  errorMessage.value = "";
  selectedVideo.value = null;

  try {
    let result = await fetchYoutubeVideos(`${props.companyName} 주식 분석`);
    if (result.length === 0) result = await fetchYoutubeVideos(`${props.companyName} 전망`);
    if (result.length === 0) result = await fetchYoutubeVideos(`${props.companyName} 뉴스`);

    videos.value = result;
    selectedVideo.value = result[0] || null;
  } catch (error) {
    videos.value = [];
    selectedVideo.value = null;

    if (error.message === "YOUTUBE_QUOTA_EXCEEDED") {
      errorMessage.value =
        "YouTube API 요청 한도가 부족하거나 일시적으로 제한되었습니다. 잠시 후 다시 시도해 주세요.";
    } else if (error.message === "YOUTUBE_API_KEY_MISSING") {
      errorMessage.value = "YouTube API 키가 설정되지 않았습니다.";
    } else if (error.message === "YOUTUBE_API_KEY_INVALID") {
      errorMessage.value = "YouTube API 키 또는 API 사용 설정을 확인해 주세요.";
    } else {
      errorMessage.value = "YouTube 영상을 불러오지 못했습니다. 네트워크 상태를 확인해 주세요.";
    }
  } finally {
    isLoading.value = false;
  }
}

function selectVideo(video) {
  selectedVideo.value = video;
}

function isSelectedVideo(video) {
  return selectedVideo.value?.id?.videoId === video.id?.videoId;
}

watch(() => props.companyName, loadComponentData);
onMounted(loadComponentData);
</script>

<style scoped>
.youtube-feed-container { display: flex; flex-direction: column; min-height: 100%; height: 100%; }
.feed-header { width: 100%; margin-bottom: 16px; text-align: left; }
.header-title { display: flex; align-items: center; gap: 8px; }
.header-title h3 { font-size: 15px; font-weight: 800; color: var(--text1); margin: 0; }
.header-caption { font-size: 12px; color: var(--text3); margin-top: 6px; }

.video-browser {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.selected-video-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--cream);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.07);
}
.video-player {
  position: relative;
  width: 100%;
  max-height: 340px;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #0f172a;
}
.video-player iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
.selected-video-info {
  padding: 14px 16px 16px;
  text-align: left;
}
.selected-video-info h3 {
  margin: 0;
  color: var(--text1);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.45;
}
.selected-video-info p {
  margin: 5px 0 0;
  color: var(--text3);
  font-size: 11.5px;
}
.video-carousel {
  display: flex;
  gap: 10px;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2px 2px 10px;
  scroll-snap-type: x proximity;
  overscroll-behavior-inline: contain;
}
.video-carousel::-webkit-scrollbar { height: 5px; }
.video-carousel::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: var(--primary-border);
}
.video-select-card {
  flex: 0 0 clamp(170px, 38%, 225px);
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--cream);
  color: inherit;
  text-align: left;
  cursor: pointer;
  scroll-snap-align: start;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}
.video-select-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary-border);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.07);
}
.video-select-card.active {
  border-color: var(--primary);
  background: var(--primary-bg);
  box-shadow: inset 0 0 0 1px rgba(255, 106, 0, 0.12);
}
.carousel-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--cream-soft);
}
.carousel-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}
.video-select-card:hover .carousel-thumbnail img { transform: scale(1.04); }
.play-badge {
  position: absolute;
  left: 8px;
  bottom: 8px;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.78);
  color: #fff;
  font-size: 10px;
}
.video-select-card.active .play-badge { background: var(--primary); }
.carousel-video-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 8px 10px 10px;
}
.carousel-video-info strong {
  display: -webkit-box;
  overflow: hidden;
  color: var(--text1);
  font-size: 11.5px;
  font-weight: 750;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.carousel-video-info small {
  overflow: hidden;
  color: var(--text3);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .video-select-card { flex-basis: min(190px, 74%); }
  .selected-video-info { padding: 12px 13px 14px; }
}

.feed-state-box {
  flex: 1;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
.no-data-text { max-width: 360px; margin: 0; color: var(--text3); font-size: 13px; line-height: 1.6; text-align: center; }
.retry-btn { margin-top: 14px; padding: 9px 15px; border: 1px solid var(--primary-border); border-radius: 999px; background: var(--primary-bg); color: var(--primary); font-size: 12px; font-weight: 800; cursor: pointer; }
.retry-btn:hover { background: rgba(255, 106, 0, 0.16); }
.loading-spinner {
  width: 24px; height: 24px; border: 3px solid #e5e7eb; border-top: 3px solid #ef4444;
  border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
