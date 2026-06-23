<template>
  <div class="app">
    <TopNav />
    <div class="body">
      <Sidebar />
      <main class="main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import TopNav from "./components/layout/TopNav.vue";
import Sidebar from "./components/layout/Sidebar.vue";
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg);
}
.body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
