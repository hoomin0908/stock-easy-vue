<template>
  <div class="auth-page">
    <section class="auth-card">
      <div class="auth-heading">
        <span class="auth-kicker">STOCKEASY ACCOUNT</span>
        <h1>로그인</h1>
        <p>관심 종목과 토론 기능을 이어서 이용해보세요.</p>
      </div>

      <p v-if="route.query.signup === 'success'" class="success-message">
        회원가입이 완료되었습니다. 로그인해 주세요.
      </p>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <label class="field">
          <span>이메일</span>
          <input
            v-model.trim="form.email"
            type="email"
            autocomplete="email"
            placeholder="test@test.com"
            required
          />
        </label>

        <label class="field">
          <span>비밀번호</span>
          <input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="비밀번호를 입력하세요"
            required
          />
        </label>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <button class="submit-btn" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "로그인 중..." : "로그인" }}
        </button>
      </form>

      <p class="auth-switch">
        아직 계정이 없나요?
        <router-link to="/signup">회원가입</router-link>
      </p>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "../services/auth";

const route = useRoute();
const router = useRouter();
const { isAuthenticated, login } = useAuth();

const form = reactive({
  email: typeof route.query.email === "string" ? route.query.email : "",
  password: "",
});
const isSubmitting = ref(false);
const errorMessage = ref("");

onMounted(() => {
  if (isAuthenticated.value) router.replace("/");
});

function getErrorMessage(error) {
  const data = error.response?.data;
  return (
    data?.detail ||
    data?.non_field_errors?.[0] ||
    data?.email?.[0] ||
    "이메일 또는 비밀번호를 확인해 주세요."
  );
}

async function handleSubmit() {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    await login({
      email: form.email,
      password: form.password,
    });

    const redirect =
      typeof route.query.redirect === "string" &&
      route.query.redirect.startsWith("/") &&
      !route.query.redirect.startsWith("//")
        ? route.query.redirect
        : "/";

    await router.replace(redirect);
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.auth-page { flex: 1; overflow-y: auto; display: grid; place-items: center; padding: 48px 20px; background: linear-gradient(135deg, #fff8f4 0%, #f8fafc 52%, #ffffff 100%); }
.auth-card { width: min(100%, 430px); padding: 36px; border: 1px solid var(--border); border-radius: 18px; background: rgba(255, 255, 255, 0.96); box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08); }
.auth-heading { margin-bottom: 26px; }
.auth-kicker { color: var(--primary); font-size: 10.5px; font-weight: 800; letter-spacing: 0.12em; }
.auth-heading h1 { margin-top: 12px; font-size: 38px; font-weight: 700; letter-spacing: -0.5px; }
.auth-heading p { margin-top: 8px; color: var(--text3); font-size: 13px; line-height: 1.6; }
.auth-form { display: flex; flex-direction: column; gap: 17px; }
.field { display: flex; flex-direction: column; gap: 7px; }
.field span { color: var(--text2); font-size: 12.5px; font-weight: 700; }
.field input { width: 100%; padding: 12px 13px; border: 1px solid var(--border); border-radius: 9px; outline: none; font-size: 14px; }
.field input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(255, 90, 31, 0.1); }
.submit-btn { margin-top: 5px; padding: 12px; border: none; border-radius: 9px; background: var(--primary); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; }
.submit-btn:hover { background: var(--primary-hover); }
.submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.error-message, .success-message { padding: 10px 12px; border-radius: 7px; font-size: 12.5px; line-height: 1.5; }
.error-message { background: #fff1f2; color: #be123c; }
.success-message { margin-bottom: 18px; background: #ecfdf5; color: #047857; }
.auth-switch { margin-top: 22px; color: var(--text3); font-size: 12.5px; text-align: center; }
.auth-switch a { color: var(--primary); font-weight: 700; }
</style>
