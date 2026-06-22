<template>
  <aside class="sidebar" :class="{ collapsed: !isOpen }">
    <button class="toggle-btn" :title="isOpen ? '사이드바 닫기' : '사이드바 열기'" @click="isOpen = !isOpen">
      <svg viewBox="0 0 24 24" :style="{ transform: isOpen ? 'none' : 'rotate(180deg)' }">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="9" y1="4" x2="9" y2="20" />
        <polyline points="6,9 4,12 6,15" style="display:none" />
      </svg>
    </button>

    <nav class="section-nav">
      <button
        v-for="sec in sections"
        :key="sec.key"
        class="section-btn"
        :class="{ active: activeSection === sec.key }"
        :title="sec.label"
        @click="selectSection(sec.key)"
      >
        <svg viewBox="0 0 24 24" v-html="sec.icon"></svg>
        <span v-if="isOpen" class="section-label">{{ sec.label }}</span>
      </button>
    </nav>

    <div v-if="isOpen" class="section-content">
      <!-- 관심 종목 -->
      <div v-if="activeSection === 'watchlist'">
        <div v-if="watchlist.length === 0" class="empty-state" style="padding: 24px 4px">
          아직 등록한 관심 종목이 없어요
        </div>
        <div v-for="stock in watchlist" :key="stock.id" class="stock-item">
          <div class="stock-ticker">{{ stock.shortName }}</div>
          <div>
            <div class="stock-name">{{ stock.name }}</div>
            <div class="stock-price">{{ stock.price }}</div>
          </div>
        </div>
        <div class="add-btn">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          종목 추가
        </div>
      </div>

      <!-- 업종 필터 -->
      <div v-else-if="activeSection === 'sector'">
        <div class="sector-list">
          <div
            v-for="sector in sectors"
            :key="sector"
            class="sector-chip"
            :class="{ active: sector === activeSector }"
            @click="activeSector = sector"
          >
            {{ sector }}
          </div>
        </div>
      </div>

      <!-- 저장된 용어 -->
      <div v-else-if="activeSection === 'terms'">
        <div v-if="savedTerms.length === 0" class="empty-state" style="padding: 24px 4px">
          저장한 용어가 없어요
        </div>
        <div class="word-pills">
          <span v-for="term in savedTerms" :key="term.id" class="word-pill">{{ term.name }}</span>
        </div>
      </div>
    </div>

    <div class="sidebar-footer">
      <!-- TODO: 로그인 연동 전까지는 더미 -->
      <div class="user-row">
        <div class="avatar">유저</div>
        <div v-if="isOpen" class="user-info">
          <div class="user-name">홍길동</div>
        </div>
        <button v-if="isOpen" class="icon-btn-sm" title="설정">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from "vue";

const isOpen = ref(true);

const sections = [
  {
    key: "watchlist",
    label: "관심 종목",
    icon: '<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />',
  },
  {
    key: "sector",
    label: "업종 필터",
    icon: '<rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />',
  },
  {
    key: "terms",
    label: "저장된 용어",
    icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />',
  },
];

const activeSection = ref("watchlist");

function selectSection(key) {
  activeSection.value = key;
  if (!isOpen.value) isOpen.value = true; // 접혀있을 때 아이콘 누르면 펼치면서 해당 섹션 보여줌
}

// TODO: 팀원 API 연동 전까지는 빈 배열
const watchlist = ref([]);
const savedTerms = ref([]);

const sectors = ["전체", "반도체", "IT · 플랫폼", "자동차", "바이오", "금융", "에너지"];
const activeSector = ref("전체");
</script>

<style scoped>
.sidebar {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  transition: width 0.18s ease;
  overflow: hidden;
}
.sidebar.collapsed { width: 56px; }

.toggle-btn {
  width: 28px;
  height: 28px;
  margin: 0 0 14px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--text3);
}
.toggle-btn:hover { background: var(--bg2); color: var(--text1); }
.toggle-btn svg { width: 17px; height: 17px; stroke: currentColor; stroke-width: 1.7; fill: none; transition: transform 0.18s ease; }

.section-nav { display: flex; flex-direction: column; gap: 2px; padding: 0 8px; }
.section-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border: none;
  background: transparent;
  border-radius: var(--radius);
  cursor: pointer;
  color: var(--text2);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
}
.section-btn:hover { background: var(--bg2); }
.section-btn.active { background: var(--blue-bg); color: var(--blue); font-weight: 600; }
.section-btn svg { width: 17px; height: 17px; stroke: currentColor; stroke-width: 1.7; fill: none; flex-shrink: 0; }
.section-label { overflow: hidden; text-overflow: ellipsis; }

.section-content {
  flex: 1;
  overflow-y: auto;
  padding: 14px 14px 0;
  margin-top: 4px;
  border-top: 1px solid var(--border);
}

.stock-item { display: flex; align-items: center; gap: 10px; padding: 8px 5px; border-radius: var(--radius); cursor: pointer; }
.stock-item:hover { background: var(--bg2); }
.stock-ticker {
  width: 36px; height: 36px; border-radius: var(--radius); flex-shrink: 0;
  background: var(--bg2); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 600; color: var(--text2);
}
.stock-name { font-size: 13px; font-weight: 500; }
.stock-price { font-size: 11px; color: var(--text2); margin-top: 1px; }
.add-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 5px;
  font-size: 12px; color: var(--text3); border: 1px dashed var(--border);
  border-radius: var(--radius); margin-top: 6px; cursor: pointer;
}
.add-btn svg { width: 14px; height: 14px; stroke: var(--text3); stroke-width: 2; fill: none; }

.word-pills { display: flex; flex-wrap: wrap; gap: 4px; }
.word-pill { padding: 4px 9px; border-radius: 20px; background: var(--amber-bg); border: 1px solid var(--amber-border); font-size: 11px; color: var(--amber); }

.sector-list { display: flex; flex-direction: column; gap: 4px; }
.sector-chip { padding: 7px 10px; border-radius: var(--radius); font-size: 12px; border: 1px solid var(--border); color: var(--text2); cursor: pointer; }
.sector-chip:hover { background: var(--bg2); }
.sector-chip.active { background: var(--blue); color: #fff; border-color: var(--blue); font-weight: 500; }

.sidebar-footer { border-top: 1px solid var(--border); padding: 10px 8px 4px; margin-top: 8px; }
.user-row { display: flex; align-items: center; gap: 8px; }
.avatar {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  background: var(--blue); color: #fff; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 12.5px; font-weight: 600; color: var(--text1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.icon-btn-sm {
  width: 28px; height: 28px; flex-shrink: 0; border: none; background: transparent;
  border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text3);
}
.icon-btn-sm:hover { background: var(--bg2); color: var(--text1); }
.icon-btn-sm svg { width: 16px; height: 16px; stroke: currentColor; stroke-width: 1.7; fill: none; }
</style>
