<template>
  <div class="split-container">
    <aside class="list-side" :class="{ 'has-detail': route.params.id }">
      <div class="filter-bar">
        <button
          v-for="f in filters"
          :key="f.value"
          class="filter-chip"
          :class="{ active: activeFilter === f.value }"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>

      <div class="list-scroll">
        <div v-if="displayNewsList.length === 0" class="empty-state" style="margin-top: 40px">
          <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="1.6" fill="none">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          표시할 뉴스가 없어요<br />
          <span style="font-size: 11px; color: var(--text3)">선택하신 테마 조건의 기사가 부재합니다.</span>
        </div>

        <NewsCard 
          v-for="newsItem in displayNewsList" 
          :key="newsItem.id" 
          :news="newsItem" 
          :class="{ active: route.params.id == newsItem.id }"
        />
      </div>
    </aside>

    <section class="detail-side">
      <div v-if="!route.params.id" class="empty-state select-notice">
        <svg class="notice-icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        
        <h3>StockEasy 실시간 AI 브리핑</h3>
        
        <p v-if="activeFilter === 'ALL'">
          현재 시장에 총 <strong>{{ displayNewsList.length }}개</strong>의 실시간 뉴스가 수신되었습니다.<br>
          상단의 <strong>호재 / 악재</strong> 필터를 선택하시면 감정별 뉴스만 모아 볼 수 있습니다.
        </p>
        <p v-else-if="activeFilter === 'POSITIVE'">
          현재 시장의 <span style="color: #22c55e; font-weight: 600;">호재성 모멘텀</span>을 지닌 뉴스 <strong>{{ displayNewsList.length }}개</strong>를 분석 중입니다.<br>
          상승 여력이 있는 종목의 팩트를 왼쪽 피드에서 확인해 보세요.
        </p>
        <p v-else-if="activeFilter === 'NEGATIVE'">
          현재 리스크 관리가 필요한 <span style="color: #ef4444; font-weight: 600;">악재성 리스크</span> 뉴스 <strong>{{ displayNewsList.length }}개</strong>가 노출 중입니다.<br>
          주요 지지선 및 하방 압력 요소를 체크하세요.
        </p>
        <p v-else>
          시장에 중립적인 영향을 미치는 뉴스 <strong>{{ displayNewsList.length }}개</strong>를 표시 중입니다.
        </p>
      </div>

      <router-view v-else :news-list="newsList" />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, inject } from "vue";
import { useRoute } from "vue-router";
import NewsCard from "../components/news/NewsCard.vue";
import { fetchNewsFeed } from "../services/api";

const route = useRoute();

// App.vue로부터 전역 주식 필터 Inject
const selectedStockFilter = inject("selectedStockFilter", ref(null));

const filters = [
  { label: "전체", value: "ALL" },
  { label: "호재", value: "POSITIVE" },
  { label: "악재", value: "NEGATIVE" },
  { label: "중립", value: "NEUTRAL" },
];
const activeFilter = ref("ALL");
const newsList = ref([]);

// 💡 백엔드 시리얼라이저 수정 없이 프론트엔드 단에서 테마별 연관 키워드를 맵핑하여 해결
const themeKeywords = {
  "반도체": ["반도체", "칩", "삼성전자", "SK하이닉스", "엔비디아", "파운드리", "HBM", "설계"],
  "IT · 플랫폼": ["IT", "플랫폼", "네이버", "카카오", "구글", "소프트웨어", "포털", "웹툰", "서비스"],
  "자동차": ["자동차", "차량", "현대차", "기아", "완성차", "모빌리티", "부품", "전기차"],
  "바이오": ["바이오", "제약", "헬스케어", "임상", "신약", "셀트리온", "삼성바이오", "의료", "백신"],
  "금융": ["금융", "은행", "금리", "환율", "KB국민", "신한", "우리", "하나", "증권", "투자", "대출"],
  "에너지": ["에너지", "정유", "태양광", "풍력", "정유", "유가", "석유", "가스", "전력", "발전"],
  "2차전지": ["2차전지", "배터리", "양극재", "에코프로", "포스코퓨처", "LG엔솔", "삼성SDI", "리튬"],
  "엔터테인먼트": ["엔터", "하이브", "SM", "JYP", "YG", "콘서트", "음원", "K팝", "드라마", "영화"],
  "우주항공": ["우주", "항공", "위성", "발사체", "KAI", "한화에어로", "드론", "UAM", "방산"],
  "인공지능(AI)": ["인공지능", "AI", "챗GPT", "LLM", "딥러닝", "머신러닝", "생성형", "로봇"]
};

