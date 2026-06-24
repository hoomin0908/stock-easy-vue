<template>
  <div class="auth-page">
    <section class="auth-card">
      <div class="auth-heading">
        <span class="auth-kicker">JOIN STOCKEASY</span>
        <h1>회원가입</h1>
        <p>간단한 정보로 나만의 투자 뉴스 공간을 시작하세요.</p>
      </div>

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
          <span>닉네임 <small>선택</small></span>
          <input
            v-model.trim="form.nickname"
            type="text"
            autocomplete="nickname"
            maxlength="30"
            placeholder="사용할 닉네임"
          />
        </label>

        <label class="field">
          <span>비밀번호</span>
          <input
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            placeholder="비밀번호를 입력하세요"
            required
          />
        </label>

        <label class="field">
          <span>비밀번호 확인</span>
          <input
            v-model="passwordConfirm"
            type="password"
            autocomplete="new-password"
            placeholder="비밀번호를 다시 입력하세요"
            required
          />
        </label>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <button class="submit-btn" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "가입 중..." : "회원가입" }}
        </button>
      </form>

      <p class="auth-switch">
        이미 계정이 있나요?
        <router-link to="/login">로그인</router-link>
      </p>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../services/auth";

const router = useRouter();
const { isAuthenticated, signup } = useAuth();

const form = reactive({
  email: "",
  password: "",
  nickname: "",
});
const passwordConfirm = ref("");
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
    data?.password?.[0] ||
    data?.nickname?.[0] ||
    "회원가입 정보를 확인해 주세요."
  );
}

async function handleSubmit() {
  if (isSubmitting.value) return;

  if (form.password !== passwordConfirm.value) {
    errorMessage.value = "비밀번호가 서로 일치하지 않습니다.";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  const payload = {
    email: form.email,
    password: form.password,
  };

  if (form.nickname) payload.nickname = form.nickname;

  try {
    await signup(payload);

    if (isAuthenticated.value) {
      await router.replace("/");
    } else {
      await router.replace({
        path: "/login",
        query: {
          signup: "success",
          email: form.email,
        },
      });
    }
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
.field small { color: var(--text3); font-size: 10.5px; font-weight: 500; }
.field input { width: 100%; padding: 12px 13px; border: 1px solid var(--border); border-radius: 9px; outline: none; font-size: 14px; }
.field input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(255, 90, 31, 0.1); }
.submit-btn { margin-top: 5px; padding: 12px; border: none; border-radius: 9px; background: var(--primary); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; }
.submit-btn:hover { background: var(--primary-hover); }
.submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.error-message { padding: 10px 12px; border-radius: 7px; background: #fff1f2; color: #be123c; font-size: 12.5px; line-height: 1.5; }
.auth-switch { margin-top: 22px; color: var(--text3); font-size: 12.5px; text-align: center; }
.auth-switch a { color: var(--primary); font-weight: 700; }
</style>
