<template>
  <main class="mypage-content">
    <section class="content-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">My Page</p>
          <h1>마이페이지</h1>
          <p class="section-description">관심 목록, 활동 내역, 계정 설정을 한 화면에서 확인합니다.</p>
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
              v-for="interest in visibleInterestStocks"
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
          <button
            v-if="interestStocks.length > 2"
            type="button"
            class="more-toggle-btn"
            @click="showAllInterests = !showAllInterests"
          >
            {{ showAllInterests ? "접기" : `더보기 ${interestStocks.length - 2}개` }}
          </button>
        </section>

        <section class="data-panel">
          <div class="panel-title-row">
            <h2>저장한 용어</h2>
            <span>{{ savedTerms.length }}개</span>
          </div>
          <div v-if="isTermsLoading" class="compact-state">저장한 용어를 불러오는 중입니다...</div>
          <div v-else-if="savedTerms.length === 0" class="compact-state">저장한 용어가 없습니다.</div>
          <div v-else class="term-list">
            <article v-for="term in visibleSavedTerms" :key="term.id || term.term" class="term-row">
              <strong>{{ getTermName(term) }}</strong>
              <p>{{ getTermDescription(term) }}</p>
            </article>
          </div>
          <button
            v-if="savedTerms.length > 1"
            type="button"
            class="more-toggle-btn"
            @click="showAllTerms = !showAllTerms"
          >
            {{ showAllTerms ? "접기" : `더보기 ${savedTerms.length - 1}개` }}
          </button>
        </section>

        <section class="data-panel">
          <div class="panel-title-row">
            <h2>최근 본 뉴스</h2>
            <span>{{ recentNews.length }}개</span>
          </div>
          <div v-if="recentNews.length === 0" class="compact-state">최근 본 뉴스가 없습니다.</div>
          <div v-else class="recent-news-list">
            <router-link
              v-for="news in visibleRecentNews"
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
          <button
            v-if="recentNews.length > 3"
            type="button"
            class="more-toggle-btn"
            @click="showAllRecentNews = !showAllRecentNews"
          >
            {{ showAllRecentNews ? "접기" : `더보기 ${recentNews.length - 3}개` }}
          </button>
        </section>

        <section class="data-panel settings-panel">
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

        <section class="data-panel settings-panel">
          <h2>화면 설정</h2>
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
import { useRouter } from "vue-router";
import { useAuth } from "../services/auth";
import { fetchInterestStocks, fetchSavedTerms } from "../services/api";

const RECENT_NEWS_KEY = "stockeasy-recent-news";
const SAVED_TERMS_KEY = "stockeasy-saved-terms";

const router = useRouter();
const { currentUser } = useAuth();
const themeMode = inject("themeMode", ref("light"));
const toggleTheme = inject("toggleTheme", () => {});

const interestStocks = ref([]);
const savedTerms = ref([]);
const recentNews = ref([]);
const isInterestsLoading = ref(false);
const isTermsLoading = ref(false);
const showAllInterests = ref(false);
const showAllTerms = ref(false);
const showAllRecentNews = ref(false);

const profileForm = reactive({ nickname: "" });

const userEmail = computed(() => currentUser.value?.email || "이메일 정보 없음");
const visibleInterestStocks = computed(() =>
  showAllInterests.value ? interestStocks.value : interestStocks.value.slice(0, 2)
);
const visibleSavedTerms = computed(() =>
  showAllTerms.value ? savedTerms.value : savedTerms.value.slice(0, 1)
);
const visibleRecentNews = computed(() =>
  showAllRecentNews.value ? recentNews.value : recentNews.value.slice(0, 3)
);

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.terms)) return data.terms;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function normalizeSavedTerms(data) {
  return mergeTerms(normalizeList(data), readLocalList(SAVED_TERMS_KEY));
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
    savedTerms.value = normalizeSavedTerms(data);
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

function getTermKey(item) {
  return getTermName(item).trim().toLocaleLowerCase("ko-KR");
}

function mergeTerms(primary, secondary) {
  const merged = [];
  const seen = new Set();

  [...primary, ...secondary].forEach((item) => {
    const key = getTermKey(item);
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  });

  return merged;
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
.section-description {
  color: var(--text3);
  font-size: 12.5px;
  margin-top: 6px;
}
.content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.data-panel {
  border: 1px solid var(--border);
  border-top-color: var(--primary-border);
  border-radius: var(--radius);
  background: var(--cream);
  padding: 18px;
  box-shadow: 0 8px 22px rgba(255, 106, 0, 0.035);
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
  border-left-color: var(--primary-border);
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
  border-left-color: var(--primary-border);
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
.more-toggle-btn {
  width: 100%;
  margin-top: 10px;
  border: 1px solid var(--primary-border);
  border-radius: var(--radius);
  background: var(--primary-bg);
  color: var(--primary);
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
}
.more-toggle-btn:hover {
  background: rgba(255, 106, 0, 0.16);
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