const loadNews = async () => {
  try {
    const params = activeFilter.value !== "ALL" ? { sentiment: activeFilter.value.toLowerCase() } : {};
    const response = await fetchNewsFeed(params);
    newsList.value = response.data || [];
  } catch (error) {
    console.error("API 요청 실패:", error);
  }
};

// 💡 관련 뉴스가 빠짐없이 쏟아져 나오도록 유연하게 확장한 연관어 필터 로직
const displayNewsList = computed(() => {
  let list = newsList.value;

  // 1. 관심 기업 필터 처리
  if (selectedStockFilter.value) {
    list = list.filter(n => {
      const matchImpact = n.related_stocks?.some(s => s.stock_name === selectedStockFilter.value);
      const matchTitle = n.title?.includes(selectedStockFilter.value);
      return matchImpact || matchTitle;
    });
  }

  // 2. 🎯 사이드바 인기 테마 필터링 (연관 키워드 배열 기반 전수 매핑)
  if (route.query.sector) {
    const targetTheme = route.query.sector;
    const keywords = themeKeywords[targetTheme];

    // 만약 정의된 연관 키워드 뭉치가 있다면 복합 검색 가동
    if (keywords && keywords.length > 0) {
      list = list.filter(n => {
        const titleLower = n.title?.toLowerCase() || "";
        const contentLower = n.content?.toLowerCase() || "";

        // 등록된 연관어 중 하나라도 제목이나 본문에 들어가 있는지 체크!
        return keywords.some(keyword => {
          const kwLower = keyword.toLowerCase();
          return titleLower.includes(kwLower) || contentLower.includes(kwLower);
        });
      });
    } else {
      // 키워드 사전이 없는 예외 상황일 때는 단순 텍스트 서칭으로 롤백 방어
      list = list.filter(n => {
        return n.title?.toLowerCase().includes(targetTheme.toLowerCase()) || 
               n.content?.toLowerCase().includes(targetTheme.toLowerCase());
      });
    }
  }

  return list;
});

onMounted(() => {
  loadNews();
});

watch(activeFilter, () => {
  loadNews();
});

watch(() => route.query.sector, () => {
  loadNews();
});
</script>

<style scoped>
.split-container { display: flex; width: 100%; height: 100%; background: var(--bg); overflow: hidden; }
.list-side { flex: 2; min-width: 420px; border-right: 1px solid var(--border); display: flex; flex-direction: column; background: var(--bg2); transition: flex 0.3s ease, width 0.3s ease; }
.list-side.has-detail { flex: 0.7; min-width: 380px; max-width: 420px; }
.filter-bar { display: flex; gap: 8px; padding: 16px; background: var(--bg); border-bottom: 1px solid var(--border); }
.filter-chip { padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg); font-size: 12.5px; color: var(--text2); cursor: pointer; transition: all 0.15s ease; }
.filter-chip:hover { border-color: var(--primary-border); color: var(--primary); }
.filter-chip.active { background: var(--primary); color: #ffffff; border-color: var(--primary); font-weight: 600; }
.list-scroll { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.detail-side { flex: 1.3; min-width: 0; height: 100%; background: var(--bg); display: flex; flex-direction: column; }
.select-notice { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px; }
.select-notice h3 { font-size: 16px; font-weight: 700; color: var(--text1); margin-top: 16px; }
.select-notice p { color: var(--text3); font-size: 13px; line-height: 1.6; margin-top: 8px; }
.notice-icon { width: 40px; height: 40px; stroke: var(--text3); stroke-width: 1.5; fill: none; }
</style>