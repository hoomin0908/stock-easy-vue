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
        <div class="content-column">
          <section class="data-panel summary-panel">
            <div class="panel-title-row">
              <h2>찜한 주식 목록</h2>
              <span>{{ interestStocks.length }}개</span>
            </div>
            <div v-if="isInterestsLoading" class="compact-state">관심 기업을 불러오는 중입니다...</div>
            <div v-else-if="interestStocks.length === 0" class="compact-state">등록한 관심 기업이 없습니다.</div>
            <div v-else class="stock-card-grid">
              <article
                v-for="interest in visibleInterestStocks"
                :key="interest.id"
                class="stock-card"
              >
                <button
                  type="button"
                  class="stock-card-main"
                  @click="goToStockNews(interest)"
                >
                  <strong>{{ interest.stock.stock_name }}</strong>
                  <small>{{ interest.stock.stock_code }}</small>
                </button>
                <button
                  type="button"
                  class="heart-btn active"
                  :disabled="deletingInterestId === interest.id"
                  :title="`${interest.stock.stock_name} 관심 기업 삭제`"
                  @click="removeInterestStock(interest)"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </article>
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
              <h2>저장한 뉴스</h2>
              <span>{{ savedNews.length }}개</span>
            </div>
            <div v-if="isSavedNewsLoading" class="compact-state">저장한 뉴스를 불러오는 중입니다...</div>
            <div v-else-if="savedNews.length === 0" class="compact-state">저장한 뉴스가 없습니다.</div>
            <div v-else class="mypage-saved-news-grid">
              <div
                v-for="item in visibleSavedNews"
                :key="item.id"
                class="mypage-saved-news-card"
              >
                <NewsCard :news="item.news" :show-viewed-state="false">
                  <template #footer>
                    {{ formatSavedAt(item.created_at) }} 저장
                  </template>
                </NewsCard>
              </div>
            </div>
            <button
              v-if="savedNews.length > 3"
              type="button"
              class="more-toggle-btn"
              @click="showAllSavedNews = !showAllSavedNews"
            >
              {{ showAllSavedNews ? "접기" : `더보기 ${savedNews.length - 3}개` }}
            </button>
          </section>

          <section class="danger-panel">
            <div>
              <h2>회원 탈퇴</h2>
              <p>계정과 저장 데이터 삭제가 필요한 경우에만 진행해 주세요.</p>
            </div>
            <button type="button">탈퇴하기</button>
          </section>
        </div>

        <div class="content-column">
          <section class="data-panel summary-panel">
            <div class="panel-title-row">
              <h2>저장한 용어</h2>
              <span>{{ savedTerms.length }}개</span>
            </div>
            <div v-if="isTermsLoading" class="compact-state">저장한 용어를 불러오는 중입니다...</div>
            <div v-else-if="savedTerms.length === 0" class="compact-state">저장한 용어가 없습니다.</div>
            <div v-else class="term-card-grid">
              <article v-for="term in visibleSavedTerms" :key="term.id || term.term" class="term-card">
                <div class="term-copy">
                  <h3>{{ getTermName(term) }}</h3>
                  <p>{{ getTermDescription(term) }}</p>
                </div>
              </article>
            </div>
            <button
              v-if="savedTerms.length > 2"
              type="button"
              class="more-toggle-btn"
              @click="showAllTerms = !showAllTerms"
            >
              {{ showAllTerms ? "접기" : `더보기 ${savedTerms.length - 2}개` }}
            </button>
          </section>

          <form class="data-panel settings-panel" @submit.prevent="handleProfileSubmit">
            <h2>계정 설정</h2>
            <label class="field-label">
              닉네임
              <input v-model.trim="profileForm.nickname" type="text" autocomplete="nickname" />
            </label>
            <label class="field-label">
              이메일
              <input v-model.trim="profileForm.email" type="email" autocomplete="email" required />
            </label>
            <label class="field-label">
              새 비밀번호
              <input
                v-model="profileForm.password"
                type="password"
                autocomplete="new-password"
                placeholder="변경할 때만 입력"
              />
            </label>
            <p v-if="profileMessage" class="form-message success">{{ profileMessage }}</p>
            <p v-if="profileError" class="form-message error">{{ profileError }}</p>
            <button type="submit" class="primary-btn" :disabled="isProfileSaving">
              {{ isProfileSaving ? "저장 중..." : "변경사항 저장" }}
            </button>
          </form>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../services/auth";
