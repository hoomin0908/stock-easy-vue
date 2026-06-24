<template>
  <main class="mypage-content">
    <section v-if="activeTab === 'favorites'" class="content-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Favorites</p>
          <h1>관심 목록</h1>
        </div>
      </div>

      <div class="content-grid">
        <section class="data-panel">
          <div class="panel-title-row">
            <h2>찜한 주식 종목</h2>
            <span>{{ interestStocks.length }}개</span>
          </div>
          <div v-if="isInterestsLoading" class="compact-state">관심 기업을 불러오는 중입니다...</div>
          <div v-else-if="interestStocks.length === 0" class="compact-state">등록한 관심 기업이 없습니다.</div>
          <div v-else class="stock-card-grid">
            <button
              v-for="interest in interestStocks"
              :key="interest.id"
              type="button"
              class="stock-card"
              @click="goToStockNews(interest)"
            >
              <strong>{{ interest.stock.stock_name }}</strong>
              <small>{{ interest.stock.stock_code }}</small>
              <span>관련 뉴스 보기</span>
            </button>
          </div>
        </section>

        <section class="data-panel">
          <div class="panel-title-row">
            <h2>저장한 용어</h2>
            <span>{{ savedTerms.length }}개</span>
          </div>
          <div v-if="isTermsLoading" class="compact-state">저장한 용어를 불러오는 중입니다...</div>
          <div v-else-if="savedTerms.length === 0" class="compact-state">저장한 용어가 없습니다.</div>
          <div v-else class="term-list">
            <article v-for="term in savedTerms" :key="term.id || term.term" class="term-row">
              <strong>{{ getTermName(term) }}</strong>
              <p>{{ getTermDescription(term) }}</p>
            </article>
          </div>
        </section>
      </div>
    </section>

    <section v-else-if="activeTab === 'activity'" class="content-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Activity</p>
          <h1>최근 본 뉴스</h1>
        </div>
      </div>

      <section class="data-panel">
        <div v-if="recentNews.length === 0" class="compact-state">최근 본 뉴스가 없습니다.</div>
        <div v-else class="recent-news-list">
          <router-link
            v-for="news in recentNews"
            :key="news.id"
            class="recent-news-row"
            :to="`/news/${news.id}`"
          >
            <div>
              <strong>{{ news.title }}</strong>
              <small>{{ news.publisher || "언론사 정보 없음" }} · {{ formatViewedAt(news.viewedAt) }}</small>
            </div>
            <span>보기</span>
          </router-link>
        </div>
      </section>
    </section>

    <section v-else class="content-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Settings</p>
          <h1>정보 수정</h1>
        </div>
      </div>

      <div class="content-grid">
        <section class="data-panel">
          <h2>계정 설정</h2>
          <label class="field-label">
            닉네임
            <input v-model="profileForm.nickname" type="text" />
          </label>
          <label class="field-label">
            이메일
            <input :value="userEmail" type="email" disabled />
          </label>
          <button type="button" class="primary-btn">변경사항 저장</button>
        </section>

        <section class="data-panel">
          <h2>알림 및 화면 설정</h2>
          <label class="toggle-row">
            <span>관심 종목 주가 변동 알림</span>
            <input v-model="settings.priceAlert" type="checkbox" />
          </label>
          <label class="toggle-row">
            <span>마케팅 정보 수신</span>
            <input v-model="settings.marketing" type="checkbox" />
          </label>
          <label class="toggle-row">
            <span>다크 모드</span>
            <input :checked="themeMode === 'dark'" type="checkbox" @change="toggleTheme" />
          </label>
        </section>

        <section class="danger-panel">
          <div>
            <h2>회원 탈퇴</h2>
            <p>계정과 저장 데이터 삭제가 필요한 경우에만 진행해 주세요.</p>
          </div>
          <button type="button">탈퇴하기</button>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "../services/auth";
import { fetchInterestStocks, fetchSavedTerms } from "../services/api";

const RECENT_NEWS_KEY = "stockeasy-recent-news";
const SAVED_TERMS_KEY = "stockeasy-saved-terms";

const route = useRoute();
const router = useRouter();
const { currentUser } = useAuth();
const themeMode = inject("themeMode", ref("light"));
const toggleTheme = inject("toggleTheme", () => {});

const interestStocks = ref([]);
const savedTerms = ref([]);
const recentNews = ref([]);
const isInterestsLoading = ref(false);
const isTermsLoading = ref(false);

const profileForm = reactive({ nickname: "" });
const settings = reactive({
  priceAlert: true,
  marketing: false,
});

const activeTab = computed(() => {
  const tab = route.query.tab;
  return typeof tab === "string" && ["favorites", "activity", "settings"].includes(tab)
    ? tab
    : "favorites";
});

const userEmail = computed(() => currentUser.value?.email || "이메일 정보 없음");

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.terms)) return data.terms;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getTermName(item) {
  return item?.term?.name || item?.term || item?.title || item?.name || "이름 없는 용어";
}

