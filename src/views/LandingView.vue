<template>
  <div class="landing-page">
    <div class="landing-content">
      <!-- 로고 및 애니메이션 -->
      <div class="logo-section">
        <div class="animated-logo">
          <div class="logo-badge">
            <svg viewBox="0 0 16 16">
              <polyline points="1,12 5,7 9,10 15,3" />
            </svg>
          </div>
        </div>
        
        <h1 class="brand-name">
          <span class="letter" style="animation-delay: 0s">S</span>
          <span class="letter" style="animation-delay: 0.05s">T</span>
          <span class="letter" style="animation-delay: 0.1s">O</span>
          <span class="letter" style="animation-delay: 0.15s">C</span>
          <span class="letter" style="animation-delay: 0.2s">K</span>
          <span class="letter" style="animation-delay: 0.25s">E</span>
          <span class="letter" style="animation-delay: 0.3s">A</span>
          <span class="letter" style="animation-delay: 0.35s">S</span>
          <span class="letter" style="animation-delay: 0.4s">Y</span>
        </h1>
      </div>

      <!-- 소개 텍스트 -->
      <div class="intro-section">
        <p class="tagline">투자 뉴스를 더 똑똑하게</p>
        <p class="description">
          관심 종목의 실시간 뉴스와 AI 분석으로<br />
          당신의 투자 결정을 더 명확하게 만들어보세요
        </p>
      </div>

      <!-- 액션 버튼들 -->
      <div class="cta-section">
        <router-link to="/news" class="btn btn-primary">
          비회원으로 시작하기
        </router-link>
        
        <div class="btn-group">
          <router-link to="/signup" class="btn btn-secondary">
            회원가입
          </router-link>
          <router-link to="/login" class="btn btn-secondary">
            로그인
          </router-link>
        </div>
      </div>

      <!-- 데코레이션 -->
      <div class="decoration">
        <div class="float-dot dot-1"></div>
        <div class="float-dot dot-2"></div>
        <div class="float-dot dot-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../services/auth";

const router = useRouter();
const { isAuthenticated, initializeAuth } = useAuth();

onMounted(async () => {
  // 인증 상태 초기화
  await initializeAuth();
  
  // 이미 로그인되어 있으면 뉴스 피드로 리다이렉트
  if (isAuthenticated.value) {
    router.replace("/news");
  }
});
</script>

<style scoped>
.landing-page {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  background-image:
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.66) 0%,
      rgba(248, 250, 252, 0.5) 48%,
      rgba(255, 255, 255, 0.18) 100%
    ),
    url("../assets/images/landing-market-neutral-v2.png");
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
}

.landing-content {
  text-align: center;
  z-index: 10;
  position: relative;
  max-width: 600px;
  padding: 20px;
}

/* 로고 섹션 */
.logo-section {
  margin-bottom: 48px;
}

.animated-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  animation: float 3s ease-in-out infinite;
}

.logo-badge {
  width: 80px;
  height: 80px;
  border-radius: 20px;
 background: linear-gradient(
135deg,
#ff7a18,
#ff9f43
);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px rgba(255, 90, 31, 0.25);
}

.logo-badge svg {
  width: 48px;
  height: 48px;
  fill: none;
  stroke: #fff;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.brand-name {
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -1px;
  color: var(--text1);
  margin: 0;
  display: flex;
  justify-content: center;
  gap: 2px;
}

.letter {
  display: inline-block;
  animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
}

/* 소개 섹션 */
.intro-section {
  margin-bottom: 48px;
  opacity: 0;
  animation: fadeIn 0.8s ease-out 0.5s forwards;
}

.tagline {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 12px;
  letter-spacing: -0.3px;
}

.description {
  font-size: 16px;
  color: var(--text2);
  line-height: 1.8;
  margin: 0;
}

/* CTA 섹션 */
.cta-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  opacity: 0;
  animation: fadeIn 0.8s ease-out 0.7s forwards;
}

.btn {
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
  letter-spacing: -0.3px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, #ff7a3f 100%);
  color: #fff;
  box-shadow: 0 10px 30px rgba(255, 90, 31, 0.2);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(255, 90, 31, 0.3);
}

.btn-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-secondary {
  background: var(--cream);
  color: var(--text1);
  border: 2px solid var(--border);
}

.btn-secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-bg);
}

/* 데코레이션 */
.decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.float-dot {
  position: absolute;
  border-radius: 50%;
  background: var(--primary);
  opacity: 0.08;
}

.dot-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 5%;
  animation: float 4s ease-in-out infinite;
}

.dot-2 {
  width: 150px;
  height: 150px;
  bottom: 15%;
  right: 8%;
  animation: float 5s ease-in-out infinite;
  animation-delay: 1s;
}

.dot-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  right: 5%;
  animation: float 3.5s ease-in-out infinite;
  animation-delay: 2s;
}

/* 애니메이션 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 반응형 */
@media (max-width: 600px) {
  .landing-page {
    background-image:
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.88) 0%,
        rgba(248, 250, 252, 0.78) 55%,
        rgba(255, 255, 255, 0.48) 100%
      ),
      url("../assets/images/landing-market-neutral-v2.png");
    background-position: 62% center;
  }

  .brand-name {
    font-size: 42px;
  }

  .tagline {
    font-size: 18px;
  }

  .description {
    font-size: 15px;
  }

  .btn {
    padding: 12px 20px;
    font-size: 15px;
  }
}
</style>
