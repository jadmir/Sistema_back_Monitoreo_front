<template>
  <q-page class="q-pa-md usuarios-page">
    <div class="row items-center q-mb-lg header-section">
      <q-space class="gt-xs" />
      <div class="text-center col-12 col-sm-auto">
        <div class="text-h4 text-weight-bold text-primary page-title">Gestión de Usuarios</div>
        <div class="text-subtitle2 text-grey-7">Administra los usuarios del sistema</div>
      </div>
      <q-space />
      <q-btn
        :label="$q.screen.gt.xs ? 'Nuevo Usuario' : ''"
        :icon="$q.screen.gt.xs ? 'add' : 'add'"
        color="primary"
        unelevated
        :size="$q.screen.gt.xs ? 'md' : 'sm'"
        @click="openNewDialog"
        class="col-12 col-sm-auto q-mt-sm q-mt-sm-none"
      >
        <span v-if="!$q.screen.gt.xs">Nuevo</span>
      </q-btn>
    </div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-pa-sm q-pa-sm-md">
        <q-input
          v-model="searchQuery"
          label="Buscar usuarios"
          outlined
          dense
          clearable
          @update:model-value="searchUsuarios"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-table
        :rows="usuarios"
        :columns="visibleColumns"
        row-key="id"
        :loading="loading"
        flat
        :rows-per-page-options="[10, 20, 50]"
        :grid="$q.screen.lt.md"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:body-cell-firma="props">
          <q-td :props="props">
            <q-avatar v-if="props.row.firma" :size="$q.screen.gt.xs ? '60px' : '50px'" class="shadow-2">
              <img :src="getImageUrl(props.row.firma)" alt="Firma" />
            </q-avatar>
            <q-avatar v-else :size="$q.screen.gt.xs ? '60px' : '50px'" color="grey-3">
              <q-icon name="no_photography" :size="$q.screen.gt.xs ? '30px' : '25px'" color="grey-6" />
            </q-avatar>
          </q-td>
        </template>

        <template v-slot:body-cell-rol="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.rol === 'admin' ? 'primary' : 'secondary'"
              :label="props.row.rol"
              class="text-capitalize"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="edit"
              color="primary"
              size="sm"
              @click="editUsuario(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              size="sm"
              @click="confirmDelete(props.row.id)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <!-- Vista en Grid para móviles -->
        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <q-avatar v-if="props.row.firma" size="80px" class="shadow-2">
                  <img :src="getImageUrl(props.row.firma)" alt="Firma" />
                </q-avatar>
                <q-avatar v-else size="80px" color="grey-3">
                  <q-icon name="no_photography" size="40px" color="grey-6" />
                </q-avatar>
                <div class="text-h6 q-mt-sm">{{ props.row.nombre }}</div>
                <div class="text-caption text-grey-7">{{ props.row.email }}</div>
                <q-badge
                  :color="props.row.rol === 'admin' ? 'primary' : 'secondary'"
                  :label="props.row.rol"
                  class="text-capitalize q-mt-sm"
                />
              </q-card-section>
              <q-separator />
              <q-card-actions align="center">
                <q-btn
                  flat
                  icon="edit"
                  color="primary"
                  label="Editar"
                  @click="editUsuario(props.row)"
                />
                <q-btn
                  flat
                  icon="delete"
                  color="negative"
                  label="Eliminar"
                  @click="confirmDelete(props.row.id)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </template>

        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <template v-slot:no-data>
          <div class="full-width text-center q-pa-lg">
            <q-icon name="people_outline" size="60px" color="grey-5" />
            <div class="text-h6 text-grey-7 q-mt-md">No hay usuarios registrados</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent :maximized="$q.screen.lt.sm" :full-width="$q.screen.lt.md">
      <q-card :style="$q.screen.gt.sm ? 'min-width: 500px; max-width: 600px' : 'width: 100%'">
        <q-card-section class="row items-center bg-primary text-white q-py-sm">
          <q-icon name="person" :size="$q.screen.gt.xs ? '32px' : '24px'" class="q-mr-sm" />
          <div :class="$q.screen.gt.xs ? 'text-h6' : 'text-subtitle1'">{{ editMode ? 'Editar' : 'Nuevo' }} Usuario</div>
          <q-space />
          <q-btn flat round dense icon="close" @click="showDialog = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md scroll" :class="$q.screen.lt.sm ? 'q-px-sm' : ''" :style="$q.screen.lt.sm ? 'max-height: calc(100vh - 120px)' : ''">
          <q-form @submit="saveUsuario" class="q-gutter-md">
            <q-input
              v-model="form.nombre"
              label="Nombre completo"
              outlined
              dense
              :rules="[(val) => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              v-model="form.email"
              label="Email"
              type="email"
              outlined
              dense
              :rules="[(val) => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-input
              v-model="form.password"
              :label="editMode ? 'Contraseña (opcional)' : 'Contraseña'"
              type="password"
              outlined
              dense
              :rules="editMode ? [] : [(val) => !!val || 'Campo requerido']"
              :hint="editMode ? 'Dejar vacío para no cambiar' : ''"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
            </q-input>

            <q-select
              v-model="form.rol"
              :options="[
                { label: 'Administrador', value: 'admin' },
                { label: 'Usuario', value: 'usuario' }
              ]"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Rol"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="shield" />
              </template>
            </q-select>

            <div>
              <q-separator class="q-mb-md" />
              <div class="text-subtitle2 text-weight-medium q-mb-sm">
                <q-icon name="draw" class="q-mr-xs" />
                Firma Digital
              </div>
              <q-file
                v-model="firmaFile"
                label="Seleccionar imagen"
                accept="image/*"
                outlined
                dense
                @update:model-value="handleFileChange"
                clearable
                counter
                max-file-size="2097152"
                @rejected="onFileRejected"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
                <template v-slot:hint>
                  <span class="text-caption">JPG, PNG. Máx: 2MB</span>
                </template>
              </q-file>
              
              <div v-if="firmaPreview" class="q-mt-md text-center">
                <div class="text-caption text-grey-7 q-mb-sm">Vista previa:</div>
                <q-card flat bordered class="inline-block q-pa-xs">
                  <img
                    :src="firmaPreview"
                    style="max-width: 100%; max-height: 120px; border-radius: 4px; object-fit: contain;"
                  />
                </q-card>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="row q-gutter-sm">
              <q-btn
                label="Cancelar"
                flat
                color="grey-7"
                @click="showDialog = false"
                :class="$q.screen.lt.sm ? 'col-12' : 'col'"
              />
              <q-btn
                label="Guardar"
                type="submit"
                color="primary"
                unelevated
                icon-right="save"
                :class="$q.screen.lt.sm ? 'col-12' : 'col'"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const usuarios = ref([])
