import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "news",
    component: () => import("../views/NewsFeedView.vue"),
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
