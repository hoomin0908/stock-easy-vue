<template>
  <div class="detail-container">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>실시간 AI 시장 영향 및 멀티미디어 인프라 분석 중...</p>
    </div>

    <div v-else-if="news" class="detail-scroll-area">
      
      <header class="detail-header">
        <h1 class="detail-title">{{ news.title }}</h1>

        <div class="detail-meta-row">
          <span class="sentiment-tag" :class="sentimentClass">{{ sentimentLabel }}</span>
          <span class="impact-meta">영향도 {{ analysis?.impact_score || '0.0' }} / 10</span>
          <span class="meta-divider">•</span>
          <span class="publisher-txt">{{ news.publisher }}</span>
          <span class="meta-divider">•</span>
          <span class="time-txt">실시간 AI 브리핑</span>
        </div>

        <div class="action-bar-row">
          <span class="author-txt" v-if="news.author">{{ news.author }}</span>

          <div class="detail-actions">
            <button
              v-if="analysis"
              type="button"
              class="report-open-btn"
              @click="openAiReport"
            >
              AI 리포트 보기
              <span aria-hidden="true">→</span>
            </button>

          </div>
        </div>
      </header>

      <hr class="section-divider" />

      <div class="dashboard-upper-grid">
        
        <div class="upper-left-content">
          <article class="detail-article-body">
            <h2 class="section-sub-title">
              <span class="section-index">01</span>
              AI 알기 쉬운 재구성 브리핑
            </h2>
            <div class="rewritten-box">
              <p
                v-for="(sentence, idx) in briefingSentences"
                :key="`${idx}-${sentence.text}`"
                class="briefing-sentence"
                :class="{ 'is-highlighted': sentence.references.length > 0 }"
              >
                <span>{{ sentence.text }}</span>
                <template v-if="sentence.references.length > 0">
                  <sup
                    v-for="reference in sentence.references"
                    :key="reference"
                    class="briefing-reference"
                  >
                    [{{ reference }}]
                  </sup>
                </template>
              </p>
            </div>
          </article>

          <section class="ai-terms-section" v-if="analysis?.difficult_terms && analysis.difficult_terms.length > 0">
            <h2 class="section-sub-title">
              <span class="section-index">02</span>
              초보 투자 용어 풀이
            </h2>
            <div class="terms-pill-grid">
              <details
                v-for="(tm, idx) in analysis.difficult_terms"
                :key="idx"
                class="term-detail-card"
              >
                <summary class="term-badge-name">
                  <span>{{ getTermName(tm) }}</span>
                  <span class="term-toggle-icon" aria-hidden="true">+</span>
                </summary>
                <button
                  type="button"
                  class="term-save-btn"
                  :class="{ saved: isTermSaved(tm) }"
                  :disabled="isTermSaving(tm)"
                  :title="isTermSaved(tm) ? '용어 저장 취소' : '용어 저장'"
                  :aria-label="isTermSaved(tm) ? '용어 저장 취소' : '용어 저장'"
                  @click.stop="handleToggleSavedTerm(tm)"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.75L6 21V4.75Z" />
                  </svg>
                </button>
                <div class="term-explanation-box">
                  <p class="term-explanation-txt">{{ getTermExplanation(tm) }}</p>
                  <p v-if="getTermSaveError(tm)" class="term-save-error">
                    {{ getTermSaveError(tm) }}
                  </p>
                </div>
              </details>
            </div>
          </section>

          <section class="ai-checkpoint-section" v-if="analysis?.check_points && analysis.check_points.length > 0">
            <h2 class="section-sub-title">
              <span class="section-index">03</span>
              투자자가 추가로 확인해야 할 체크포인트
            </h2>
            <ul class="checkpoint-list">
              <li v-for="(cp, idx) in analysis.check_points" :key="idx">
                {{ cp }}
              </li>
            </ul>
          </section>
        </div>

        <div class="upper-right-widgets">
          <section class="ai-highlight-section" v-if="highlightFacts.length > 0">
            <h2 class="section-sub-title">
              <span class="section-index">KEY</span>
              AI 추천 뉴스 핵심 팩트
            </h2>
            <div class="highlight-list">
              <article
                v-for="(fact, idx) in highlightFacts"
                :key="`${idx}-${fact.sentence}`"
                class="highlight-item-box"
              >
                <span class="fact-reference">[{{ idx + 1 }}]</span>
                <div class="fact-content">
                  <p class="hl-sentence">{{ fact.sentence }}</p>
                  <p v-if="fact.reason" class="hl-reason">
                    중요 근거: {{ fact.reason }}
                  </p>
                </div>
              </article>
            </div>
          </section>
          <div v-else class="highlight-empty-state">
            핵심 팩트 문장을 분석하고 있습니다.
          </div>

          <section class="related-widgets-section">
            <h2 class="section-sub-title">
              <span class="section-index">MORE</span>
              관련 콘텐츠와 커뮤니티
            </h2>
            <div class="related-widgets-panel">
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
              <div class="pane-component-scroller">
                <NewsYoutubeFeed :company-name="targetCompanyName || '주식 시장'" />
              </div>
            </div>

            <div v-if="activeTab === 'map'" class="tab-pane-view">
              <NewsKakaoMap :company-name="targetCompanyName || '한국거래소'" />
            </div>

            <div v-if="activeTab === 'community'" class="tab-pane-view">
              <div class="pane-title-info">
                <p>기사 및 AI 분석 결과 피드에 대한 주주 실시간 토론 공간</p>
              </div>
              <div class="community-chat-container">
                <div class="chat-scroller">
                  <div v-if="isCommentsLoading" class="comment-state">
                    댓글을 불러오는 중입니다...
                  </div>

                  <div v-else-if="commentLoadError" class="comment-state error">
                    <p>{{ commentLoadError }}</p>
                    <button type="button" @click="loadComments">다시 시도</button>
                  </div>

                  <div v-else-if="comments.length === 0" class="comment-state">
                    아직 댓글이 없습니다. 첫 의견을 남겨보세요.
                  </div>

                  <template v-else>
                    <div
                      v-for="(comment, index) in comments"
                      :key="comment.id"
                      class="comment-entry"
                    >
                      <div v-if="shouldShowCommentDate(index)" class="chat-date-divider">
                        <span>{{ formatCommentDate(comment.created_at) }}</span>
                      </div>

                      <div
                        class="comment-message-row"
                        :class="{ sent: isMyComment(comment), received: !isMyComment(comment) }"
                      >
                        <div
                          class="msg"
                          :class="{ sent: isMyComment(comment), received: !isMyComment(comment) }"
                        >
                          <div class="comment-header">
                            <span class="chat-user">{{ comment.user?.nickname || "사용자" }}</span>

                            <div
                              v-if="isMyComment(comment)"
                              class="comment-menu"
                              @click.stop
                            >
                              <button
                                type="button"
                                class="comment-menu-trigger"
                                aria-label="댓글 메뉴 열기"
                                @click="toggleCommentMenu(comment.id)"
                              >
                                …
                              </button>
                              <div
                                v-if="openCommentMenuId === comment.id"
                                class="comment-menu-popover"
                              >
                                <button type="button" @click="startEditing(comment)">수정</button>
                                <button
                                  type="button"
                                  :disabled="deletingCommentId === comment.id"
                                  @click="handleDelete(comment)"
                                >
                                  {{ deletingCommentId === comment.id ? "삭제 중" : "삭제" }}
                                </button>
                              </div>
                            </div>
                          </div>

                          <template v-if="editingCommentId === comment.id">
                            <textarea
                              v-model="editingContent"
                              class="comment-edit-input"
                              maxlength="500"
                              rows="3"
                            ></textarea>
                            <div class="edit-actions">
                              <button type="button" @click="cancelEditing">취소</button>
                              <button
                                type="button"
                                :disabled="isUpdating || !editingContent.trim()"
                                @click="handleUpdate(comment.id)"
                              >
                                {{ isUpdating ? "저장 중..." : "저장" }}
                              </button>
                            </div>
                          </template>

                          <p v-else class="msg-txt">{{ comment.content }}</p>
                        </div>

                        <span class="chat-time">
                          {{ formatCommentTime(getCommentDisplayTime(comment)) }}
                          <template v-if="isEdited(comment)"> · 수정됨</template>
                        </span>
                      </div>
                    </div>
                  </template>
                </div>

                <p v-if="commentMutationError" class="comment-error">
                  {{ commentMutationError }}
                </p>

                <div v-if="isAuthenticated" class="chat-footer-input-row">
                  <input
                    v-model="commentContent"
                    type="text"
                    maxlength="500"
                    placeholder="성숙한 투자 견해를 공유해 주세요..."
                    class="chat-input"
                    :disabled="isCreating"
                    @keyup.enter="handleCreate"
                  />
                  <button
                    type="button"
                    class="chat-send-btn"
                    :disabled="isCreating || !commentContent.trim()"
                    @click="handleCreate"
                  >
                    {{ isCreating ? "전송 중" : "전송" }}
                  </button>
                </div>

                <div v-else class="comment-login-notice">
                  <router-link
                    :to="{ path: '/login', query: { redirect: route.fullPath } }"
                  >
                    로그인
                  </router-link>
                  후 댓글을 작성할 수 있습니다.
                </div>
              </div>
            </div>
          </div>
            </div>
          </section>
        </div>
      </div>

    </div>
  </div>

  <Teleport to="body">
    <Transition name="report-page-turn">
      <div
        v-if="showAiReport && analysis"
        class="report-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-report-title"
        @click.self="closeAiReport"
      >
        <article class="report-paper">
          <button
            type="button"
            class="report-close-btn"
            aria-label="AI 리포트 닫기"
            @click="closeAiReport"
          >
            ×
          </button>

          <header class="report-header">
            <div>
              <p class="report-kicker">STOCKEASY AI RESEARCH</p>
              <h2 id="ai-report-title">AI 투자 판단 리포트</h2>
              <p class="report-news-title">{{ news.title }}</p>
            </div>
          </header>

          <div class="report-meta">
            <span>{{ news.publisher }}</span>
            <span>{{ targetCompanyName || '시장 종합' }}</span>
            <span :class="['report-sentiment', sentimentClass]">{{ sentimentLabel }}</span>
          </div>

          <section v-if="highlightFacts.length" class="report-section">
            <p class="report-section-label">EXECUTIVE FACTS</p>
            <h3>핵심 사실 요약</h3>
            <ol class="report-fact-list">
              <li v-for="(fact, idx) in highlightFacts" :key="`${idx}-${fact.sentence}`">
                <span>[{{ idx + 1 }}]</span>
                <p>{{ fact.sentence }}</p>
              </li>
            </ol>
          </section>

          <section class="report-section report-impact-section">
            <p class="report-section-label">MARKET IMPACT</p>
            <div class="report-impact-heading">
              <div>
                <h3>시장 영향도 기준</h3>
                <p>AI가 기사 파급 범위를 0.0부터 10.0 사이로 산정합니다.</p>
              </div>
              <div class="report-score">
                <span>현재 영향도</span>
                <strong>{{ analysis.impact_score || '0.0' }}</strong>
                <small>/ 10</small>
              </div>
            </div>
            <div class="impact-scale-list">
              <div
                v-for="level in impactLevels"
                :key="level.range"
                class="impact-scale-item"
                :class="{ active: currentImpactLevel.range === level.range }"
              >
                <strong>{{ level.range }}점</strong>
                <span>{{ level.description }}</span>
              </div>
            </div>
          </section>

          <section class="report-section report-sentiment-section">
            <p class="report-section-label">AI SENTIMENT</p>
            <h3>호재·악재·중립 판단</h3>
            <div class="sentiment-decision-card" :class="sentimentClass">
              <span class="sentiment-decision-label">{{ reportSentimentLabel }}</span>
              <div>
                <h4>{{ reportReasonTitle }}</h4>
                <p>{{ analysis.sentiment_reason || analysis.impact_reason }}</p>
              </div>
            </div>
          </section>

          <section v-if="analysis.check_points?.length" class="report-section report-checkpoints">
            <p class="report-section-label">INVESTOR CHECKLIST</p>
            <h3>추가 확인 항목</h3>
            <ul>
              <li v-for="(checkpoint, idx) in analysis.check_points" :key="idx">
                {{ checkpoint }}
              </li>
            </ul>
          </section>

          <footer class="report-conclusion">
            <span>AI 종합 가이드</span>
            <p>종합 점수와 호악재 균형을 고려해 <strong>{{ targetCompanyName || '관심 기업' }}</strong>의 수급 변화를 추적하고, 분할 접근 관점에서 리스크를 관리하세요.</p>
          </footer>
        </article>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, inject } from "vue";
