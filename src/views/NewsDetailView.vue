<template>
  <div class="detail-container">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>실시간 AI 시장 영향 및 멀티미디어 인프라 분석 중...</p>
    </div>

    <div v-else-if="news" class="detail-scroll-area">
      
      <header class="detail-header">
        <div class="detail-meta-row">
          <span class="sentiment-tag" :class="sentimentClass">
            {{ sentimentLabel }} (영향도: {{ analysis?.impact_score || '0.0' }}점)
          </span>
          <span class="meta-divider">•</span>
          <span class="publisher-txt">{{ news.publisher }}</span>
          <span class="meta-divider">•</span>
          <span class="time-txt">실시간 AI 브리핑</span>
        </div>

        <h1 class="detail-title">{{ news.title }}</h1>

        <div class="action-bar-row">
          <span class="author-txt" v-if="news.author">{{ news.author }}</span>
          
          <button 
            v-if="targetCompanyName" 
            class="watchlist-toggle-btn"
            :class="{ 'is-active': isWatched(targetCompanyName) }"
            @click="toggleWatchlist(targetCompanyName)"
          >
            <svg viewBox="0 0 24 24" class="star-icon">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
            {{ isWatched(targetCompanyName) ? '관심 해제' : '관심 종목 등록' }}
          </button>
        </div>
      </header>

      <hr class="section-divider" />

      <div class="dashboard-upper-grid">
        
        <div class="upper-left-content">
          <article class="detail-article-body">
            <h2 class="section-sub-title">📝 AI 알기 쉬운 재구성 브리핑</h2>
            <p class="article-text-p rewritten-box">
              {{ analysis?.rewritten_content || news.content || news.description }}
            </p>
          </article>

          <section class="ai-highlight-section" v-if="analysis?.highlight && analysis.highlight.length > 0">
            <h2 class="section-sub-title">🎯 AI 추천 뉴스 핵심 팩트 문장</h2>
            <div class="highlight-list">
              <div v-for="(hl, idx) in analysis.highlight" :key="idx" class="highlight-item-box">
                <p class="hl-sentence">" {{ hl.sentence }} "</p>
                <p class="hl-reason">📌 중요 근거: {{ hl.reason }}</p>
              </div>
            </div>
          </section>

          <section class="ai-terms-section" v-if="analysis?.difficult_terms && analysis.difficult_terms.length > 0">
            <h2 class="section-sub-title">📚 이번 기사 속 초보 투자 용어 풀이</h2>
            <div class="terms-pill-grid">
              <div v-for="(tm, idx) in analysis.difficult_terms" :key="idx" class="term-detail-card">
                <span class="term-badge-name">{{ tm.term }}</span>
                <p class="term-explanation-txt">{{ tm.explanation }}</p>
              </div>
            </div>
          </section>

          <section class="ai-checkpoint-section" v-if="analysis?.check_points && analysis.check_points.length > 0">
            <h2 class="section-sub-title">⚠️ 투자자가 추가로 확인해야 할 체크포인트</h2>
            <ul class="checkpoint-list">
              <li v-for="(cp, idx) in analysis.check_points" :key="idx">
                {{ cp }}
              </li>
            </ul>
          </section>
        </div>

        <div class="upper-right-widgets">
          <div class="widget-tabs-bar">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              class="tab-btn"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="widget-content-body">
            <div v-if="activeTab === 'youtube'" class="tab-pane-view youtube-pane">
              <div class="pane-title-info">
                <h4>🎬 MEDIA ANALYSIS</h4>
                <p v-if="targetCompanyName"><span>{{ targetCompanyName }}</span> 실시간 유튜브 미디어 인사이트</p>
                <p v-else>전체 증시 마켓 동향 브리핑</p>
              </div>
              <div class="pane-component-scroller">
                <NewsYoutubeFeed :company-name="targetCompanyName || '주식 시장'" />
              </div>
            </div>

            <div v-if="activeTab === 'map'" class="tab-pane-view">
              <div class="pane-title-info">
                <h4>📍 CORPORATE MAP</h4>
                <p v-if="targetCompanyName"><span>{{ targetCompanyName }}</span> 기업 본사 지리적 위치 파악</p>
              </div>
              <NewsKakaoMap :company-name="targetCompanyName || '한국거래소'" />
            </div>

            <div v-if="activeTab === 'community'" class="tab-pane-view">
              <div class="pane-title-info">
                <h4>💬 DEBATE FORUM</h4>
                <p>기사 및 AI 분석 결과 피드에 대한 주주 실시간 토론 공간</p>
              </div>
              <div class="community-chat-container">
                <div class="chat-scroller">
                  <div class="msg received">
                    <span class="chat-user">익명_거상</span>
                    <p class="msg-txt">이번 AI 분석 스코어 점수대 높게 나왔는데, 장기 모멘텀 유효할까요?</p>
                    <span class="chat-time">오후 4:21</span>
                  </div>
                  <div class="msg sent">
                    <span class="chat-user">나 (주주)</span>
                    <p class="msg-txt">체크포인트 요인들 보면서 분할로 대응하는 게 안전해 보입니다.</p>
                    <span class="chat-time">오후 4:24</span>
                  </div>
                </div>
                <div class="chat-footer-input-row">
                  <input type="text" placeholder="성숙한 투자 견해를 공유해 주세요..." class="chat-input" />
                  <button class="chat-send-btn">전송</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div> <section class="dashboard-lower-analysis" v-if="analysis">
        <h2 class="lower-section-title">✨ AI 인텔리전스 투자 판단 종합 보고서</h2>
        
        <div class="ai-analysis-grid">
          <div class="analysis-opinion-card positive-side">
            <div class="opinion-card-header">
              <span class="opinion-icon">🚀</span>
              <h3>호재 모멘텀 및 핵심 강점</h3>
            </div>
            <div class="opinion-content-body">
              <p class="opinion-reason-summary"><strong>투자 심리 방향성:</strong> {{ analysis.sentiment_reason }}</p>
              <div class="opinion-sub-card">
                <span class="opinion-label">📊 분석 스코어 반영 가치</span>
                <p class="opinion-desc">본 뉴스 흐름은 <strong>시장 파급력 {{ analysis.impact_score }}점</strong> 수준에 해당하는 긍정적 지표를 확보하고 있으며, 핵심 공급망 및 기업 가치 향상 주도 요인으로 작동할 가능성이 높습니다.</p>
              </div>
            </div>
          </div>

          <div class="analysis-opinion-card negative-side">
            <div class="opinion-card-header">
              <span class="opinion-icon">⚠️</span>
              <h3>하방 리스크 및 경고 요인</h3>
            </div>
            <div class="opinion-content-body">
              <p class="opinion-reason-summary"><strong>리스크 추적 판단근거:</strong> {{ analysis.impact_reason }}</p>
              <div class="opinion-sub-card">
                <span class="opinion-label">📉 변동성 방어선 및 한계점</span>
                <p class="opinion-desc">투자자는 상단에 요약된 리스크 체크포인트 지표와 거시적 하방 압력을 동시에 검토해야 하며, 단기 재무 부담 요인이 수반될 수 있으므로 추세 전환 확인 후 진입이 권장됩니다.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="ai-summary-footer-bar">
          <p>💡 <strong>AI 종합 가이드 마인드:</strong> 종합 점수 스펙과 호악재 밸런스를 고려했을 때, 연동된 <strong>{{ targetCompanyName || '관심 기업' }}</strong>의 수급 다변화를 유심히 트래킹하되 분할 매수 관점의 리스크 헷징 레이아웃을 추천합니다.</p>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from "vue";
