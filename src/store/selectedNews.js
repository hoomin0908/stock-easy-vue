import { ref } from "vue";

// 뉴스 카드 클릭 시 우측 패널(RightPanel)에 보여줄 기사를 공유하는 간단한 전역 상태.
// 나중에 상태가 복잡해지면 Pinia로 옮기면 됨.
export const selectedNews = ref(null);

export function selectNews(news) {
  selectedNews.value = news;
}
