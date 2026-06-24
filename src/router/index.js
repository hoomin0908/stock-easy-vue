import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "landing",
    component: () => import("../views/LandingView.vue"),
    meta: { authPage: true, hideTopNav: true },
  },
  {
    path: "/news",
    name: "news",
    // 1. 목록과 상세를 동시에 품는 부모 허브가 됩니다.
    component: () => import("../views/NewsFeedView.vue"),
    children: [
      {
        // 2. 주소가 /news/:id 로 바뀔 때 NewsFeedView 안의 <router-view /> 자리에 렌더링됩니다.
        path: ":id",
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
  {
    path: "/mypage",
    name: "mypage",
    component: () => import("../views/MyPageView.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginView.vue"),
    meta: { authPage: true },
  },
  {
    path: "/signup",
    name: "signup",
    component: () => import("../views/SignupView.vue"),
    meta: { authPage: true },
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
