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

    <div v-else class="video-grid">
      <div v-for="video in videos" :key="video.id.videoId" class="video-card">
        <div class="video-thumbnail-wrapper">
          <a :href="`https://www.youtube.com/watch?v=${video.id.videoId}`" target="_blank">
            <img 
              :src="`https://img.youtube.com/vi/${video.id.videoId}/maxresdefault.jpg`" 
              :alt="video.snippet.title" 
              class="thumbnail-img"
            />
            <div class="play-icon">▶</div>
          </a>
        </div>
        <div class="video-info">
          <h4 class="video-title" v-html="video.snippet.title"></h4>
          <p class="channel-title">{{ video.snippet.channelTitle }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import axios from "axios";

const props = defineProps({
  companyName: { type: String, required: true, default: "해당 기업" }
});

const videos = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");

async function fetchYoutubeVideos(query) {
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/search`;

  if (!API_KEY) {
    throw new Error("YOUTUBE_API_KEY_MISSING");
  }

  try {
    const response = await axios.get(url, {
      params: { key: API_KEY, q: query, part: "snippet", type: "video", maxResults: 3, regionCode: "KR", safeSearch: "moderate" }
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
  if (!props.companyName || props.companyName === "해당 기업") { videos.value = []; return; }
  isLoading.value = true;
  errorMessage.value = "";

  try {
    let result = await fetchYoutubeVideos(`${props.companyName} 주식 분석`);
    if (result.length === 0) result = await fetchYoutubeVideos(`${props.companyName} 전망`);
    if (result.length === 0) result = await fetchYoutubeVideos(`${props.companyName} 뉴스`);

    videos.value = result;
  } catch (error) {
    videos.value = [];

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

watch(() => props.companyName, loadComponentData);
onMounted(loadComponentData);
</script>

<style scoped>
.youtube-feed-container { display: flex; flex-direction: column; height: 100%; }
.feed-header { margin-bottom: 20px; }
.header-title { display: flex; align-items: center; gap: 8px; }
.header-title h3 { font-size: 15px; font-weight: 800; color: var(--text1); margin: 0; }
.header-caption { font-size: 12px; color: var(--text3); margin-top: 6px; }

.video-grid { display: flex; flex-direction: column; gap: 20px; }

.video-card {
  background: var(--cream); border-radius: 14px; overflow: hidden;
  border: 1px solid var(--border); transition: all 0.3s ease;
}
.video-card:hover { transform: translateY(-4px); border-color: #c9d3dd; box-shadow: 0 16px 30px rgba(15,23,42,0.08); }

.video-thumbnail-wrapper { position: relative; width: 100%; padding-top: 56.25%; background: var(--cream-soft); cursor: pointer; }
.thumbnail-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
.play-icon { 
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
  font-size: 40px; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.5); opacity: 0.9;
}

.video-info { padding: 14px; text-align: left; background: var(--cream); }
.video-title {
  font-size: 13.5px; font-weight: 800; color: var(--text1); line-height: 1.4; margin: 0 0 8px 0;
  display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.channel-title { font-size: 12px; color: var(--text3); }

@media (min-width: 1400px) {
  .video-grid { flex-direction: row !important; flex-wrap: wrap; }
  .video-card { flex: 1 1 calc(33.33% - 14px); max-width: calc(33.33% - 14px); }
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
