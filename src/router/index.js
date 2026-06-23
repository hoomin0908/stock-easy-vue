import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "news",
    // 1. 목록과 상세를 동시에 품는 부모 허브가 됩니다.
    component: () => import("../views/NewsFeedView.vue"), 
    children: [
      {
        // 2. 주소가 /news/:id 로 바뀔 때 NewsFeedView 안의 <router-view /> 자리에 렌더링됩니다.
        path: "news/:id",
        name: "newsDetail",
        component: () => import("../views/NewsDetailView.vue"),
        props: true,
      }
    ]
  },
  {
    path: "/watchlist",
    name: "watchlist",
    component: () => import("../views/WatchlistView.vue"),
  },
  {
    path: "/glossary",
    name: "glossary",
    component: () => import("../views/GlossaryView.vue"),
  },
  {
    path: "/saved",
    name: "saved",
    component: () => import("../views/SavedView.vue"),
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});