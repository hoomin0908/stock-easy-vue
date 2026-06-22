<template>
  <aside class="right-panel">
    <div v-if="!selectedNews" class="empty-state" style="height: 100%">
      <svg viewBox="0 0 24 24" width="32" height="32"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="currentColor" stroke-width="1.6" fill="none" /></svg>
      뉴스를 선택하면<br />종목별 영향 분석을 볼 수 있어요
    </div>

    <template v-else>
      <div class="rp-sec">
        <div class="rp-title">
          <svg viewBox="0 0 24 24"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12" /></svg>
          선택 기사 영향 분석
        </div>
        <div class="rp-sub">「{{ selectedNews.title }}」 기준</div>

        <!-- StockImpact 모델: stock, sentiment, strength, confidenceScore, reasoning -->
        <div v-if="!selectedNews.stockImpacts?.length" class="empty-state" style="padding: 24px 0">
          연결된 종목 영향 분석이 없어요
        </div>
        <div v-for="impact in selectedNews.stockImpacts" :key="impact.stockCode" class="impact-card">
          <div class="impact-name">{{ impact.stockName }}</div>
          <div class="bar-wrap">
            <span class="bar-label" :style="{ color: impact.sentiment === 'NEGATIVE' ? 'var(--blue)' : 'var(--red)' }">
              {{ sentimentLabel(impact.sentiment) }}
            </span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: impact.confidenceScore + '%' }"></div>
            </div>
            <span class="bar-val">{{ strengthLabel(impact.strength) }}</span>
          </div>
        </div>

        <div v-if="selectedNews.analysis?.rewrittenContent" class="ai-box">
          {{ selectedNews.analysis.rewrittenContent }}
        </div>
      </div>

      <div class="rp-sec">
        <div class="rp-title">
          <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          이 기사의 용어
        </div>
        <!-- TODO: 용어사전 모델/API 나오면 채우기 -->
        <div class="empty-state" style="padding: 16px 0">아직 용어사전 기능이 없어요</div>
      </div>
    </template>
  </aside>
</template>

<script setup>
import { selectedNews } from "../../store/selectedNews";

function sentimentLabel(s) {
  return { POSITIVE: "호재", NEGATIVE: "악재", NEUTRAL: "중립" }[s] || "-";
}
function strengthLabel(s) {
  return { WEAK: "약함", MODERATE: "보통", STRONG: "강함", VERY_STRONG: "매우 강함" }[s] || "-";
}
</script>

<style scoped>
.right-panel {
  width: var(--right-w);
  flex-shrink: 0;
  border-left: 1px solid var(--border);
  overflow-y: auto;
  padding: 18px 16px;
  color: var(--text3);
  font-size: 13px;
  line-height: 1.6;
}
.rp-sec { margin-bottom: 28px; }
.rp-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text1);
  margin-bottom: 10px;
}
.rp-title svg { width: 15px; height: 15px; stroke: var(--text1); stroke-width: 1.8; fill: none; }
.rp-sub { font-size: 12px; color: var(--text3); margin-bottom: 12px; }
.impact-card { border: 1px solid var(--border); border-radius: var(--radius); padding: 10px; margin-bottom: 8px; }
.impact-name { font-size: 13px; font-weight: 600; color: var(--text1); margin-bottom: 6px; }
.bar-wrap { display: flex; align-items: center; gap: 8px; }
.bar-label { font-size: 11px; font-weight: 600; width: 28px; flex-shrink: 0; }
.bar-track { flex: 1; height: 6px; border-radius: 3px; background: var(--bg3); overflow: hidden; }
.bar-fill { height: 100%; background: var(--red); border-radius: 3px; }
.bar-val { font-size: 11px; color: var(--text2); white-space: nowrap; }
.ai-box {
  margin-top: 12px;
  padding: 10px;
  background: var(--blue-bg);
  border-radius: var(--radius);
  font-size: 12px;
  color: var(--blue-text);
}
</style>
