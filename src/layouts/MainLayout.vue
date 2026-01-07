<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-center">
          <div class="text-weight-medium">Bienvenido: {{ authStore.user?.nombre }}</div>
        </q-toolbar-title>

        <q-btn flat round dense icon="account_circle">
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item clickable v-close-popup @click="openProfile">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>Mi Perfil</q-item-section>
              </q-item>
              
              <q-item clickable v-close-popup @click="changePassword">
                <q-item-section avatar>
                  <q-icon name="lock" />
                </q-item-section>
                <q-item-section>Cambiar Contraseña</q-item-section>
              </q-item>
              
              <q-separator />
              
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>Cerrar Sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Menú </q-item-label>

        <q-item clickable to="/asistencias">
          <q-item-section avatar>
            <q-icon name="assessment" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Reportes Asistencias</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable to="/capacitaciones">
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Capacitaciones</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable to="/reportes">
          <q-item-section avatar>
            <q-icon name="analytics" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Reportes Capacitaciones</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="authStore.user?.rol === 'admin'" clickable to="/secciones">
          <q-item-section avatar>
            <q-icon name="category" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Secciones</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="authStore.user?.rol === 'admin'" clickable to="/productos">
          <q-item-section avatar>
            <q-icon name="inventory_2" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Productos</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="authStore.user?.rol === 'admin'" clickable to="/usuarios">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Usuarios</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-dialog v-model="showPasswordDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Cambiar Contraseña</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="updatePassword">
            <q-input
              v-model="passwordForm.currentPassword"
              label="Contraseña Actual"
              type="password"
              outlined
              class="q-mb-md"
              :rules="[(val) => !!val || 'Campo requerido']"
            />
            <q-input
              v-model="passwordForm.newPassword"
              label="Nueva Contraseña"
              type="password"
              outlined
              class="q-mb-md"
              :rules="[(val) => !!val || 'Campo requerido', (val) => val.length >= 6 || 'Mínimo 6 caracteres']"
            />
            <q-input
              v-model="passwordForm.confirmPassword"
              label="Confirmar Contraseña"
              type="password"
              outlined
              class="q-mb-md"
              :rules="[(val) => !!val || 'Campo requerido', (val) => val === passwordForm.newPassword || 'Las contraseñas no coinciden']"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancelar" flat @click="showPasswordDialog = false" />
              <q-btn label="Cambiar" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showProfileDialog" persistent :maximized="$q.screen.lt.md">
      <q-card :style="$q.screen.lt.md ? '' : 'min-width: 500px; max-width: 600px'">
        <q-card-section class="row items-center bg-primary text-white">
          <q-icon name="person" :size="$q.screen.lt.md ? '28px' : '32px'" class="q-mr-sm" />
          <div :class="$q.screen.lt.md ? 'text-subtitle1' : 'text-h6'">Mi Perfil</div>
          <q-space />
          <q-btn flat round dense icon="close" @click="showProfileDialog = false" />
        </q-card-section>

        <q-separator />

        <q-card-section :class="$q.screen.lt.md ? 'q-pt-md q-px-md' : 'q-pt-lg'">
          <q-form @submit="updateProfile">
            <q-input
              v-model="profileForm.nombre"
              label="Nombre completo"
              outlined
              :dense="!$q.screen.lt.md"
              class="q-mb-md"
              :rules="[(val) => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              v-model="profileForm.email"
              label="Email"
              type="email"
              outlined
              :dense="!$q.screen.lt.md"
              class="q-mb-md"
              :rules="[(val) => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <div class="q-mb-md">
              <q-separator class="q-mb-md" />
              <div :class="$q.screen.lt.md ? 'text-subtitle2' : 'text-subtitle2'" class="text-weight-medium q-mb-sm">
                <q-icon name="draw" class="q-mr-xs" />
                Firma Actual
              </div>
              
              <div v-if="profileForm.firmaPreview && !profileForm.firmaFile" class="q-mb-md text-center">
                <div class="text-caption text-grey-7 q-mb-sm">Tu firma actual:</div>
                <q-card flat bordered class="inline-block q-pa-sm" :style="$q.screen.lt.md ? 'max-width: 100%' : ''">
                  <img
                    :src="profileForm.firmaPreview"
                    :style="$q.screen.lt.md ? 'max-width: 100%; max-height: 100px; border-radius: 4px; object-fit: contain;' : 'max-width: 300px; max-height: 120px; border-radius: 4px; object-fit: contain;'"
                  />
                </q-card>
              </div>

              <div :class="$q.screen.lt.md ? 'text-subtitle2' : 'text-subtitle2'" class="text-weight-medium q-mb-sm">
                <q-icon name="upload" class="q-mr-xs" />
                {{ profileForm.firmaPreview && !profileForm.firmaFile ? 'Actualizar Firma' : 'Subir Firma' }}
              </div>
              <q-file
                v-model="profileForm.firmaFile"
                label="Seleccionar nueva firma"
                accept="image/*"
                outlined
                :dense="!$q.screen.lt.md"
                clearable
                @update:model-value="handleProfileFileChange"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
                <template v-slot:hint>
                  JPG, PNG. Máx: 2MB
                </template>
              </q-file>
              
              <div v-if="profileForm.firmaFile" class="q-mt-md text-center">
                <div class="text-caption text-grey-7 q-mb-sm">Nueva firma (vista previa):</div>
                <q-card flat bordered class="inline-block q-pa-sm" :style="$q.screen.lt.md ? 'max-width: 100%' : ''">
                  <img
                    :src="profileForm.firmaPreview"
                    :style="$q.screen.lt.md ? 'max-width: 100%; max-height: 100px; border-radius: 4px; object-fit: contain;' : 'max-width: 300px; max-height: 120px; border-radius: 4px; object-fit: contain;'"
                  />
                </q-card>
              </div>
            </div>

            <q-separator class="q-mb-md" />

            <div :class="$q.screen.lt.md ? 'column q-gutter-sm' : 'row justify-end q-gutter-sm'">
              <q-btn 
                label="Cancelar" 
                flat 
                @click="showProfileDialog = false"
                :class="$q.screen.lt.md ? 'full-width' : ''"
              />
              <q-btn 
                label="Actualizar" 
                type="submit" 
                color="primary" 
                icon-right="save"
                :class="$q.screen.lt.md ? 'full-width' : ''"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()
