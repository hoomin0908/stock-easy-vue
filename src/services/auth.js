import { computed, readonly, ref } from "vue";
import {
  fetchCurrentUser,
  updateCurrentUser,
  signupAccount,
  loginAccount,
  logoutAccount,
} from "./api";

const currentUser = ref(null);
const isAuthLoading = ref(false);
const isAuthInitialized = ref(false);

let initializePromise = null;

function applyMeResponse(data) {
  currentUser.value =
    data?.isAuthenticated && data?.user ? data.user : null;
}

function applyUserResponse(data) {
  if (data?.isAuthenticated && data?.user) {
    currentUser.value = data.user;
    return currentUser.value;
  }

  if (data?.user) {
    currentUser.value = data.user;
    return currentUser.value;
  }

  currentUser.value =
    data && typeof data === "object"
      ? { ...(currentUser.value || {}), ...data }
      : currentUser.value;
  return currentUser.value;
}

async function initializeAuth() {
  if (isAuthInitialized.value) {
    return currentUser.value;
  }

  if (initializePromise) {
    return initializePromise;
  }

  isAuthLoading.value = true;

  initializePromise = fetchCurrentUser()
    .then(({ data }) => {
      applyMeResponse(data);
      return currentUser.value;
    })
    .catch((error) => {
      currentUser.value = null;
      console.error("사용자 인증 상태 조회 실패", error);
      return null;
    })
    .finally(() => {
      isAuthLoading.value = false;
      isAuthInitialized.value = true;
      initializePromise = null;
    });

  return initializePromise;
}

async function signup(credentials) {
  await initializeAuth();

  const response = await signupAccount(credentials);

  // 회원가입 API의 자동 로그인 여부를 실제 세션 상태로 확인합니다.
  const { data } = await fetchCurrentUser();
  applyMeResponse(data);

  return response.data;
}

async function login(credentials) {
  await initializeAuth();

  const { data } = await loginAccount(credentials);
  currentUser.value = data;

  return data;
}

async function logout() {
  await initializeAuth();
  await logoutAccount();
  currentUser.value = null;
}

async function updateProfile(payload) {
  await initializeAuth();

  const response = await updateCurrentUser(payload);

  if (response.data) {
    return applyUserResponse(response.data);
  }

  const { data } = await fetchCurrentUser();
  applyMeResponse(data);
  return currentUser.value;
}

export function useAuth() {
  return {
    currentUser: readonly(currentUser),
    isAuthLoading: readonly(isAuthLoading),
    isAuthInitialized: readonly(isAuthInitialized),
    isAuthenticated: computed(() => currentUser.value !== null),
    initializeAuth,
    signup,
    login,
    logout,
    updateProfile,
  };
}