import { useRoute } from "vue-router";
import {
  fetchNewsDetail,
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
  fetchSavedTerms,
  saveTerm,
  deleteSavedTerm,
} from "../services/api";
import { useAuth } from "../services/auth";

import NewsYoutubeFeed from "../components/news/NewsYoutubeFeed.vue";
import NewsKakaoMap from "../components/news/NewsKakaoMap.vue";

const route = useRoute();
const { currentUser, isAuthenticated } = useAuth();
const news = ref(null);
const isLoading = ref(false);
const comments = ref([]);
const commentContent = ref("");
const editingCommentId = ref(null);
const editingContent = ref("");
const isCommentsLoading = ref(false);
const isCreating = ref(false);
const isUpdating = ref(false);
const deletingCommentId = ref(null);
const commentLoadError = ref("");
const commentMutationError = ref("");
const showAiReport = ref(false);
const openCommentMenuId = ref(null);
const savedTerms = ref([]);
const savingTermNames = ref(new Set());
const termSaveErrors = ref({});

const toggleWatchlist = inject("toggleWatchlist");
const isWatched = inject("isWatched");

const activeTab = ref("youtube");
const tabs = [
  { id: "youtube", label: "관련 유튜브" },
  { id: "map", label: "카카오맵" },
  { id: "community", label: "실시간 토론" }
];

