<template>
  <div class="detail-container">
    <div class="top-bar">
      <button class="back-btn" @click="router.push('/')">
        <svg viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6" /></svg>
        목록으로
      </button>
      
      <a v-if="news" class="orig-link-btn" :href="news.url" target="_blank">
        원문 기사 보러가기
        <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
      </a>
    </div>

    <div v-if="isLoading" class="empty-state">분석 데이터를 불러오는 중입니다...</div>
    <div v-else-if="!news || !analysis" class="empty-state">분석 정보를 표시할 수 없습니다.</div>

    <template v-else>
      <header class="dashboard-header">
        <div class="meta-info">
          <span class="publisher">{{ news.publisher }}</span>
          <span class="author" v-if="news.author">· {{ news.author }}</span>
        </div>
        <h1 class="main-title">{{ news.title }}</h1>
      </header>

      <div class="dashboard-grid">
        
        <div class="grid-left">
          
          <section class="board-card premium">
            <div class="card-label">
              <svg viewBox="0 0 24 24"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" /></svg>
              AI 정제 브리핑
            </div>
            <p class="rewritten-text">{{ analysis.rewritten_content }}</p>
          </section>

          <section class="board-card">
            <div class="card-label">시장 영향도 및 종합 판단</div>
            
            <div class="analysis-status-block">
              <div class="sentiment-zone">
                <span class="sentiment-badge" :class="sentimentClass">{{ sentimentLabel }}</span>
                <span class="sentiment-text">시장 <b :class="sentimentClass">{{ sentimentLabel }}</b> 시그널</span>
              </div>

              <div class="score-zone">
                <div class="score-header">
                  <span class="score-title">AI 임팩트 점수</span>
                  <span class="score-val"><strong>{{ analysis.impact_score }}</strong> / 10.0</span>
                </div>
                <div class="score-gauge-container">
                  <div class="score-bar" :style="{ width: (analysis.impact_score * 10) + '%' }"></div>
                </div>
              </div>
            </div>

            <div class="score-matrix">
              <div class="matrix-item" :class="{ active: analysis.impact_score <= 2 }"><b>0~2점</b> 영향 거의 없음</div>
              <div class="matrix-item" :class="{ active: analysis.impact_score > 2 && analysis.impact_score <= 4 }"><b>3~4점</b> 제한적 영향</div>
              <div class="matrix-item" :class="{ active: analysis.impact_score > 4 && analysis.impact_score <= 6 }"><b>5~6점</b> 중간 수준 영향</div>
              <div class="matrix-item" :class="{ active: analysis.impact_score > 6 && analysis.impact_score <= 8 }"><b>7~8점</b> 뚜렷한 영향</div>
              <div class="matrix-item" :class="{ active: analysis.impact_score > 8 }"><b>9~10점</b> 매우 강한 영향</div>
            </div>
          </section>

          <section class="board-card">
            <div class="card-label">AI 분석 인사이트 및 근거</div>
            <p class="insight-text">{{ analysis.impact_reason }}</p>
            <div class="analysis-time">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>
              AI 분석 시각: {{ formatDateTime(analysis.analyzed_at) }}
            </div>
          </section>

          <section v-if="analysis.check_points?.length" class="board-card">
            <div class="card-label">
              <svg viewBox="0 0 24 24"><polyline points="9,11 12,14 22,4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
              투자 체크포인트 리스트
            </div>
            <p class="card-caption">팩트를 체크하고 나만의 아이디어를 메모로 기록하세요.</p>
            
            <div class="check-memo-container">
              <div v-for="(point, i) in analysis.check_points" :key="i" class="check-item-group">
                <label class="check-label-row">
                  <input type="checkbox" v-model="userChecks[i]" class="custom-checkbox" />
                  <span class="point-text" :class="{ completed: userChecks[i] }">{{ point }}</span>
                </label>
                <textarea 
                  v-model="userMemos[i]" 
                  placeholder="여기에 확인 내용이나 투자 메모를 적으세요..." 
                  class="memo-input"
                  rows="1"
                  @input="autoResizeMemo($event)"
                ></textarea>
              </div>
            </div>
          </section>

          <section v-if="analysis.difficult_terms?.length" class="board-card">
            <div class="card-label">
              <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              기사 내부 핵심 용어 브리핑
            </div>
            
            <div class="term-pills-grid">
              <button 
                v-for="item in analysis.difficult_terms" 
                :key="item.term" 
                class="interactive-term-pill"
                :class="{ active: activeTerm?.term === item.term }"
                @click="selectTerm(item)"
              >
                {{ item.term }}
              </button>
            </div>

            <div class="term-explanation-panel">
              <div v-if="activeTerm" class="explanation-content">
                <span class="panel-title">💡 {{ activeTerm.term }} 해설</span>
                <p class="panel-desc">{{ activeTerm.explanation }}</p>
              </div>
              <div v-else class="explanation-placeholder">
                단어를 선택하면 AI 해설이 여기에 제공됩니다.
              </div>
            </div>
          </section>

        </div>

        <div class="grid-right">
          
          <div class="board-card placeholder-card">
            <div class="card-label outline-label">
              <span class="icon-yt">🔴</span> 관련 기업 YouTube 분석 영상
            </div>
            <div class="extend-box-dashed design-yt">
              <p>추후 백엔드 연동 시<br><strong>{{ news.publisher }}</strong> 관련 유튜브 브리핑 데이터가 파싱됩니다.</p>
            </div>
          </div>

          <div class="board-card placeholder-card">
            <div class="card-label outline-label">
              <span class="icon-map">📍</span> 기업 본사 위치 (Kakao Map)
            </div>
            <div class="extend-box-dashed design-map">
              <p>카카오맵 API 컴포넌트 장착 영역</p>
            </div>
          </div>

          <div class="board-card placeholder-card">
            <div class="card-label outline-label">
              <span class="icon-chat">💬</span> 주주 실시간 커뮤니티
            </div>
            <div class="extend-box-dashed design-chat">
              <p>익명 소통 및 토론 피드가 연동될 공간입니다.</p>
            </div>
          </div>

        </div>
      </div>

      <footer class="legal-disclaimer">
        아래 분석은 AI가 생성한 참고 자료예요. 투자 판단의 최종 책임은 본인에게 있어요.
      </footer>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { fetchNewsDetail } from "../services/api";