const loading = ref(false)
const showDialog = ref(false)
const editMode = ref(false)
const firmaFile = ref(null)
const firmaPreview = ref(null)
const searchQuery = ref('')
const form = ref({
  nombre: '',
  email: '',
  password: '',
  rol: 'usuario'
})

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  { name: 'rol', label: 'Rol', field: 'rol', align: 'left', sortable: true },
  { name: 'firma', label: 'Firma', field: 'firma', align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

// Columnas visibles según el tamaño de pantalla
const visibleColumns = computed(() => {
  if ($q.screen.lt.md) {
    return columns // En grid mode se usan todas las columnas
  }
  if ($q.screen.lt.lg) {
    // En tablet, ocultar firma
    return columns.filter(col => col.name !== 'firma')
  }
  return columns
})

async function loadUsuarios() {
  loading.value = true
  try {
    const { data } = await api.get('/usuarios')
    usuarios.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar usuarios' })
  } finally {
    loading.value = false
  }
}

async function searchUsuarios() {
  if (!searchQuery.value || searchQuery.value.trim() === '') {
    loadUsuarios()
    return
  }

  loading.value = true
  try {
    // Si es un número, buscar por ID directamente
    const searchValue = searchQuery.value.trim()
    if (/^\d+$/.test(searchValue)) {
      const { data } = await api.get(`/usuarios/${searchValue}`)
      usuarios.value = [data] // Convertir a array para mostrarlo en la tabla
    } else {
      // Buscar por texto (nombre, email, etc.)
      const { data } = await api.get(`/usuarios/buscar?q=${searchValue}`)
      usuarios.value = data
    }
  } catch (error) {
    if (error.response?.status === 404) {
      usuarios.value = []
      $q.notify({ type: 'warning', message: 'No se encontraron usuarios' })
    } else {
      $q.notify({ type: 'negative', message: 'Error al buscar usuarios' })
    }
  } finally {
    loading.value = false
  }
}

async function saveUsuario() {
  try {
    const formData = new FormData()
    formData.append('nombre', form.value.nombre)
    formData.append('email', form.value.email)
    if (form.value.password) {
      formData.append('password', form.value.password)
    }
    formData.append('rol', form.value.rol)
    
    if (firmaFile.value) {
      formData.append('firma', firmaFile.value)
    }

    if (editMode.value) {
      await api.put(`/usuarios/${form.value.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    } else {
      await api.post('/usuarios', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    $q.notify({ type: 'positive', message: 'Usuario guardado' })
    showDialog.value = false
    resetForm()
    loadUsuarios()
  } catch (err) {
    const message = err.response?.data?.message || 'Error al guardar usuario'
    $q.notify({ type: 'negative', message })
  }
}

function handleFileChange(file) {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      firmaPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    firmaPreview.value = null
  }
}

function openNewDialog() {
  resetForm()
  editMode.value = false
  showDialog.value = true
}

function editUsuario(usuario) {
  form.value = { ...usuario }
  firmaPreview.value = usuario.firma ? getImageUrl(usuario.firma) : null
  firmaFile.value = null
  editMode.value = true
  showDialog.value = true
}

function resetForm() {
  form.value = {
    nombre: '',
    email: '',
    password: '',
    rol: 'usuario'
  }
  firmaFile.value = null
  firmaPreview.value = null
}

function getImageUrl(firma) {
  // Si ya es una URL completa (http), devolverla tal cual
  if (firma && firma.startsWith('http')) {
    return firma
  }
  // Si es una ruta relativa, construir la URL completa
  if (firma) {
    return `http://localhost:4000${firma.startsWith('/') ? '' : '/'}${firma}`
  }
  return null
}

async function deleteUsuario(id) {
  try {
    await api.delete(`/usuarios/${id}`)
    $q.notify({ type: 'positive', message: 'Usuario eliminado' })
    loadUsuarios()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al eliminar usuario' })
  }
}

function confirmDelete(id) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de que deseas eliminar este usuario?',
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey-7'
    },
    ok: {
      label: 'Eliminar',
      color: 'negative',
      unelevated: true
    },
    persistent: true
  }).onOk(() => {
    deleteUsuario(id)
  })
}

function onFileRejected() {
  $q.notify({
    type: 'negative',
    message: 'Archivo rechazado. Verifica el tamaño (máx 2MB) y formato (JPG/PNG)'
  })
}

onMounted(() => {
  loadUsuarios()
})
</script>

<style scoped>
/* Ajustes responsive para móviles */
@media (max-width: 599px) {
  .usuarios-page {
    padding: 8px !important;
  }
  
  .page-title {
    font-size: 1.5rem !important;
  }
  
  .header-section {
    flex-direction: column;
    gap: 8px;
  }
}

/* Ajustes para tablets */
@media (max-width: 1023px) {
  .page-title {
    font-size: 1.75rem !important;
  }
}
</style>
