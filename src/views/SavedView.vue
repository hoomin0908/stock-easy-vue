<template>
  <div class="view-pad">
    <h2 class="view-title">저장됨</h2>
    <!-- TODO: 팀원 accounts API(북마크) 완성되면 채우기 -->
    <div v-if="savedItems.length === 0" class="empty-state" style="margin-top: 40px">
      저장한 기사나 용어가 없어요
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const savedItems = ref([]);
</script>

<style scoped>
.view-pad { flex: 1; overflow-y: auto; padding: 20px 24px; }
.view-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
</style>