const router = useRouter();
const route = useRoute();

const news = ref(null);
const isLoading = ref(false);

const activeTerm = ref(null);
const userChecks = ref({});
const userMemos = ref({});

async function loadDetail() {
  isLoading.value = true;
  news.value = null;
  activeTerm.value = null;
  userChecks.value = {};
  userMemos.value = {};
  try {
    const { data } = await fetchNewsDetail(route.params.id);
    news.value = data;
    if (data?.ai_analysis?.difficult_terms?.length) {
      activeTerm.value = data.ai_analysis.difficult_terms[0];
    }
  } catch (e) {
    console.error("뉴스 상세 조회 실패", e);
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadDetail);
watch(() => route.params.id, loadDetail);

const analysis = computed(() => news.value?.ai_analysis);

function selectTerm(item) {
  activeTerm.value = activeTerm.value?.term === item.term ? null : item;
}

function autoResizeMemo(event) {
  const el = event.target;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

const sentimentLabel = computed(() => {
  const s = analysis.value?.sentiment?.toLowerCase();
  if (s === "positive") return "호재";
  if (s === "negative") return "악재";
  return "중립";
});

const sentimentClass = computed(() => {
  const s = analysis.value?.sentiment?.toLowerCase();
  if (s === "positive") return "up";
  if (s === "negative") return "down";
  return "neutral";
});

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
</script>

<style scoped>
.detail-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 32px;
  overflow-y: auto;
  background: var(--bg);
  height: 100%;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
}
.back-btn svg { width: 16px; height: 16px; stroke: currentColor; stroke-width: 2; fill: none; }

.orig-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text2);
  text-decoration: none;
  transition: all 0.2s ease;
}
.orig-link-btn:hover {
  background: var(--border);
  color: var(--text1);
}
.orig-link-btn svg { width: 13px; height: 13px; stroke: currentColor; stroke-width: 2; fill: none; }