async function loadComments() {
  if (!route.params.id) return;

  isCommentsLoading.value = true;
  commentLoadError.value = "";

  try {
    const { data } = await fetchComments(route.params.id);
    comments.value = Array.isArray(data)
      ? [...data].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      : [];
  } catch (error) {
    console.error("댓글 조회 실패", error);
    commentLoadError.value = "댓글을 불러오지 못했습니다.";
  } finally {
    isCommentsLoading.value = false;
  }
}

async function handleCreate() {
  const content = commentContent.value.trim();
  if (!content || !isAuthenticated.value || isCreating.value) return;

  isCreating.value = true;
  commentMutationError.value = "";

  try {
    await createComment(route.params.id, content);
    commentContent.value = "";
    await loadComments();
  } catch (error) {
    commentMutationError.value = getCommentError(
      error,
      "댓글을 등록하지 못했습니다."
    );
  } finally {
    isCreating.value = false;
  }
}

function startEditing(comment) {
  openCommentMenuId.value = null;
  editingCommentId.value = comment.id;
  editingContent.value = comment.content;
  commentMutationError.value = "";
}

function cancelEditing() {
  editingCommentId.value = null;
  editingContent.value = "";
}

async function handleUpdate(commentId) {
  const content = editingContent.value.trim();
  if (!content || isUpdating.value) return;

  isUpdating.value = true;
  commentMutationError.value = "";

  try {
    await updateComment(commentId, content);
    cancelEditing();
    await loadComments();
  } catch (error) {
    commentMutationError.value = getCommentError(
      error,
      "댓글을 수정하지 못했습니다."
    );
  } finally {
    isUpdating.value = false;
  }
}

async function handleDelete(comment) {
  openCommentMenuId.value = null;
  if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

  deletingCommentId.value = comment.id;
  commentMutationError.value = "";

  try {
    await deleteComment(comment.id);
    if (editingCommentId.value === comment.id) cancelEditing();
    await loadComments();
  } catch (error) {
    commentMutationError.value = getCommentError(
      error,
      "댓글을 삭제하지 못했습니다."
    );
  } finally {
    deletingCommentId.value = null;
  }
}

function isMyComment(comment) {
  return currentUser.value?.id === comment.user?.id;
}

function isEdited(comment) {
  return Boolean(
    comment.created_at &&
    comment.updated_at &&
    comment.created_at !== comment.updated_at
  );
}

function getCommentDisplayTime(comment) {
  return isEdited(comment) ? comment.updated_at : comment.created_at;
}

function formatCommentTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatCommentDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function shouldShowCommentDate(index) {
  if (index === 0) return true;

  return (
    formatCommentDate(comments.value[index]?.created_at) !==
    formatCommentDate(comments.value[index - 1]?.created_at)
  );
}

function toggleCommentMenu(commentId) {
  openCommentMenuId.value =
    openCommentMenuId.value === commentId ? null : commentId;
}

function closeCommentMenu() {
  openCommentMenuId.value = null;
}

function getCommentError(error, fallback) {
  const data = error.response?.data;
  return data?.detail || data?.content?.[0] || fallback;
}

function openAiReport() {
  showAiReport.value = true;
}

function closeAiReport() {
  showAiReport.value = false;
}

function handleReportKeydown(event) {
  if (event.key === "Escape" && showAiReport.value) closeAiReport();
}

function getTermName(term) {
  if (typeof term?.term === "string") return term.term;
  return term?.term?.name || term?.name || term?.title || "";
}

function getTermExplanation(term) {
  return (
    term?.explanation ||
    term?.description ||
    term?.term?.description ||
    term?.meaning ||
    ""
  );
}

function normalizeTermName(term) {
  return getTermName(term).trim().toLocaleLowerCase("ko-KR");
}