const leftDrawerOpen = ref(false)
const showPasswordDialog = ref(false)
const showProfileDialog = ref(false)
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const profileForm = ref({
  nombre: '',
  email: '',
  firmaFile: null,
  firmaPreview: null
})

let activityCheckInterval = null

onMounted(() => {
  // Asegurar que los datos del usuario estén cargados
  authStore.loadUser()
  console.log('Usuario cargado:', authStore.user)
  
  // Actualizar actividad con eventos del usuario
  const updateActivity = () => {
    if (authStore.token) {
      authStore.updateLastActivity()
    }
  }
  
  // Escuchar eventos de actividad del usuario
  window.addEventListener('click', updateActivity)
  window.addEventListener('keypress', updateActivity)
  window.addEventListener('scroll', updateActivity)
  window.addEventListener('mousemove', updateActivity)
  
  // Verificar cada minuto si la sesión expiró
  activityCheckInterval = setInterval(() => {
    if (authStore.isSessionExpired()) {
      $q.notify({
        type: 'warning',
        message: 'Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.',
        timeout: 3000
      })
      authStore.logout()
      router.push('/login')
    }
  }, 60000) // Verificar cada minuto
})

onBeforeUnmount(() => {
  // Limpiar interval y event listeners
  if (activityCheckInterval) {
    clearInterval(activityCheckInterval)
  }
  
  window.removeEventListener('click', updateActivity)
  window.removeEventListener('keypress', updateActivity)
  window.removeEventListener('scroll', updateActivity)
  window.removeEventListener('mousemove', updateActivity)
})

function updateActivity() {
  if (authStore.token) {
    authStore.updateLastActivity()
  }
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function logout() {
  authStore.logout()
  router.push('/login')
}

function changePassword() {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  showPasswordDialog.value = true
}

async function openProfile() {
  try {
    // Primero intentar con los datos del store/localStorage
    let perfilData = authStore.user
    
    // Si no hay datos completos, obtener del backend usando el ID del usuario
    if (!perfilData?.nombre || !perfilData?.email) {
      console.log('Datos incompletos, obteniendo del backend...')
      const response = await api.get(`/usuarios/${perfilData.id}`)
      perfilData = response.data
      
      // Actualizar el store y localStorage con los datos completos
      authStore.user = {
        ...authStore.user,
        nombre: perfilData.nombre,
        email: perfilData.email,
        firma: perfilData.firma
      }
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }
    
    console.log('Perfil cargado:', perfilData)
    
    const firmaUrl = perfilData.firma 
      ? `http://localhost:4000/${perfilData.firma}` 
      : null
    
    profileForm.value = {
      nombre: perfilData.nombre || '',
      email: perfilData.email || '',
      firmaFile: null,
      firmaPreview: firmaUrl
    }
    
    showProfileDialog.value = true
  } catch (error) {
    console.error('Error al cargar perfil:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos del perfil'
    })
  }
}

function handleProfileFileChange(file) {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      profileForm.value.firmaPreview = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    // Si se elimina el archivo, restaurar la firma original
    const firmaOriginal = authStore.user?.firma 
      ? `http://localhost:4000/${authStore.user.firma}` 
      : null
    profileForm.value.firmaPreview = firmaOriginal
  }
}

async function updateProfile() {
  try {
    const formData = new FormData()
    formData.append('nombre', profileForm.value.nombre)
    formData.append('email', profileForm.value.email)
    
    if (profileForm.value.firmaFile) {
      formData.append('firma', profileForm.value.firmaFile)
    }

    const response = await api.put('/usuarios/perfil', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // Actualizar datos del usuario en el store
    authStore.user = {
      ...authStore.user,
      nombre: response.data.nombre,
      email: response.data.email,
      firma: response.data.firma
    }
    
    // Actualizar también en localStorage
    localStorage.setItem('user', JSON.stringify(authStore.user))

    showProfileDialog.value = false
    
    $q.notify({
      type: 'positive',
      message: 'Perfil actualizado exitosamente',
      timeout: 2000
    })
  } catch (err) {
    console.error('Error al actualizar perfil:', err.response)
    const message = err.response?.data?.message || 'Error al actualizar perfil'
    $q.notify({
      type: 'negative',
      message
    })
  }
}

async function updatePassword() {
  try {
    await api.put('/usuarios/password', {
      actual: passwordForm.value.currentPassword,
      nueva: passwordForm.value.newPassword
    })
    
    showPasswordDialog.value = false
    
    $q.notify({
      type: 'positive',
      message: 'Contraseña actualizada exitosamente. Por favor, inicia sesión nuevamente.',
      timeout: 3000
    })
    
    // Cerrar sesión automáticamente después de 1 segundo
    setTimeout(() => {
      authStore.logout()
      router.push('/login')
    }, 1000)
    
  } catch (err) {
    console.error('Error al cambiar contraseña:', err.response)
    const message = err.response?.data?.message || 'Error al cambiar contraseña'
    $q.notify({
      type: 'negative',
      message
    })
  }
}
</script>
