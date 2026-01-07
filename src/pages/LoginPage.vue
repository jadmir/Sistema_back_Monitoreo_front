<template>
  <div class="fullscreen flex flex-center login-bg">
    <q-card class="login-card q-pa-lg shadow-10">
      <q-card-section class="text-center q-pb-none">
        <q-icon name="account_circle" size="80px" color="primary" />
        <div class="text-h4 text-weight-bold q-mt-md">Bienvenido</div>
        <div class="text-subtitle2 text-grey-7">Ingresa tus credenciales</div>
      </q-card-section>

      <q-card-section class="q-pt-lg">
        <q-form @submit="login">
          <q-input
            v-model="email"
            label="Email"
            type="email"
            outlined
            dense
            class="q-mb-md"
            :rules="[(val) => !!val || 'Email requerido']"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            label="Contraseña"
            type="password"
            outlined
            dense
            class="q-mb-lg"
            :rules="[(val) => !!val || 'Contraseña requerida']"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
          </q-input>

          <q-btn
            type="submit"
            label="Iniciar Sesión"
            color="primary"
            size="lg"
            class="full-width"
            unelevated
            :loading="loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <div class="text-caption text-grey-6">
          Sistema de Gestión © 2025
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "src/stores/auth";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

const email = ref("");
const password = ref("");
const loading = ref(false);

const auth = useAuthStore();
const router = useRouter();
const $q = useQuasar();

const login = async () => {
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    $q.notify({
      type: "positive",
      message: "Inicio de sesión exitoso",
      position: "top"
    });
    router.push("/");
  } catch {
    $q.notify({
      type: "negative",
      message: "Credenciales incorrectas",
      position: "top"
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  margin: 0 16px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
}

/* Ajustes para móviles */
@media (max-width: 600px) {
  .login-card {
    padding: 24px 16px !important;
  }
  
  .text-h4 {
    font-size: 1.75rem !important;
  }
  
  .q-icon[size="80px"] {
    font-size: 60px !important;
  }
}

/* Ajustes para pantallas muy pequeñas */
@media (max-width: 360px) {
  .login-card {
    margin: 0 8px;
    padding: 16px 12px !important;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>