function normalizeSavedTerms(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function isTermSaved(term) {
  return Boolean(getSavedTerm(term));
}

function getSavedTerm(term) {
  const termName = normalizeTermName(term);
  if (!termName) return null;
  return savedTerms.value.find(
    (savedTerm) => normalizeTermName(savedTerm) === termName
  ) || null;
}

function isTermSaving(term) {
  return savingTermNames.value.has(normalizeTermName(term));
}

function getTermSaveError(term) {
  return termSaveErrors.value[normalizeTermName(term)] || "";
}

async function loadSavedTerms() {
  try {
    const { data } = await fetchSavedTerms();
    savedTerms.value = normalizeSavedTerms(data);
  } catch (error) {
    console.error("저장 용어 조회 실패", error);
    savedTerms.value = [];
  }
}

async function handleToggleSavedTerm(term) {
  const termName = getTermName(term).trim();
  const explanation = getTermExplanation(term).trim();
  const normalizedName = normalizeTermName(term);
  const savedTerm = getSavedTerm(term);

  if (!termName || !normalizedName || isTermSaving(term)) return;

  savingTermNames.value = new Set(savingTermNames.value).add(normalizedName);
  termSaveErrors.value = {
    ...termSaveErrors.value,
    [normalizedName]: "",
  };

  try {
    if (savedTerm) {
      await deleteSavedTerm(savedTerm.id);
      savedTerms.value = savedTerms.value.filter((item) => item.id !== savedTerm.id);
    } else {
      const { data } = await saveTerm(termName, explanation);
      savedTerms.value = [...savedTerms.value, data];
    }
  } catch (error) {
    console.error(savedTerm ? "용어 저장 취소 실패" : "용어 저장 실패", error);
    termSaveErrors.value = {
      ...termSaveErrors.value,
      [normalizedName]: savedTerm
        ? "용어 저장 취소에 실패했습니다."
        : "용어 저장에 실패했습니다.",
    };
  } finally {
    const nextSavingTermNames = new Set(savingTermNames.value);
    nextSavingTermNames.delete(normalizedName);
    savingTermNames.value = nextSavingTermNames;
  }
}

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

onMounted(() => {
  loadDetail();
  loadComments();
  loadSavedTerms();
  document.addEventListener("keydown", handleReportKeydown);
  document.addEventListener("click", closeCommentMenu);
});

watch(() => route.params.id, () => {
  closeAiReport();
  cancelEditing();
  commentContent.value = "";
  commentMutationError.value = "";
  loadDetail();
  loadComments();
});

watch(showAiReport, (isOpen) => {
  document.body.style.overflow = isOpen ? "hidden" : "";
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleReportKeydown);
  document.removeEventListener("click", closeCommentMenu);
  document.body.style.overflow = "";
});

const analysis = computed(() => news.value?.ai_analysis);

const highlightFacts = computed(() => {
  return Array.isArray(analysis.value?.highlight)
    ? analysis.value.highlight.filter((item) => item?.sentence)
    : [];
});

const briefingSentences = computed(() => {
  const content =
    analysis.value?.rewritten_content ||
    news.value?.content ||
    news.value?.description ||
    "";

  const decimalPointToken = "__DECIMAL_POINT__";
  const protectedContent = content.replace(
    /(\d)\.(?=\d)/g,
    `$1${decimalPointToken}`
  );

  const sentences = protectedContent
    .match(/[^.!?。]+(?:[.!?。]+|$)/g)
    ?.map((sentence) =>
      sentence.replaceAll(decimalPointToken, ".").trim()
    )
    .filter(Boolean) || [];

  return sentences.map((text) => ({
    text,
    references: highlightFacts.value.reduce((references, fact, idx) => {
      if (isMatchingFact(text, fact.sentence)) references.push(idx + 1);
      return references;
    }, []),
  }));
});

