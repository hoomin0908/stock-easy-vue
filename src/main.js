import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { useAuth } from "./services/auth";
import "./assets/main.css";

async function bootstrap() {
  const auth = useAuth();

  await auth.initializeAuth();

  createApp(App)
    .use(router)
    .mount("#app");
}

bootstrap();
