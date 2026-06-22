<template>
  <nav class="top-nav">
    <router-link class="logo" to="/">
      <div class="logo-badge">
        <svg viewBox="0 0 16 16"><polyline points="1,12 5,7 9,10 15,3" /></svg>
      </div>
      STOCKEASY
    </router-link>

    <div class="nav-tabs">
      <router-link class="nav-tab" to="/" active-class="active">뉴스</router-link>
      <router-link class="nav-tab" to="/watchlist" active-class="active">관심종목</router-link>
      <router-link class="nav-tab" to="/glossary" active-class="active">용어사전</router-link>
      <router-link class="nav-tab" to="/saved" active-class="active">저장됨</router-link>
    </div>

    <div class="nav-right">
      <div class="icon-btn" title="검색 (TODO: 검색 기능)">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
      </div>
      <div class="icon-btn" title="알림 (TODO: 알림 기능)">
        <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
      </div>
      <!-- TODO: 로그인 연동 전까지는 더미 아바타 -->
      <div class="avatar">유저</div>
    </div>
  </nav>
</template>

<style scoped>
.top-nav {
  height: 52px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: var(--bg);
  position: sticky;
  top: 0;
  z-index: 100;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 600;
  color: var(--text1);
  margin-right: 32px;
}
.logo-badge {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: var(--blue);
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-badge svg { width: 14px; height: 14px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; }
.nav-tabs { display: flex; height: 52px; }
.nav-tab {
  display: flex;
  align-items: center;
  padding: 0 18px;
  font-size: 14px;
  color: var(--text2);
  border-bottom: 2.5px solid transparent;
  white-space: nowrap;
}
.nav-tab:hover { color: var(--text1); }
.nav-tab.active { color: var(--blue); border-bottom-color: var(--blue); font-weight: 500; }
.nav-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  background: var(--bg2);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.icon-btn svg { width: 18px; height: 18px; stroke: var(--text2); stroke-width: 1.8; fill: none; stroke-linecap: round; }
.avatar {
  height: 34px;
  padding: 0 12px;
  border-radius: 17px;
  background: var(--blue);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}
</style>
