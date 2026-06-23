<template>
  <div class="youtube-feed-container">
    <div class="feed-header">
      <div class="header-title">
        <span class="youtube-icon">🔴</span>
        <h3>관련 기업 YouTube 분석 영상</h3>
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
      <p class="no-data-text">관련 영상을 찾지 못했습니다.</p>
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

async function fetchYoutubeVideos(query) {
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/search`;
  try {
    const response = await axios.get(url, {
      params: { key: API_KEY, q: query, part: "snippet", type: "video", maxResults: 3, regionCode: "KR", safeSearch: "moderate" }
    });
    return response.data.items || [];
  } catch (err) { return []; }
}

async function loadComponentData() {
  if (!props.companyName || props.companyName === "해당 기업") { videos.value = []; return; }
  isLoading.value = true;
  
  let result = await fetchYoutubeVideos(`${props.companyName} 주식 분석`);
  if (result.length === 0) result = await fetchYoutubeVideos(`${props.companyName} 전망`);
  if (result.length === 0) result = await fetchYoutubeVideos(`${props.companyName} 뉴스`);
  
  videos.value = result;
  isLoading.value = false;
}

watch(() => props.companyName, loadComponentData);
onMounted(loadComponentData);
</script>

<style scoped>
.youtube-feed-container { display: flex; flex-direction: column; height: 100%; }
.feed-header { margin-bottom: 20px; }
.header-title { display: flex; align-items: center; gap: 8px; }
.header-title h3 { font-size: 15px; font-weight: 800; color: #1e293b; margin: 0; }
.header-caption { font-size: 12px; color: #64748b; margin-top: 6px; }

.video-grid { display: flex; flex-direction: column; gap: 20px; }

.video-card {
  background: #ffffff; border-radius: 12px; overflow: hidden;
  border: 1px solid #e2e8f0; transition: all 0.3s ease;
}
.video-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }

/* 고화질 썸네일 영역 */
.video-thumbnail-wrapper { position: relative; width: 100%; padding-top: 56.25%; background: #f1f5f9; cursor: pointer; }
.thumbnail-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
.play-icon { 
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
  font-size: 40px; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.5); opacity: 0.9;
}

.video-info { padding: 14px; }
.video-title {
  font-size: 13.5px; font-weight: 700; color: #0f172a; line-height: 1.4; margin: 0 0 8px 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.channel-title { font-size: 12px; color: #94a3b8; }

/* 반응형: 넓은 화면 3열 */
@media (min-width: 1200px) {
  .video-grid { flex-direction: row !important; flex-wrap: wrap; }
  .video-card { flex: 1 1 calc(33.33% - 14px); max-width: calc(33.33% - 14px); }
}

/* 로딩 스피너 */
.feed-state-box { display: flex; flex-direction: column; align-items: center; padding: 40px; }
.loading-spinner {
  width: 24px; height: 24px; border: 3px solid #f1f5f9; border-top: 3px solid #ef4444;
  border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>