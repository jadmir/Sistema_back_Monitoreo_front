<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-medium">Secciones</div>
      <q-space />
      <q-btn 
        color="primary" 
        icon="add" 
        label="Nueva Sección" 
        @click="abrirDialogoNuevo"
        :class="$q.screen.lt.md ? 'q-mt-sm full-width' : ''"
      />
    </div>

    <!-- Vista Grid para móvil -->
    <div v-if="$q.screen.lt.md" class="row q-col-gutter-md">
      <div v-for="seccion in secciones" :key="seccion.id" class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-weight-medium">{{ seccion.nombre }}</div>
            <div class="text-caption text-grey-7">ID: {{ seccion.id }}</div>
          </q-card-section>
          <q-separator />
          <q-card-actions>
            <q-btn flat dense icon="inventory" color="info" @click="verProductos(seccion)">
              <q-tooltip>Ver Productos</q-tooltip>
            </q-btn>
            <q-btn flat dense icon="edit" color="warning" @click="editarSeccion(seccion)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat dense icon="delete" color="negative" @click="confirmarEliminar(seccion.id)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Vista Tabla para escritorio -->
    <q-table
      v-else
      :rows="secciones"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat dense round icon="inventory" color="info" @click="verProductos(props.row)">
            <q-tooltip>Ver Productos</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="edit" color="warning" @click="editarSeccion(props.row)">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="delete" color="negative" @click="confirmarEliminar(props.row.id)">
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo Crear/Editar -->
    <q-dialog v-model="showDialog" persistent :maximized="$q.screen.lt.md">
      <q-card :style="$q.screen.lt.md ? '' : 'min-width: 400px'">
        <q-card-section class="row items-center bg-primary text-white">
          <q-icon name="category" :size="$q.screen.lt.md ? '28px' : '32px'" class="q-mr-sm" />
          <div :class="$q.screen.lt.md ? 'text-subtitle1' : 'text-h6'">
            {{ editando ? 'Editar Sección' : 'Nueva Sección' }}
          </div>
          <q-space />
          <q-btn flat round dense icon="close" @click="cerrarDialogo" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit="guardarSeccion">
            <q-input
              v-model="form.nombre"
              label="Nombre de la Sección *"
              outlined
              dense
              autofocus
              :rules="[(val) => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="label" />
              </template>
              <template v-slot:hint>
                Ejemplo: ANESTESIA, VENTILACION
              </template>
            </q-input>

            <div :class="$q.screen.lt.md ? 'column q-gutter-sm q-mt-md' : 'row justify-end q-gutter-sm q-mt-md'">
              <q-btn 
                label="Cancelar" 
                flat 
                @click="cerrarDialogo"
                :class="$q.screen.lt.md ? 'full-width' : ''"
              />
              <q-btn 
                label="Guardar" 
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

    <!-- Diálogo Ver Productos -->
    <q-dialog v-model="showProductosDialog" :maximized="$q.screen.lt.md">
      <q-card :style="$q.screen.lt.md ? '' : 'min-width: 600px; max-width: 800px'">
        <q-card-section class="row items-center bg-info text-white">
          <q-icon name="inventory" :size="$q.screen.lt.md ? '28px' : '32px'" class="q-mr-sm" />
          <div :class="$q.screen.lt.md ? 'text-subtitle1' : 'text-h6'">
            Productos - {{ seccionSeleccionada?.nombre }}
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="productosSeccion.length > 0" style="max-height: 70vh; overflow-y: auto;">
          <q-list bordered separator>
            <q-item v-for="prod in productosSeccion" :key="prod.id">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" icon="inventory_2" />
              </q-item-section>
              <q-item-section>
                <q-item-label><strong>{{ prod.referencia }}</strong></q-item-label>
                <q-item-label caption>{{ prod.nombre }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <div class="text-caption text-grey-7 q-mt-md text-center">
            Total: {{ productosSeccion.length }} producto(s)
          </div>
        </q-card-section>

        <q-card-section v-else class="text-center text-grey-7">
          <q-icon name="inventory" size="64px" color="grey-4" />
          <div class="q-mt-md">No hay productos asociados a esta sección</div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const secciones = ref([])
const showDialog = ref(false)
const showProductosDialog = ref(false)
const editando = ref(false)
const seccionSeleccionada = ref(null)
const productosSeccion = ref([])

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'actions', label: 'Acciones', align: 'center' }
]

const form = ref({
  nombre: ''
})

onMounted(() => {
  cargarSecciones()
})

async function cargarSecciones() {
  loading.value = true
  try {
    const response = await api.get('/secciones')
    secciones.value = response.data
  } catch (error) {
    console.error('Error al cargar secciones:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar secciones'
    })
  } finally {
    loading.value = false
  }
}

function abrirDialogoNuevo() {
  editando.value = false
  form.value = { nombre: '' }
  showDialog.value = true
}

function editarSeccion(seccion) {
  editando.value = true
  form.value = {
    id: seccion.id,
    nombre: seccion.nombre
  }
  showDialog.value = true
}

function cerrarDialogo() {
  showDialog.value = false
  form.value = { nombre: '' }
}

async function guardarSeccion() {
  try {
    if (editando.value) {
      await api.put(`/secciones/${form.value.id}`, { nombre: form.value.nombre })
      $q.notify({
        type: 'positive',
        message: 'Sección actualizada exitosamente'
      })
    } else {
      await api.post('/secciones', { nombre: form.value.nombre })
      $q.notify({
        type: 'positive',
        message: 'Sección creada exitosamente'
      })
    }
    cerrarDialogo()
    cargarSecciones()
  } catch (error) {
    console.error('Error al guardar:', error)
    const message = error.response?.data?.message || 'Error al guardar sección'
    $q.notify({
      type: 'negative',
      message
    })
  }
}

async function verProductos(seccion) {
  try {
    seccionSeleccionada.value = seccion
    const response = await api.get(`/secciones/${seccion.id}/productos`)
    productosSeccion.value = response.data.productos || []
    showProductosDialog.value = true
  } catch (error) {
    console.error('Error al cargar productos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar productos de la sección'
    })
  }
}

function confirmarEliminar(id) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar esta sección? No podrá eliminarla si tiene productos asociados.',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/secciones/${id}`)
      $q.notify({
        type: 'positive',
        message: 'Sección eliminada exitosamente'
      })
      cargarSecciones()
    } catch (error) {
      console.error('Error al eliminar:', error)
      const message = error.response?.data?.message || 'Error al eliminar sección'
      $q.notify({
        type: 'negative',
        message,
        timeout: 5000
      })
    }
  })
}
</script>
