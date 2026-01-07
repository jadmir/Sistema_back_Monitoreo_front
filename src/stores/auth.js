import { defineStore } from "pinia";
import { api } from "boot/axios";

const INACTIVITY_TIMEOUT = 5 * 60 * 60 * 1000; // 5 horas en milisegundos

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
    lastActivity: localStorage.getItem("lastActivity") || Date.now(),
  }),

  actions: {
    async login(email, password) {
      const { data } = await api.post("/usuarios/login", { email, password });
      this.token = data.token;
      this.user = data.user;

      localStorage.setItem("token", this.token);
      localStorage.setItem("user", JSON.stringify(this.user));
      this.updateLastActivity();
    },

    loadUser() {
      const u = localStorage.getItem("user");
      const t = localStorage.getItem("token");
      const lastActivity = localStorage.getItem("lastActivity");
      
      if (u) this.user = JSON.parse(u);
      if (t) this.token = t;
      if (lastActivity) this.lastActivity = parseInt(lastActivity);
      
      // Verificar si la sesión ha expirado
      if (this.isSessionExpired()) {
        this.logout();
        return false;
      }
      
      return true;
    },

    updateLastActivity() {
      this.lastActivity = Date.now();
      localStorage.setItem("lastActivity", this.lastActivity.toString());
    },

    isSessionExpired() {
      if (!this.token) return true;
      const now = Date.now();
      const timeSinceLastActivity = now - this.lastActivity;
      return timeSinceLastActivity > INACTIVITY_TIMEOUT;
    },

    logout() {
      this.user = null;
      this.token = null;
      this.lastActivity = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("lastActivity");
    },
  },
});
