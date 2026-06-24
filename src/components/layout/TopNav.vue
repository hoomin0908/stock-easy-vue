<template>
  <nav class="top-nav">
    <router-link class="logo" :to="logoLink">
      <div class="logo-badge">
        <svg viewBox="0 0 16 16"><polyline points="1,12 5,7 9,10 15,3" /></svg>
      </div>
      STOCKEASY
    </router-link>

    <div v-if="!route.meta.authPage" class="nav-tabs">
      <router-link class="nav-tab" to="/news" active-class="active">뉴스</router-link>
      <router-link class="nav-tab" to="/watchlist" active-class="active">관심종목</router-link>
      <router-link class="nav-tab" to="/glossary" active-class="active">용어사전</router-link>
      <router-link class="nav-tab" to="/saved" active-class="active">저장목록</router-link>
    </div>

    <div class="nav-right">
      <button
        type="button"
        class="theme-toggle-btn"
        :title="themeMode === 'dark' ? '라이트 테마로 전환' : '다크 테마로 전환'"
        @click="toggleTheme"
      >
        <svg v-if="themeMode === 'dark'" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      </button>

      <form
        v-if="isAuthenticated"
        class="top-search-form"
        :class="{ active: isSearchOpen || searchKeyword }"
        role="search"
        @submit.prevent="submitSearch"
      >
        <input
          v-if="isSearchOpen || searchKeyword"
          ref="searchInput"
          v-model.trim="searchKeyword"
          type="search"
          class="top-search-input"
          placeholder="주제 검색"
          aria-label="뉴스 주제 검색"
          @keydown.esc="closeSearch"
        />
        <button
          type="button"
          class="icon-btn"
          title="뉴스 주제 검색"
          aria-label="뉴스 주제 검색"
          @click="handleSearchButtonClick"
        >
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </button>
      </form>
      <template v-if="isAuthenticated">
        <div class="avatar">{{ displayName }}</div>
        <button class="logout-btn" :disabled="isLoggingOut" @click="handleLogout">
          {{ isLoggingOut ? "로그아웃 중" : "로그아웃" }}
        </button>
      </template>

      <template v-else>
        <router-link class="auth-link" :to="loginLink">로그인</router-link>
        <router-link class="signup-link" to="/signup">회원가입</router-link>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { computed, inject, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "../../services/auth";

const route = useRoute();
const router = useRouter();
const { currentUser, isAuthenticated, logout } = useAuth();
const isLoggingOut = ref(false);
const themeMode = inject("themeMode", ref("light"));
const toggleTheme = inject("toggleTheme", () => {});
const isSearchOpen = ref(false);
const searchKeyword = ref("");
const searchInput = ref(null);

const displayName = computed(
  () => currentUser.value?.nickname || currentUser.value?.email || "사용자"
);

const logoLink = computed(() => {
  return isAuthenticated.value ? "/news" : "/";
});

const loginLink = computed(() => ({
  path: "/login",
  query: route.meta.authPage ? {} : { redirect: route.fullPath },
}));

watch(
  () => route.query.sector,
  (sector) => {
    searchKeyword.value = typeof sector === "string" ? sector : "";
    isSearchOpen.value = Boolean(searchKeyword.value);
  },
  { immediate: true }
);

async function openSearch() {
  isSearchOpen.value = true;
  await nextTick();
  searchInput.value?.focus();
}

function closeSearch() {
  if (searchKeyword.value) return;
  isSearchOpen.value = false;
}

function handleSearchButtonClick() {
  if (!isSearchOpen.value && !searchKeyword.value) {
    openSearch();
    return;
  }

  submitSearch();
}

function submitSearch() {
  const keyword = searchKeyword.value.trim();

  if (!keyword) {
    if (route.query.sector) {
      const query = { ...route.query };
      delete query.sector;
      router.push({ path: "/news", query });
    }
    isSearchOpen.value = false;
    return;
  }

  router.push({
    path: "/news",
    query: { sector: keyword },
  });
}

async function handleLogout() {
  if (isLoggingOut.value) return;

  isLoggingOut.value = true;
  try {
    await logout();
    await router.push("/");
  } catch (error) {
    console.error("로그아웃 실패", error);
    window.alert("로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  } finally {
    isLoggingOut.value = false;
  }
}
</script>

<style scoped>
.top-nav {
  height: 68px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 32px;
  background: var(--cream);
  backdrop-filter: blur(16px);
  position: sticky;
  top: 0;
  z-index: 100;
}
.top-nav .logo { color: var(--text1); }
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 850;
  color: var(--text1);
  margin-right: 32px;
  letter-spacing: -0.6px;
}
.logo-badge {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 22px rgba(255, 106, 0, 0.42);
}
.logo-badge svg { width: 14px; height: 14px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; }
.nav-tabs { display: flex; height: 68px; }
.nav-tab {
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 13.5px;
  font-weight: 650;
  color: var(--text2);
  border-bottom: 2.5px solid transparent;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.nav-tab:hover { color: var(--text1); }
.nav-tab.active {
  color: var(--text1);
  border-bottom-color: var(--primary);
  font-weight: 800;
  text-shadow: 0 0 18px rgba(255, 106, 0, 0.3);
}

.nav-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.top-search-form {
  display: flex;
  align-items: center;
  gap: 6px;
}
.top-search-form.active {
  min-width: 190px;
}
.top-search-input {
  width: 150px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--cream);
  color: var(--text1);
  padding: 0 10px;
  font-size: 12.5px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, width 0.15s ease;
}
.top-search-input:focus {
  width: 180px;
  border-color: var(--primary-border);
  box-shadow: 0 0 0 3px rgba(255, 106, 0, 0.08);
}
.top-search-input::placeholder { color: var(--text3); }
.theme-toggle-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  background: var(--cream);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}
.theme-toggle-btn:hover { border-color: var(--primary-border); box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06); }
.theme-toggle-btn svg { width: 18px; height: 18px; stroke: var(--text2); stroke-width: 1.8; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  background: var(--cream);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}
.icon-btn:hover { border-color: var(--primary-border); box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06); }
.icon-btn svg { width: 18px; height: 18px; stroke: var(--text2); stroke-width: 1.8; fill: none; stroke-linecap: round; }

.avatar {
  height: 34px;
  padding: 0 12px;
  border-radius: 17px;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}
.auth-link, .logout-btn {
  border: 1px solid var(--border);
  background: var(--cream);
  color: var(--text2);
  padding: 8px 13px;
  border-radius: var(--radius);
  font-size: 12.5px;
  cursor: pointer;
}
.auth-link:hover, .logout-btn:hover { border-color: var(--primary-border); color: var(--primary); box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06); }
.signup-link {
  background: var(--primary);
  color: #ffffff;
  padding: 8px 14px;
  border-radius: var(--radius);
  font-size: 12.5px;
  font-weight: 600;
}
.signup-link:hover { background: var(--primary-hover); }
.logout-btn:disabled { opacity: 0.55; cursor: not-allowed; }

@media (max-width: 900px) {
  .top-search-form.active { min-width: 150px; }
  .top-search-input,
  .top-search-input:focus { width: 112px; }
}
</style>