function getTermDescription(item) {
  return (
    item?.term?.description ||
    item?.description ||
    item?.meaning ||
    "설명 정보가 없습니다."
  );
}

async function loadInterestStocks() {
  isInterestsLoading.value = true;

  try {
    const { data } = await fetchInterestStocks();
    interestStocks.value = normalizeList(data);
  } catch (error) {
    console.error("마이페이지 관심 기업 조회 실패", error);
    interestStocks.value = [];
  } finally {
    isInterestsLoading.value = false;
  }
}

async function loadSavedTerms() {
  isTermsLoading.value = true;

  try {
    const { data } = await fetchSavedTerms();
    savedTerms.value = normalizeList(data);
  } catch (error) {
    console.error("저장한 용어 조회 실패", error);
    savedTerms.value = readLocalList(SAVED_TERMS_KEY);
  } finally {
    isTermsLoading.value = false;
  }
}

function loadRecentNews() {
  recentNews.value = readLocalList(RECENT_NEWS_KEY).slice(0, 10);
}

function readLocalList(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatViewedAt(value) {
  if (!value) return "최근";
  const diffMin = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${Math.floor(diffHour / 24)}일 전`;
}

function goToStockNews(interest) {
  router.push({
    path: "/news",
    query: {
      stockId: interest.stock.id,
      stockName: interest.stock.stock_name,
    },
  });
}

watch(
  currentUser,
  (user) => {
    profileForm.nickname = user?.nickname || "";
  },
  { immediate: true }
);

onMounted(() => {
  loadInterestStocks();
  loadSavedTerms();
  loadRecentNews();
});
</script>

<style scoped>
.mypage-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  background: var(--bg2);
  padding: 24px;
}
.content-section {
  max-width: 1120px;
  margin: 0 auto;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.eyebrow {
  color: var(--primary);
  font-size: 11px;
  font-weight: 850;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.section-heading h1 {
  color: var(--text1);
  font-size: 24px;
  line-height: 1.25;
}
.content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.data-panel {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--cream);
  padding: 18px;
}
.data-panel h2,
.panel-title-row h2,
.danger-panel h2 {
  color: var(--text1);
  font-size: 15px;
  font-weight: 850;
}
.panel-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}
.panel-title-row span {
  color: var(--primary);
  font-size: 12px;
  font-weight: 850;
}
.compact-state {
  border-radius: var(--radius);
  background: var(--bg2);
  color: var(--text3);
  padding: 24px 12px;
  text-align: center;
  font-size: 12px;
}
.stock-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.stock-card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg2);
  padding: 13px;
  text-align: left;
  cursor: pointer;
}
.stock-card:hover {
  border-color: var(--primary-border);
  background: var(--primary-bg);
}
.stock-card strong,
.stock-card small,
.stock-card span {
  display: block;
}
.stock-card strong {
  color: var(--text1);
  font-size: 14px;
  margin-bottom: 4px;
}
.stock-card small {
  color: var(--text3);
  font-size: 11px;
  margin-bottom: 11px;
}
.stock-card span {
  color: var(--primary);
  font-size: 11.5px;
  font-weight: 800;
}
.term-list,
.recent-news-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.term-row,
.recent-news-row {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg2);
  padding: 12px;
}
.term-row strong,
.recent-news-row strong {
  display: block;
  color: var(--text1);
  font-size: 13px;
  line-height: 1.45;
}
.term-row p,
.recent-news-row small {
  display: block;
  color: var(--text3);
  font-size: 11.5px;
  line-height: 1.5;
  margin-top: 5px;
}
.recent-news-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
.recent-news-row span {
  flex-shrink: 0;
  color: var(--primary);
  font-size: 12px;
  font-weight: 850;
}
.field-label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: var(--text2);
  font-size: 12px;
  font-weight: 750;
  margin-top: 14px;
}
.field-label input {
  height: 38px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg2);
  color: var(--text1);
  padding: 0 10px;
  outline: none;
}
.field-label input:focus {
  border-color: var(--primary-border);
  box-shadow: 0 0 0 3px rgba(255, 106, 0, 0.08);
}
.primary-btn {
  margin-top: 14px;
  border: none;
  border-radius: var(--radius);
  background: var(--primary);
  color: #fff;
  padding: 10px 13px;
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
}
.toggle-row {
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border);
  color: var(--text2);
  font-size: 12.5px;
}
.toggle-row input {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
}
.danger-panel {
  grid-column: 1 / -1;
  border: 1px solid #fecaca;
  border-radius: var(--radius);
  background: #fff7f7;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.danger-panel p {
  color: var(--text3);
  font-size: 12.5px;
  margin-top: 4px;
}
.danger-panel button {
  border: 1px solid #fca5a5;
  border-radius: var(--radius);
  background: #fff;
  color: #dc2626;
  padding: 9px 12px;
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
}

@media (max-width: 980px) {
  .content-grid,
  .stock-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
