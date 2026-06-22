<template>
  <div class="view-pad">
    <h2 class="view-title">관심 종목</h2>
    <!-- TODO: 팀원 accounts API 완성되면 fetchWatchlist()로 채우기 -->
    <div v-if="stocks.length === 0" class="empty-state" style="margin-top: 40px">
      등록한 관심 종목이 없어요
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
// import { fetchWatchlist } from "../services/api";

const stocks = ref([]);
</script>

<style scoped>
.view-pad { flex: 1; overflow-y: auto; padding: 20px 24px; }
.view-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
</style>