import { deleteInterestStock, fetchInterestStocks, fetchSavedNews, fetchSavedTerms } from "../services/api";
import NewsCard from "../components/news/NewsCard.vue";

const SAVED_TERMS_KEY = "stockeasy-saved-terms";

const router = useRouter();
const { currentUser, updateProfile } = useAuth();

const interestStocks = ref([]);
const savedTerms = ref([]);
const savedNews = ref([]);
const isInterestsLoading = ref(false);
const isTermsLoading = ref(false);
const isSavedNewsLoading = ref(false);
const deletingInterestId = ref(null);
const showAllInterests = ref(false);
const showAllTerms = ref(false);
const showAllSavedNews = ref(false);

const profileForm = reactive({ email: "", nickname: "", password: "" });
const isProfileSaving = ref(false);
const profileMessage = ref("");
const profileError = ref("");

const visibleInterestStocks = computed(() =>
  showAllInterests.value ? interestStocks.value : interestStocks.value.slice(0, 2)
);
const visibleSavedTerms = computed(() =>
  showAllTerms.value ? savedTerms.value : savedTerms.value.slice(0, 2)
);
const visibleSavedNews = computed(() =>
  showAllSavedNews.value ? savedNews.value : savedNews.value.slice(0, 3)
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
    item?.explanation ||
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

async function loadSavedNews() {
  isSavedNewsLoading.value = true;

  try {
    const { data } = await fetchSavedNews();
    savedNews.value = normalizeList(data)
      .filter((item) => item?.news?.id)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  } catch (error) {
    console.error("마이페이지 저장 뉴스 조회 실패", error);
    savedNews.value = [];
  } finally {
    isSavedNewsLoading.value = false;
  }
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

function formatSavedAt(value) {
  if (!value) return "저장됨";
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

async function removeInterestStock(interest) {
  if (deletingInterestId.value !== null) return;
  if (!window.confirm(`${interest.stock.stock_name}을(를) 관심 기업에서 삭제하시겠습니까?`)) return;

  deletingInterestId.value = interest.id;

  try {
    await deleteInterestStock(interest.id);
    interestStocks.value = interestStocks.value.filter((item) => item.id !== interest.id);
  } catch (error) {
    console.error("마이페이지 관심 기업 삭제 실패", error);
    window.alert("관심 기업을 삭제하지 못했습니다.");
  } finally {
    deletingInterestId.value = null;
  }
}

function getProfileErrorMessage(error) {
  const data = error.response?.data;

  return (
    data?.detail ||
    data?.email?.[0] ||
    data?.nickname?.[0] ||
    data?.password?.[0] ||
    "회원정보를 저장하지 못했습니다. 입력값을 확인해 주세요."
  );
}

async function handleProfileSubmit() {
  if (isProfileSaving.value) return;

  profileMessage.value = "";
  profileError.value = "";
  isProfileSaving.value = true;

  const payload = {
    email: profileForm.email,
    nickname: profileForm.nickname,
  };

  if (profileForm.password.trim()) {
    payload.password = profileForm.password;
  }

  try {
    await updateProfile(payload);
    profileForm.password = "";
    profileMessage.value = "회원정보가 저장되었습니다.";
  } catch (error) {
    console.error("회원정보 수정 실패", error);
    profileError.value = getProfileErrorMessage(error);
  } finally {
    isProfileSaving.value = false;
  }
}

watch(
  currentUser,
  (user) => {
    profileForm.email = user?.email || "";
    profileForm.nickname = user?.nickname || "";
    profileForm.password = "";
  },
  { immediate: true }
);

onMounted(() => {
  loadInterestStocks();
  loadSavedTerms();
  loadSavedNews();
});
</script>

<style scoped>
.mypage-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  background: var(--bg3);
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
  align-items: start;
}
.content-column {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}
.data-panel {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--cream);
  padding: 18px;
  box-shadow: var(--panel-shadow);
}
.summary-panel {
  display: flex;
  flex-direction: column;
  min-height: 232px;
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
.stock-card-grid,
.term-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  gap: 10px;
  flex: 1;
}
.stock-card {
  position: relative;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--cream);
  min-height: 154px;
  padding: 0;
  text-align: left;
  display: flex;
  align-items: stretch;
  box-shadow: var(--panel-shadow);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.15s ease;
}
.stock-card:hover {
  z-index: 2;
  transform: translateY(-5px) scale(1.015);
  border-color: var(--border);
  background: var(--cream);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.14);
}
.stock-card-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 18px 48px 18px 18px;
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  font: inherit;
}
.stock-card-main strong,
.stock-card-main small {
  display: block;
}
.stock-card-main strong {
  color: var(--text1);
  font-size: 18px;
  font-weight: 850;
  line-height: 1.4;
}
.stock-card-main small {
  color: var(--text3);
  font-size: 13.5px;
  line-height: 1.65;
  margin-top: 8px;
}
.heart-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.15s ease;
}
.heart-btn:hover { background: var(--danger-bg); color: #fb7185; }
.heart-btn svg { width: 17px; height: 17px; fill: transparent; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.heart-btn.active { color: var(--primary); }
.heart-btn.active svg { fill: currentColor; stroke: currentColor; }
.heart-btn.active:hover { background: var(--primary-bg); color: var(--primary-hover); }
.heart-btn:disabled { opacity: 0.65; cursor: not-allowed; }
.mypage-saved-news-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mypage-saved-news-card {
  min-width: 0;
}
.mypage-saved-news-card :deep(.news-card) {
  padding: 12px;
  border-radius: var(--radius);
  box-shadow: none;
}
.mypage-saved-news-card :deep(.news-card:hover) {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
}
.mypage-saved-news-card :deep(.card-body-layout) {
  gap: 12px;
}
.mypage-saved-news-card :deep(.news-thumb-box) {
  width: 112px;
}
.mypage-saved-news-card :deep(.news-top-row) {
  margin-bottom: 6px;
  font-size: 11.5px;
}
.mypage-saved-news-card :deep(.sentiment-badge) {
  padding: 2px 7px;
  font-size: 10.5px;
}
.mypage-saved-news-card :deep(.meta-divider) {
  margin: 0 5px;
}
.mypage-saved-news-card :deep(.news-title-link) {
  font-size: 13.5px;
  line-height: 1.4;
  margin-bottom: 5px;
}
.mypage-saved-news-card :deep(.news-author-row) {
  margin-top: 3px;
}
.mypage-saved-news-card :deep(.news-author-txt),
.mypage-saved-news-card :deep(.origin-link-btn) {
  font-size: 11px;
}
.mypage-saved-news-card :deep(.news-card-footer) {
  margin-top: 5px;
  font-size: 11px;
}
.term-card {
  position: relative;
  min-width: 0;
  min-height: 154px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--cream);
  padding: 18px;
  box-shadow: var(--panel-shadow);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.term-card:hover {
  z-index: 2;
  transform: translateY(-5px) scale(1.015);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.14);
}
.term-copy {
  flex: 1;
  min-width: 0;
}
.term-copy h3 {
  color: var(--text1);
  font-size: 18px;
  font-weight: 850;
  line-height: 1.4;
}
.term-copy p {
  display: -webkit-box;
  overflow: hidden;
  color: var(--text3);
  font-size: 13.5px;
  line-height: 1.65;
  margin-top: 8px;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}
.more-toggle-btn {
  width: 100%;
  margin-top: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--cream);
  color: var(--primary);
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
}
.more-toggle-btn:hover {
  border-color: var(--border);
  background: var(--bg2);
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
.field-label input::placeholder {
  color: var(--text3);
}
.field-label input:disabled {
  opacity: 0.72;
  cursor: not-allowed;
}
.field-label input:focus {
  border-color: var(--border);
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.12);
}
.form-message {
  margin-top: 12px;
  border-radius: var(--radius);
  padding: 9px 10px;
  font-size: 12px;
  line-height: 1.45;
}
.form-message.success {
  background: var(--success-bg);
  color: var(--success);
}
.form-message.error {
  background: var(--error-bg);
  color: var(--error);
}
.primary-btn {
  margin-top: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--cream);
  color: var(--primary);
  padding: 10px 13px;
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
}
.primary-btn:hover:not(:disabled) {
  border-color: var(--border);
  background: var(--bg2);
}
.primary-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.danger-panel {
  border: 1px solid var(--danger-border);
  border-radius: var(--radius);
  background: var(--danger-bg);
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
  border: 1px solid var(--danger-border);
  border-radius: var(--radius);
  background: var(--danger-surface);
  color: var(--danger);
  padding: 9px 12px;
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
}

@media (max-width: 980px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .stock-card-grid,
  .term-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