.dashboard-header { margin-bottom: 24px; }
.meta-info { font-size: 12px; color: var(--text3); margin-bottom: 6px; }
.main-title { font-size: 20px; font-weight: 700; color: var(--text1); line-height: 1.4; }

/* 🍊 레이아웃: 좌측 데이터 / 우측 확장 컴포넌트 공간 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 24px;
  align-items: start;
}

.board-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}
.board-card.premium {
  background: #fdfcfa;
  border-color: var(--amber-border);
}

.card-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text1);
  margin-bottom: 12px;
}
.card-label svg { width: 14px; height: 14px; stroke: currentColor; stroke-width: 2; fill: none; }
.card-caption { font-size: 12px; color: var(--text3); margin-top: -6px; margin-bottom: 14px; }

.rewritten-text { font-size: 14px; line-height: 1.7; color: var(--text1); }
.insight-text { font-size: 13.5px; line-height: 1.65; color: var(--text2); }

.analysis-status-block {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 24px;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
}
.sentiment-zone { display: flex; flex-direction: column; gap: 4px; align-items: center; }
.sentiment-badge { padding: 6px 16px; border-radius: 30px; font-size: 14px; font-weight: 800; }
.sentiment-badge.up { background: var(--red-bg); color: var(--red); }
.sentiment-badge.down { background: var(--blue-bg); color: var(--blue); }
.sentiment-badge.neutral { background: var(--bg3); color: var(--text2); }
.sentiment-text { font-size: 11px; color: var(--text3); }

.score-zone { flex: 1; }
.score-header { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
.score-title { font-weight: 600; color: var(--text2); }
.score-val strong { font-size: 15px; color: #2563eb; }
.score-gauge-container { width: 100%; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
.score-bar { height: 100%; background: #2563eb !important; border-radius: 4px; }

.score-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 6px;
}
.matrix-item { font-size: 11px; color: var(--text3); padding: 6px; background: var(--bg2); border-radius: 4px; }
.matrix-item.active { background: #eff6ff; color: #1e40af; font-weight: 600; }

.analysis-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: var(--text3);
  margin-top: 14px;
}
.analysis-time svg { width: 12px; height: 12px; stroke: currentColor; fill: none; }

.check-memo-container { display: flex; flex-direction: column; gap: 14px; }
.check-item-group { display: flex; flex-direction: column; gap: 6px; }
.check-label-row { display: flex; align-items: flex-start; gap: 8px; cursor: pointer; }
.custom-checkbox { width: 15px; height: 15px; margin-top: 2px; cursor: pointer; }
.point-text { font-size: 13px; color: var(--text2); line-height: 1.5; }
.point-text.completed { text-decoration: line-through; color: var(--text3); }

.memo-input {
  width: 100%;
  border: 1px dashed var(--border);
  background: #fdfdfd;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: var(--text2);
  resize: none;
  outline: none;
}
.memo-input:focus { border-color: #2563eb; background: #ffffff; }

.term-pills-grid { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.interactive-term-pill {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg);
  font-size: 12px;
  font-weight: 500;
  color: var(--text2);
  cursor: pointer;
}
.interactive-term-pill:hover, .interactive-term-pill.active {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}
.term-explanation-panel { background: var(--bg2); border-radius: 8px; padding: 12px; min-height: 64px; }
.panel-title { font-size: 12.5px; font-weight: 700; color: #1e40af; margin-bottom: 4px; display: block; }
.panel-desc { font-size: 12px; line-height: 1.55; color: var(--text2); }
.explanation-placeholder { font-size: 12px; color: var(--text3); text-align: center; padding: 12px 0; }

/* 🔵 우측 미래 컴포넌트 예약 와이어프레임 박스 스타일 */
.placeholder-card {
  background: #fafafa;
  border: 1px dashed #cbd5e1;
}
.outline-label { color: #64748b; font-size: 13px; }
.extend-box-dashed {
  border: 1px dashed #e2e8f0;
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
}
.design-yt { height: 180px; }
.design-map { height: 220px; }
.design-chat { height: 260px; }

.legal-disclaimer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  font-size: 11.5px;
  color: #94a3b8;
  text-align: center;
}
</style>