import { useRoute } from "vue-router";
import { fetchNewsDetail } from "../services/api";

import NewsYoutubeFeed from "../components/news/NewsYoutubeFeed.vue";
import NewsKakaoMap from "../components/news/NewsKakaoMap.vue";

const route = useRoute();
const news = ref(null);
const isLoading = ref(false);

const toggleWatchlist = inject("toggleWatchlist");
const isWatched = inject("isWatched");

const activeTab = ref("youtube");
const tabs = [
  { id: "youtube", label: "📺 관련 유튜브" },
  { id: "map", label: "📍 카카오맵" },
  { id: "community", label: "💬 실시간 토론" }
];

async function loadDetail() {
  if (!route.params.id) return;
  isLoading.value = true;
  try {
    const { data } = await fetchNewsDetail(route.params.id);
    news.value = data;
    console.log("🔍 [디테일 데이터 디버깅 로거]:", data);
  } catch (e) {
    console.error("데이터 로드 실패", e);
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadDetail);
watch(() => route.params.id, loadDetail);

const analysis = computed(() => news.value?.ai_analysis);

const sentimentLabel = computed(() => {
  const s = analysis.value?.sentiment?.toLowerCase();
  return s === 'positive' ? '호재' : s === 'negative' ? '악재' : '중립';
});
const sentimentClass = computed(() => {
  const s = analysis.value?.sentiment?.toLowerCase();
  return s === 'positive' ? 'up' : s === 'negative' ? 'down' : 'neutral';
});

// 💡 3중 방어막 스캔: 백엔드가 어떤 형태(뱀직구, 카멜)로 키를 던져주든 무조건 회사명을 찾아내는 인텔리전스 파서
const targetCompanyName = computed(() => {
  if (!news.value) return "";
  
  // 1순위: 장고 수순 related_stocks 리스트 확인
  const stocks = news.value.related_stocks || news.value.news_stocks;
  if (stocks && stocks.length > 0) {
    const item = stocks[0];
    return item.stock_name || item.stockName || item.name || "";
  }
  
  // 2순위: 혹시 기사 제목에 회사명이 걸려있을 경우 자동 추출 백업선 가동
  const title = news.value.title || "";
  if (title.includes("삼성전자") || title.includes("삼전")) return "삼성전자";
  if (title.includes("국민은행") || title.includes("KB국민")) return "KB국민은행";
  if (title.includes("현대차")) return "현대자동차";
  if (title.includes("홈플러스")) return "홈플러스";
  
  return "";
});
</script>

<style scoped>
/* [화이트&오렌지 대시보드 스크롤 CSS 스타일 전수 완전 보존] */
.detail-container { width: 100%; height: 100%; background: #ffffff; display: flex; flex-direction: column; overflow: hidden; }
.loading-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text3, #64748b); gap: 12px; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--border, #e2e8f0); border-top-color: var(--primary, #ff5a1f); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.detail-scroll-area { flex: 1; overflow-y: auto; padding: 24px; text-align: left; }
.detail-header { display: flex; flex-direction: column; gap: 12px; }
.detail-meta-row { display: flex; align-items: center; font-size: 13px; color: var(--text3, #64748b); }
.meta-divider { margin: 0 8px; color: var(--border, #e2e8f0); }
.sentiment-tag { padding: 4px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 700; }
.sentiment-tag.up { background: #e8f5e9; color: #2e7d32; }
.sentiment-tag.down { background: #ffebee; color: #c62828; }
.sentiment-tag.neutral { background: #f1f5f9; color: #475569; }
.detail-title { font-size: 22px; font-weight: 800; color: var(--text1, #1e293b); line-height: 1.4; }
.action-bar-row { display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; color: var(--text2, #475569); margin-top: 4px; }
.watchlist-toggle-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border, #e2e8f0); background: #ffffff; font-size: 12.5px; font-weight: 600; color: var(--text2, #475569); cursor: pointer; transition: all 0.15s ease; }
.watchlist-toggle-btn:hover { border-color: var(--primary-border, #ffe2d5); color: var(--primary, #ff5a1f); background: var(--primary-bg, #fff5f1); }
.watchlist-toggle-btn.is-active { background: var(--primary, #ff5a1f); color: #ffffff; border-color: var(--primary, #ff5a1f); }
.star-icon { width: 14px; height: 14px; fill: currentColor; }
.section-divider { border: none; border-top: 1px solid var(--border, #e2e8f0); margin: 16px 0 20px; }
.dashboard-upper-grid { display: flex; gap: 32px; align-items: flex-start; }
.upper-left-content { flex: 1.1; min-width: 420px; }
.upper-right-widgets { flex: 0.9; min-width: 380px; position: sticky; top: 0; }
.section-sub-title { font-size: 15px; font-weight: 700; color: var(--text1, #1e293b); margin: 0 0 12px 0; border-left: 3px solid var(--primary, #ff5a1f); padding-left: 8px; }
.upper-left-content section, .upper-left-content article { margin-bottom: 24px; }
.rewritten-box { font-size: 14.5px; color: #334155; line-height: 1.75; background: #fffdfb; padding: 16px; border-radius: 8px; border: 1px dashed #ffdcd0; margin: 0; }
.highlight-list { display: flex; flex-direction: column; gap: 10px; }
.highlight-item-box { background: #fffdeb; border-left: 4px solid #f59e0b; padding: 12px 14px; border-radius: 0 8px 8px 0; }
.hl-sentence { font-size: 14px; font-weight: 700; color: #b45309; }
.hl-reason { font-size: 12.5px; color: var(--text2, #475569); margin-top: 4px; }
.terms-pill-grid { display: flex; flex-direction: column; gap: 8px; }
.term-detail-card { background: #f1f5f9; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
.term-badge-name { font-size: 12px; font-weight: 700; background: #475569; color: #ffffff; padding: 2px 8px; border-radius: 4px; display: inline-block; }
.term-explanation-txt { font-size: 13px; color: #334155; margin-top: 6px; line-height: 1.5; }
.checkpoint-list { padding-left: 18px; color: #475569; font-size: 13.5px; line-height: 1.7; margin: 0; }
.checkpoint-list li { margin-bottom: 6px; list-style-type: square; }
.widget-tabs-bar { display: flex; background: var(--bg2, #f8fafc); border: 1px solid var(--border, #e2e8f0); padding: 4px; border-radius: 8px; gap: 4px; }
.tab-btn { flex: 1; border: none; background: transparent; padding: 10px 0; font-size: 13px; font-weight: 600; color: var(--text2, #475569); border-radius: 6px; cursor: pointer; transition: all 0.15s ease; }
.tab-btn:hover { color: var(--primary, #ff5a1f); }
.tab-btn.active { background: #ffffff; color: var(--primary, #ff5a1f); font-weight: 700; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04); }
.widget-content-body { background: #ffffff; border: 1px solid var(--border, #e2e8f0); border-radius: 12px; padding: 20px; min-height: 420px; display: flex; flex-direction: column; margin-top: 14px; overflow: hidden; }
.pane-title-info { margin-bottom: 16px; }
.pane-title-info h4 { font-size: 11px; font-weight: 800; color: var(--text3, #94a3b8); letter-spacing: 0.04em; margin: 0 0 2px 0; }
.pane-title-info p { font-size: 12px; color: var(--text2, #475569); margin: 0; }
.pane-title-info p span { color: var(--primary, #ff5a1f); font-weight: 700; }
.tab-pane-view { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.pane-component-scroller { flex: 1; overflow-y: auto; overflow-x: hidden; padding-right: 2px; }
.pane-component-scroller::-webkit-scrollbar { width: 4px; }
.pane-component-scroller::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.empty-pane-box { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 12.5px; color: var(--text3, #64748b); border: 1px dashed var(--border, #e2e8f0); border-radius: 8px; }
.community-chat-container { flex: 1; display: flex; flex-direction: column; justify-content: space-between; min-height: 300px; }
.chat-scroller { display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; max-height: 260px; overflow-y: auto; }
.msg { display: flex; flex-direction: column; max-width: 85%; padding: 10px; border-radius: 8px; font-size: 12.5px; line-height: 1.45; }
.msg.received { background: var(--bg2, #f8fafc); border: 1px solid var(--border, #e2e8f0); align-self: flex-start; border-top-left-radius: 0; }
.msg.sent { background: var(--primary-bg, #fff5f1); border: 1px solid var(--primary-border, #ffe2d5); align-self: flex-end; border-top-right-radius: 0; }
.chat-user { font-size: 11px; font-weight: 700; color: var(--text3, #64748b); margin-bottom: 2px; }
.msg.sent .chat-user { color: var(--primary, #ff5a1f); }
.msg-txt { margin: 0; color: var(--text1, #1e293b); }
.chat-time { font-size: 10px; color: var(--text3, #94a3b8); align-self: flex-end; margin-top: 4px; }
.chat-footer-input-row { display: flex; gap: 8px; border-top: 1px solid var(--border, #e2e8f0); padding-top: 12px; }
.chat-input { flex: 1; background: var(--bg2, #f8fafc); border: 1px solid var(--border, #e2e8f0); border-radius: 6px; padding: 8px 12px; font-size: 12.5px; outline: none; }
.chat-input:focus { border-color: var(--primary, #ff5a1f); background: #ffffff; }
.chat-send-btn { background: var(--primary, #ff5a1f); color: #ffffff; border: none; padding: 0 14px; font-size: 12.5px; font-weight: 700; border-radius: 6px; cursor: pointer; }
.dashboard-lower-analysis { margin-top: 32px; padding-top: 24px; border-top: 1px dashed var(--border, #e2e8f0); }
.lower-section-title { font-size: 17px; font-weight: 800; color: var(--text1, #1e293b); margin-bottom: 20px; border-left: 4px solid var(--primary, #ff5a1f); padding-left: 10px; }
.ai-analysis-grid { display: flex; gap: 20px; }
@media (max-width: 768px) { .ai-analysis-grid { flex-direction: column; } }
.analysis-opinion-card { flex: 1; background-color: var(--bg2, #f8fafc); border: 1px solid var(--border, #e2e8f0); border-radius: 12px; padding: 20px; border-top: 4px solid #64748b; }
.analysis-opinion-card.positive-side { border-top-color: #10b981; }
.analysis-opinion-card.negative-side { border-top-color: var(--primary, #ff5a1f); }
.opinion-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.opinion-card-header h3 { font-size: 15.5px; font-weight: 700; color: var(--text1, #1e293b); margin: 0; }
.opinion-icon { font-size: 18px; }
.opinion-content-body { display: flex; flex-direction: column; gap: 12px; }
.opinion-reason-summary { font-size: 13.5px; color: var(--text1, #1e293b); line-height: 1.5; background: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid var(--border, #e2e8f0); }
.opinion-sub-card { background: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid var(--border, #e2e8f0); }
.opinion-label { font-size: 11px; font-weight: 700; color: var(--text3, #94a3b8); display: block; margin-bottom: 4px; }
.opinion-desc { font-size: 13px; color: var(--text2, #475569); line-height: 1.5; margin: 0; }
.ai-summary-footer-bar { margin-top: 20px; background-color: var(--bg2, #f8fafc); border: 1px solid var(--border, #e2e8f0); border-radius: 8px; padding: 16px; border-left: 4px solid var(--primary, #ff5a1f); font-size: 13.5px; line-height: 1.6; color: var(--text1, #1e293b); }
</style>