function normalizeSentence(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function isMatchingFact(briefingSentence, factSentence) {
  const briefing = normalizeSentence(briefingSentence);
  const fact = normalizeSentence(factSentence);

  if (!briefing || !fact) return false;
  if (briefing.includes(fact) || fact.includes(briefing)) return true;

  const factWords = String(factSentence)
    .toLowerCase()
    .split(/\s+/)
    .map(normalizeSentence)
    .filter((word) => word.length >= 2);

  if (factWords.length === 0) return false;

  const matchedWords = factWords.filter((word) => briefing.includes(word));
  return matchedWords.length / factWords.length >= 0.65;
}

const sentimentLabel = computed(() => {
  const s = analysis.value?.sentiment?.toLowerCase();
  return s === 'positive' ? '호재' : s === 'negative' ? '악재' : '중립';
});
const sentimentClass = computed(() => {
  const s = analysis.value?.sentiment?.toLowerCase();
  return s === 'positive' ? 'up' : s === 'negative' ? 'down' : 'neutral';
});

const impactLevels = [
  { range: "0~2", max: 2, description: "시장 영향 거의 없음" },
  { range: "3~4", max: 4, description: "일부 종목·업종에 제한적 영향" },
  { range: "5~6", max: 6, description: "관련 업종에 중간 수준 영향" },
  { range: "7~8", max: 8, description: "시장 또는 주요 종목에 뚜렷한 영향" },
  { range: "9~10", max: 10, description: "시장 전반 또는 핵심 대형주에 매우 강한 영향" },
];

const currentImpactLevel = computed(() => {
  const score = Number(analysis.value?.impact_score) || 0;
  return impactLevels.find((level) => score <= level.max) || impactLevels[impactLevels.length - 1];
});

const reportSentimentLabel = computed(() => {
  const sentiment = analysis.value?.sentiment?.toLowerCase();
  if (sentiment === "positive") return "호재";
  if (sentiment === "negative") return "악재";
  return "중립";
});

const reportReasonTitle = computed(() => {
  const sentiment = analysis.value?.sentiment?.toLowerCase();
  if (sentiment === "positive") return "호재 이유";
  if (sentiment === "negative") return "악재 이유";
  return "중립 판단 이유";
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
.detail-container {
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  margin: 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  container-type: inline-size;
  container-name: news-detail;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--cream);
  box-shadow: 0 20px 54px rgba(15, 23, 42, 0.08);
}
.loading-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text3); gap: 12px; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.detail-scroll-area { flex: 1; overflow-y: auto; padding: 24px; text-align: left; }
.detail-header { display: flex; flex-direction: column; gap: 14px; padding: 8px 4px 18px; }
.detail-meta-row { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; font-size: 13px; color: var(--text3); }
.meta-divider { margin: 0 8px; color: var(--border); }
.impact-meta { color: var(--text2); font-weight: 700; }
.sentiment-tag { padding: 4px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 700; }
.sentiment-tag.up { background: var(--signal-up-bg, #fef2f2); color: var(--signal-up, #dc2626); }
.sentiment-tag.down { background: var(--signal-down-bg, #eff6ff); color: var(--signal-down, #2563eb); }
.sentiment-tag.neutral { background: var(--signal-neutral-bg, #f1f5f9); color: var(--signal-neutral, #64748b); }
.detail-title { max-width: 900px; font-size: clamp(24px, 3.2cqw, 38px); font-weight: 900; color: var(--text1); line-height: 1.25; letter-spacing: -0.055em; }
.action-bar-row { display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; color: var(--text2); margin-top: 4px; }
.detail-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
.report-open-btn { display: inline-flex; align-items: center; gap: 10px; padding: 11px 18px; border: 1px solid transparent; border-radius: 999px; background: linear-gradient(90deg, #ff5300, #ff9800); color: #ffffff; font-size: 12.5px; font-weight: 850; cursor: pointer; box-shadow: 0 0 28px rgba(255, 106, 0, 0.3); transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease; }
.report-open-btn:hover { transform: translateY(-1px); background: var(--primary-hover, #e94f18); box-shadow: 0 9px 22px rgba(255, 90, 31, 0.24); }
.report-open-btn span { font-size: 15px; transition: transform 0.15s ease; }
.report-open-btn:hover span { transform: translateX(3px); }
.watchlist-toggle-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border); background: var(--cream); font-size: 12.5px; font-weight: 600; color: var(--text2); cursor: pointer; transition: all 0.15s ease; }
.watchlist-toggle-btn:hover { border-color: var(--primary-border); color: var(--primary); background: var(--primary-bg); }
.watchlist-toggle-btn.is-active { background: var(--primary); color: #ffffff; border-color: var(--primary); }
.star-icon { width: 14px; height: 14px; fill: currentColor; }
.section-divider { border: none; border-top: 1px solid var(--border); margin: 8px 0 24px; }
.dashboard-upper-grid { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr); gap: 24px; align-items: flex-start; }
.upper-left-content { flex: 1.1; min-width: 420px; }
.upper-right-widgets { flex: 0.9; min-width: 380px; display: flex; flex-direction: column; gap: 20px; }
.section-sub-title, .lower-section-title { display: flex; align-items: center; gap: 10px; color: var(--text1); }
.section-sub-title { font-size: 15px; font-weight: 750; margin: 0 0 16px; }
.section-index { display: inline-flex; align-items: center; justify-content: center; min-width: 36px; height: 24px; padding: 0 8px; border-radius: 999px; background: rgba(255, 106, 0, 0.14); border: 1px solid rgba(255, 126, 32, 0.32); color: #ff8a1f; font-size: 10px; font-weight: 900; letter-spacing: 0.06em; }
.upper-left-content section, .upper-left-content article { margin-bottom: 20px; }
.detail-article-body, .ai-terms-section, .ai-checkpoint-section, .ai-highlight-section, .related-widgets-section {
  background: var(--cream);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
}
.detail-article-body > .section-sub-title,
.ai-terms-section > .section-sub-title,
.ai-checkpoint-section > .section-sub-title,
.ai-highlight-section > .section-sub-title,
.related-widgets-section > .section-sub-title {
  color: var(--text1);
}
.rewritten-box { display: flex; flex-direction: column; gap: 10px; font-size: 14.5px; color: var(--text1); line-height: 1.8; background: var(--cream-soft); padding: 20px; border-radius: 14px; border: 1px solid var(--border); margin: 0; }
.briefing-sentence { margin: 0; padding: 4px 8px; border-radius: 6px; }
.briefing-sentence.is-highlighted { background: transparent; color: var(--ai); font-weight: inherit; box-shadow: none; }
.briefing-reference { margin-left: 3px; color: var(--primary, #ff5a1f); font-size: 10.5px; font-weight: 800; vertical-align: super; }
.highlight-list { display: flex; flex-direction: column; gap: 10px; }
.highlight-item-box { display: flex; align-items: flex-start; gap: 12px; background: var(--cream); border: 1px solid var(--border); padding: 15px; border-radius: 12px; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05); }
.fact-reference { flex-shrink: 0; min-width: 34px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 7px; background: var(--ai-bg-strong, #f5e6d3); color: var(--primary, #ff5a1f); font-size: 12px; font-weight: 800; }
.fact-content { min-width: 0; }
.hl-sentence { font-size: 14px; line-height: 1.55; font-weight: 800; color: var(--text1); margin: 0; }
.hl-reason { font-size: 12.5px; line-height: 1.5; color: var(--text3); margin: 6px 0 0; }
.highlight-empty-state { padding: 40px 20px; border: 1px dashed var(--border); border-radius: 12px; color: var(--text3); font-size: 13px; text-align: center; background: var(--cream-soft); }
.terms-pill-grid { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 8px; }
.term-detail-card { position: relative; min-width: 120px; max-width: 100%; background: var(--cream); border-radius: 10px; border: 1px solid var(--border); overflow: hidden; transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease; }
.term-detail-card:hover { background: #fff7ed; border-color: #dfc49e; box-shadow: 0 4px 14px rgba(184, 112, 63, 0.08); }
.term-detail-card[open] { background: var(--ai-bg); border-color: var(--ai-border); box-shadow: 0 4px 14px rgba(184, 112, 63, 0.08); }
.term-detail-card[open] { flex-basis: 100%; }
.term-badge-name { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 36px 10px 13px; color: var(--primary); font-size: 12.5px; font-weight: 800; cursor: pointer; list-style: none; user-select: none; }
.term-detail-card[open] .term-badge-name { padding-right: 76px; }
.term-badge-name::-webkit-details-marker { display: none; }
.term-toggle-icon { position: absolute; top: 50%; right: 13px; color: var(--ai, #b8703f); font-size: 16px; line-height: 1; transform: translateY(-50%); transition: transform 0.15s ease; }
.term-detail-card[open] .term-toggle-icon { transform: translateY(-50%) rotate(45deg); }
.term-explanation-box { padding: 4px 13px 13px; }
.term-explanation-txt { padding: 0; font-size: 13px; color: var(--text2); margin: 0; line-height: 1.65; }
.term-save-btn { display: none; position: absolute; top: 5px; right: 39px; z-index: 1; width: 30px; height: 30px; align-items: center; justify-content: center; padding: 0; border: 1px solid var(--primary-border); border-radius: 7px; background: var(--cream); color: var(--primary); cursor: pointer; transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease; }
.term-detail-card[open] .term-save-btn { display: inline-flex; }
.term-save-btn svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linejoin: round; }
.term-save-btn:hover:not(:disabled) { border-color: var(--primary); background: var(--primary); color: #ffffff; }
.term-save-btn.saved { border-color: var(--primary); background: var(--primary); color: #ffffff; }
.term-save-btn.saved svg { fill: currentColor; }
.term-save-btn:disabled { cursor: default; opacity: 0.5; }
.term-save-error { margin: 8px 0 0; color: #dc2626; font-size: 10.5px; line-height: 1.4; }
.checkpoint-list { padding: 15px 15px 15px 34px; color: var(--text1); font-size: 13.5px; line-height: 1.75; margin: 0; background: var(--cream); border: 1px solid var(--border); border-radius: 12px; }
.checkpoint-list li { margin-bottom: 6px; list-style-type: square; }
.related-widgets-section { margin-top: 0; }
.related-widgets-panel { width: 100%; }
.widget-tabs-bar { display: flex; background: var(--cream-soft); border: 1px solid var(--border); padding: 5px; border-radius: 999px; gap: 4px; }
.tab-btn { flex: 1; border: none; background: transparent; padding: 10px 0; font-size: 13px; font-weight: 700; color: var(--text2); border-radius: 999px; cursor: pointer; transition: all 0.15s ease; }
.tab-btn:hover { color: var(--primary, #ff5a1f); }
.tab-btn.active { background: linear-gradient(90deg, #ff5500, #ff9200); color: #ffffff; font-weight: 850; box-shadow: 0 0 20px rgba(255, 106, 0, 0.25); }
.widget-content-body { background: var(--cream); border: 1px solid var(--border); border-radius: 16px; padding: 20px; min-height: 420px; display: flex; flex-direction: column; margin-top: 14px; overflow: hidden; }
.pane-title-info { margin-bottom: 16px; }
.pane-title-info h4 { font-size: 11px; font-weight: 800; color: var(--text3); letter-spacing: 0.04em; margin: 0 0 2px 0; }
.pane-title-info p { font-size: 12px; color: var(--text2); margin: 0; }
.pane-title-info p span { color: var(--primary, #ff5a1f); font-weight: 700; }
.tab-pane-view { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.pane-component-scroller { flex: 1; overflow-y: auto; overflow-x: hidden; padding-right: 2px; }
.pane-component-scroller::-webkit-scrollbar { width: 4px; }
.pane-component-scroller::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.empty-pane-box { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 12.5px; color: var(--text3); border: 1px dashed var(--border); border-radius: 8px; }
.community-chat-container { flex: 1; display: flex; flex-direction: column; justify-content: space-between; min-height: 300px; }
.chat-scroller { flex: 1; min-height: 280px; display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; max-height: 320px; overflow-y: auto; }
.comment-state { flex: 1; min-height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 12px; color: var(--text3); font-size: 12.5px; text-align: center; }
.comment-state.error { color: #dc2626; }
.comment-state button { margin-top: 8px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--cream); color: var(--text2); cursor: pointer; }
.comment-entry { width: 100%; }
.chat-date-divider { display: flex; align-items: center; gap: 12px; width: 100%; margin: 12px 0 18px; color: #94a3b8; font-size: 10.5px; font-weight: 700; letter-spacing: 0.05em; }
.chat-date-divider::before, .chat-date-divider::after { content: ""; flex: 1; height: 1px; background: var(--border); }
.chat-date-divider span { white-space: nowrap; }
.comment-message-row { display: flex; align-items: flex-end; gap: 7px; width: 100%; }
.comment-message-row.received { justify-content: flex-start; }
.comment-message-row.sent { justify-content: flex-end; }
.comment-message-row.sent .msg { order: 2; }
.comment-message-row.sent .chat-time { order: 1; }
.msg { display: flex; flex-direction: column; max-width: 78%; padding: 10px; border-radius: 8px; font-size: 12.5px; line-height: 1.45; }
.msg.received { background: var(--cream); border: 1px solid var(--border); border-top-left-radius: 0; }
.msg.sent { background: var(--primary-bg, #fff5f1); border: 1px solid var(--primary-border, #ffe2d5); border-top-right-radius: 0; }
.comment-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.comment-menu { position: relative; margin: -5px -4px -3px 0; }
.comment-menu-trigger { width: 24px; height: 20px; border: none; background: transparent; color: var(--text3); font-size: 17px; line-height: 1; cursor: pointer; border-radius: 5px; }
.comment-menu-trigger:hover { background: rgba(255,244,235,0.9); color: #c2410c; }
.comment-menu-popover { position: absolute; top: 23px; right: 0; z-index: 5; min-width: 82px; padding: 4px; border: 1px solid var(--border); border-radius: 8px; background: var(--cream); box-shadow: 0 8px 24px rgba(15, 23, 42, 0.14); }
.comment-menu-popover button { display: block; width: 100%; padding: 7px 10px; border: none; border-radius: 5px; background: transparent; color: var(--text2); font-size: 11.5px; text-align: left; cursor: pointer; }
.comment-menu-popover button:hover { background: #fff1e8; color: #c2410c; }
.comment-menu-popover button:disabled, .edit-actions button:disabled { opacity: 0.45; cursor: not-allowed; }
.edit-actions button { border: none; background: transparent; color: var(--text3); font-size: 10.5px; cursor: pointer; }
.edit-actions button:hover { color: var(--primary, #ff5a1f); }
.chat-user { font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 2px; }
.msg.sent .chat-user { color: var(--primary, #ff5a1f); }
.msg-txt { margin: 4px 0 0; color: var(--text1); white-space: pre-wrap; overflow-wrap: anywhere; }
.chat-time { flex-shrink: 0; padding-bottom: 2px; color: var(--text3); font-size: 9.5px; white-space: nowrap; }
.comment-edit-input { width: 100%; margin-top: 6px; padding: 8px 10px; resize: vertical; border: 1px solid var(--primary-border); border-radius: 6px; outline: none; font: inherit; line-height: 1.45; }
.comment-edit-input:focus { border-color: var(--primary, #ff5a1f); }
.edit-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px; }
.edit-actions button:last-child { color: var(--primary, #ff5a1f); font-weight: 700; }
.comment-error { margin-bottom: 8px; color: #dc2626; font-size: 11.5px; }
.chat-footer-input-row { display: flex; gap: 8px; border-top: 1px solid var(--border); padding-top: 12px; }
.chat-input { flex: 1; background: var(--cream); border: 1px solid var(--border); border-radius: 9px; padding: 9px 12px; color: var(--text1); font-size: 12.5px; outline: none; }
.chat-input:focus { border-color: var(--primary); background: var(--cream); box-shadow: 0 0 0 3px rgba(255,106,0,.09); }
.chat-send-btn { background: var(--primary, #ff5a1f); color: #ffffff; border: none; padding: 0 14px; font-size: 12.5px; font-weight: 700; border-radius: 6px; cursor: pointer; }
.chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.comment-login-notice { border-top: 1px solid var(--border); padding-top: 14px; color: var(--text3); font-size: 12.5px; text-align: center; }
.comment-login-notice a { color: var(--primary, #ff5a1f); font-weight: 700; }
.dashboard-lower-analysis { margin-top: 24px; padding: 22px; background: var(--cream-soft); border: 1px solid var(--border); border-radius: 14px; }
.lower-section-title { font-size: 17px; font-weight: 800; margin: 0 0 20px; }
.ai-analysis-grid { display: flex; gap: 20px; }
@media (max-width: 768px) { .ai-analysis-grid { flex-direction: column; } }
.analysis-opinion-card { flex: 1; background-color: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 20px; border-top: 4px solid #64748b; }
.analysis-opinion-card.positive-side { border-top-color: #10b981; }
.analysis-opinion-card.negative-side { border-top-color: var(--primary, #ff5a1f); }
.opinion-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.opinion-card-header h3 { font-size: 15.5px; font-weight: 700; color: var(--text1); margin: 0; }
.opinion-status { display: inline-flex; align-items: center; justify-content: center; min-width: 38px; height: 24px; padding: 0 8px; border-radius: 999px; font-size: 10.5px; font-weight: 800; }
.opinion-status.positive { background: #ecfdf5; color: #047857; }
.opinion-status.caution { background: #fff1e8; color: #c2410c; }
.opinion-content-body { display: flex; flex-direction: column; gap: 12px; }
.opinion-reason-summary { font-size: 13.5px; color: var(--text1); line-height: 1.5; background: var(--cream); padding: 10px; border-radius: 6px; border: 1px solid var(--border); }
.opinion-sub-card { background: var(--cream); padding: 12px; border-radius: 6px; border: 1px solid var(--border); }
.opinion-label { font-size: 11px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; }
.opinion-desc { font-size: 13px; color: var(--text2); line-height: 1.5; margin: 0; }
.ai-summary-footer-bar { margin-top: 20px; background-color: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 16px; border-left: 4px solid var(--primary); font-size: 13.5px; line-height: 1.6; color: var(--text1); }

.report-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px;
  overflow-y: auto;
  background: rgba(17, 24, 39, 0.34);
  backdrop-filter: blur(7px);
  perspective: 1600px;
}
.report-paper {
  position: relative;
  width: min(1040px, 100%);
  min-height: calc(100vh - 64px);
  padding: 52px 58px;
  background:
    linear-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px),
    radial-gradient(circle at 90% 0%, rgba(255,106,0,.08), transparent 22%),
    var(--cream);
  background-size: 100% 32px;
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: 0 34px 100px rgba(15, 23, 42, 0.18), 0 0 42px rgba(255,106,0,.06);
  color: var(--text1);
  transform-origin: right center;
}
.report-paper::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 28px;
  width: 1px;
  background: #f6c08c;
}
.report-close-btn { position: absolute; top: 20px; right: 22px; width: 36px; height: 36px; border: 1px solid var(--border); border-radius: 50%; background: var(--cream); color: var(--text3); font-size: 23px; line-height: 1; cursor: pointer; transition: color 0.15s ease, border-color 0.15s ease, transform 0.15s ease; }
.report-close-btn:hover { color: var(--ai, #b8703f); border-color: var(--ai-border, #ecd9bc); transform: rotate(4deg); }
.report-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 32px; padding-bottom: 24px; border-bottom: 2px solid var(--border); }
.report-kicker { margin: 0 0 8px; color: var(--ai, #b8703f); font-size: 10.5px; font-weight: 850; letter-spacing: 0.14em; }
.report-header h2 { margin: 0; color: var(--text1); font-size: 34px; line-height: 1.2; letter-spacing: -0.04em; }
.report-news-title { max-width: 800px; margin: 14px 0 0; color: var(--text2); font-size: 16px; font-weight: 600; line-height: 1.65; }
.report-score { flex-shrink: 0; min-width: 120px; padding: 16px; border: 1px solid var(--ai-border, #ecd9bc); background: var(--ai-bg); text-align: center; }
.report-score span { display: block; color: var(--ai, #b8703f); font-size: 10.5px; font-weight: 750; }
.report-score strong { display: inline-block; margin-top: 5px; color: var(--ai, #b8703f); font-size: 32px; line-height: 1; }
.report-score small { color: var(--text3); font-size: 11px; }
.report-meta { display: flex; align-items: center; gap: 10px; padding: 16px 0; border-bottom: 1px solid var(--border); color: var(--text2); font-size: 13px; }
.report-meta > span:not(:last-child)::after { content: "/"; margin-left: 10px; color: var(--border); }
.report-sentiment { padding: 3px 8px; border-radius: 999px; font-weight: 750; }
.report-sentiment.up { background: var(--signal-up-bg, #fef2f2); color: var(--signal-up, #dc2626); }
.report-sentiment.down { background: var(--signal-down-bg, #eff6ff); color: var(--signal-down, #2563eb); }
.report-sentiment.neutral { background: var(--signal-neutral-bg, #f1f5f9); color: var(--signal-neutral, #64748b); }
.report-section { margin-top: 34px; }
.report-section-label { margin: 0 0 6px; color: var(--ai, #b8703f); font-size: 10.5px; font-weight: 850; letter-spacing: 0.13em; }
.report-section h3 { margin: 0 0 16px; color: var(--text1); font-size: 20px; }
.report-fact-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 0; padding: 0; list-style: none; }
.report-fact-list li { display: flex; gap: 10px; padding: 13px; border: 1px solid var(--border); background: var(--cream); }
.report-fact-list li > span { flex-shrink: 0; color: var(--ai, #b8703f); font-size: 11px; font-weight: 850; }
.report-fact-list p { margin: 0; color: var(--text1); font-size: 14.5px; font-weight: 650; line-height: 1.65; }
.report-analysis-grid { margin-top: 30px; }
.report-impact-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 16px; }
.report-impact-heading h3 { margin-bottom: 6px; }
.report-impact-heading p { margin: 0; color: var(--text3); font-size: 13.5px; }
.impact-scale-list { display: flex; flex-direction: column; gap: 8px; }
.impact-scale-item { display: grid; grid-template-columns: 90px 1fr; align-items: center; gap: 14px; padding: 11px 14px; border: 1px solid var(--border); background: var(--cream); color: var(--text2); }
.impact-scale-item strong { color: var(--text1); font-size: 14px; }
.impact-scale-item span { font-size: 14px; line-height: 1.5; }
.impact-scale-item.active { border-color: var(--ai-border, #ecd9bc); background: var(--ai-bg, #fdf6ee); box-shadow: inset 4px 0 0 var(--ai, #b8703f); }
.impact-scale-item.active strong, .impact-scale-item.active span { color: var(--ai, #b8703f); font-weight: 750; }
.report-sentiment-section { padding-top: 4px; }
.sentiment-decision-card { display: grid; grid-template-columns: 82px 1fr; gap: 18px; align-items: flex-start; padding: 20px; border: 1px solid var(--border); background: var(--cream-soft); }
.sentiment-decision-label { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; border-radius: 8px; font-size: 15px; font-weight: 850; }
.sentiment-decision-card h4 { margin: 0 0 8px; color: var(--text1); font-size: 17px; }
.sentiment-decision-card p { margin: 0; color: var(--text2); font-size: 15px; line-height: 1.7; }
.sentiment-decision-card.up { border-color: #fecaca; background: var(--signal-up-bg, #fef2f2); }
.sentiment-decision-card.up .sentiment-decision-label { background: #fee2e2; color: var(--signal-up, #dc2626); }
.sentiment-decision-card.down { border-color: #bfdbfe; background: var(--signal-down-bg, #eff6ff); }
.sentiment-decision-card.down .sentiment-decision-label { background: #dbeafe; color: var(--signal-down, #2563eb); }
.sentiment-decision-card.neutral { border-color: #cbd5e1; background: var(--cream-soft); }
.sentiment-decision-card.neutral .sentiment-decision-label { background: #e2e8f0; color: #475569; }
.report-checkpoints ul { display: flex; flex-direction: column; gap: 9px; margin: 0; padding: 16px; background: rgba(248,250,252,0.9); border: 1px solid var(--border); list-style: none; }
.report-checkpoints li { position: relative; padding: 12px 14px 12px 36px; border-bottom: 1px solid #e2e8f0; color: var(--text2); font-size: 14.5px; line-height: 1.65; }
.report-checkpoints li:last-child { border-bottom: 0; }
.report-checkpoints li::before { content: counter(list-item, decimal-leading-zero); position: absolute; left: 8px; top: 12px; color: var(--ai, #b8703f); font-size: 11px; font-weight: 850; }
.report-conclusion { display: grid; grid-template-columns: 120px 1fr; gap: 20px; margin-top: 30px; padding: 18px 20px; border-top: 2px solid var(--border); border-bottom: 1px solid var(--border); background: var(--cream); }
.report-conclusion span { color: var(--ai, #b8703f); font-size: 12.5px; font-weight: 850; }
.report-conclusion p { margin: 0; color: var(--text1); font-size: 15px; line-height: 1.75; }

.report-page-turn-enter-active { transition: opacity 0.24s ease; }
.report-page-turn-leave-active { transition: opacity 0.18s ease; }
.report-page-turn-enter-from, .report-page-turn-leave-to { opacity: 0; }
.report-page-turn-enter-active .report-paper { animation: report-page-open 0.52s cubic-bezier(0.2, 0.75, 0.25, 1) both; }
.report-page-turn-leave-active .report-paper { animation: report-page-close 0.2s ease both; }
@keyframes report-page-open {
  from { opacity: 0; transform: translateX(70px) rotateY(-18deg) scale(0.97); }
  to { opacity: 1; transform: translateX(0) rotateY(0) scale(1); }
}
@keyframes report-page-close {
  from { opacity: 1; transform: translateX(0) rotateY(0) scale(1); }
  to { opacity: 0; transform: translateX(35px) rotateY(-8deg) scale(0.98); }
}

@media (max-width: 1024px) {
  .dashboard-upper-grid { display: flex; flex-direction: column; }
  .upper-left-content, .upper-right-widgets { width: 100%; min-width: 0; }
}

@container news-detail (max-width: 760px) {
  .detail-scroll-area { padding: 18px; }
  .dashboard-upper-grid { display: flex; flex-direction: column; gap: 20px; }
  .upper-left-content, .upper-right-widgets { width: 100%; min-width: 0; }
  .upper-left-content { display: contents; }
  .upper-right-widgets { display: contents; }
  .detail-article-body { order: 1; margin-bottom: 0; }
  .ai-highlight-section { order: 2; }
  .ai-terms-section { order: 3; margin-bottom: 0; }
  .ai-checkpoint-section { order: 4; margin-bottom: 0; }
  .highlight-empty-state { order: 2; }
  .related-widgets-section { order: 5; }
  .detail-actions { width: auto; justify-content: flex-end; margin-left: auto; }
  .action-bar-row { align-items: center; flex-direction: row; }
}

@media (max-width: 768px) {
  .action-bar-row { align-items: center; gap: 12px; }
  .detail-actions { flex-wrap: nowrap; justify-content: flex-end; margin-left: auto; }
  .report-overlay { padding: 0; }
  .report-paper { min-height: 100vh; padding: 52px 24px 36px 38px; border: 0; border-radius: 0; }
  .report-paper::before { left: 20px; }
  .report-header { flex-direction: column; }
  .report-header h2 { font-size: 25px; }
  .report-score { width: 100%; }
  .report-fact-list { grid-template-columns: 1fr; }
  .report-impact-heading { flex-direction: column; }
  .impact-scale-item { grid-template-columns: 72px 1fr; }
  .sentiment-decision-card { grid-template-columns: 1fr; }
  .report-conclusion { grid-template-columns: 1fr; gap: 8px; }
}
</style>
