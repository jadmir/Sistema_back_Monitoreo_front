<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-medium">Productos</div>
      <q-space />
      <q-btn 
        color="primary" 
        icon="add" 
        label="Nuevo Producto" 
        @click="abrirDialogoNuevo"
        :class="$q.screen.lt.md ? 'q-mt-sm full-width' : ''"
      />
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-pa-sm">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="busqueda"
              label="Buscar por referencia o nombre"
              outlined
              dense
              clearable
              @update:model-value="buscarProductos"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-select
              v-model="seccionFiltro"
              :options="seccionesOptions"
              label="Filtrar por sección"
              outlined
              dense
              clearable
              @update:model-value="filtrarPorSeccion"
            >
              <template v-slot:prepend>
                <q-icon name="category" />
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Vista Grid para móvil -->
    <div v-if="$q.screen.lt.md" class="row q-col-gutter-md">
      <div v-for="producto in productos" :key="producto.id" class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-subtitle1 text-weight-medium">{{ producto.referencia }}</div>
                <div class="text-body2">{{ producto.nombre }}</div>
                <q-badge :color="getSeccionColor(producto.seccion_nombre)" class="q-mt-sm">
                  {{ producto.seccion_nombre }}
                </q-badge>
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions>
            <q-btn flat dense icon="edit" color="warning" @click="editarProducto(producto)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat dense icon="delete" color="negative" @click="confirmarEliminar(producto.id)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Vista Tabla para escritorio -->
    <q-table
      v-else
      :rows="productos"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
      :pagination="{ rowsPerPage: 15 }"
    >
      <template v-slot:body-cell-seccion_nombre="props">
        <q-td :props="props">
          <q-badge :color="getSeccionColor(props.row.seccion_nombre)">
            {{ props.row.seccion_nombre }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat dense round icon="edit" color="warning" @click="editarProducto(props.row)">
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
      <q-card :style="$q.screen.lt.md ? '' : 'min-width: 500px'">
        <q-card-section class="row items-center bg-primary text-white">
          <q-icon name="inventory_2" :size="$q.screen.lt.md ? '28px' : '32px'" class="q-mr-sm" />
          <div :class="$q.screen.lt.md ? 'text-subtitle1' : 'text-h6'">
            {{ editando ? 'Editar Producto' : 'Nuevo Producto' }}
          </div>
          <q-space />
          <q-btn flat round dense icon="close" @click="cerrarDialogo" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit="guardarProducto">
            <q-select
              v-model="form.seccion_id"
              :options="secciones"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              label="Sección *"
              outlined
              dense
              class="q-mb-md"
              :rules="[(val) => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="category" />
              </template>
            </q-select>

            <q-input
              v-model="form.referencia"
              label="Referencia *"
              outlined
              dense
              class="q-mb-md"
              :rules="[(val) => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="qr_code" />
              </template>
              <template v-slot:hint>
                Código único del producto
              </template>
            </q-input>

            <q-input
              v-model="form.nombre"
              label="Nombre del Producto *"
              outlined
              dense
              type="textarea"
              rows="3"
              class="q-mb-md"
              :rules="[(val) => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="description" />
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
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const productos = ref([])
const secciones = ref([])
const busqueda = ref('')
const seccionFiltro = ref(null)
const showDialog = ref(false)
const editando = ref(false)

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'referencia', label: 'Referencia', field: 'referencia', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'seccion_nombre', label: 'Sección', field: 'seccion_nombre', align: 'center', sortable: true },
  { name: 'actions', label: 'Acciones', align: 'center' }
]

const form = ref({
  seccion_id: null,
  referencia: '',
  nombre: ''
})

const seccionesOptions = computed(() => {
  return secciones.value.map(s => ({
    label: s.nombre,
    value: s.id
  }))
})

onMounted(() => {
  cargarProductos()
  cargarSecciones()
})

async function cargarProductos() {
  loading.value = true
  try {
    const response = await api.get('/productos')
    productos.value = response.data
  } catch (error) {
    console.error('Error al cargar productos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar productos'
    })
  } finally {
    loading.value = false
  }
}

async function cargarSecciones() {
  try {
    const response = await api.get('/secciones')
    secciones.value = response.data
  } catch (error) {
    console.error('Error al cargar secciones:', error)
  }
}

let busquedaTimeout = null

async function buscarProductos() {
  clearTimeout(busquedaTimeout)

  if (!busqueda.value || busqueda.value.trim() === '') {
    cargarProductos()
    return
  }

  busquedaTimeout = setTimeout(async () => {
    loading.value = true
    try {
      const response = await api.get(`/productos/buscar?q=${busqueda.value}`)
      productos.value = response.data
    } catch (error) {
      console.error('Error al buscar:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al buscar productos'
      })
    } finally {
      loading.value = false
    }
  }, 300)
}

async function filtrarPorSeccion() {
  if (!seccionFiltro.value) {
    cargarProductos()
    return
  }

  loading.value = true
  try {
    const response = await api.get(`/productos/seccion/${seccionFiltro.value.value}`)
    productos.value = response.data
  } catch (error) {
    console.error('Error al filtrar:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al filtrar productos'
    })
  } finally {
    loading.value = false
  }
}

function abrirDialogoNuevo() {
  editando.value = false
  form.value = {
    seccion_id: null,
    referencia: '',
    nombre: ''
  }
  showDialog.value = true
}

function editarProducto(producto) {
  editando.value = true
  form.value = {
    id: producto.id,
    seccion_id: producto.seccion_id,
    referencia: producto.referencia,
    nombre: producto.nombre
  }
  showDialog.value = true
}

function cerrarDialogo() {
  showDialog.value = false
  form.value = {
    seccion_id: null,
    referencia: '',
    nombre: ''
  }
}

async function guardarProducto() {
  try {
    const payload = {
      seccion_id: form.value.seccion_id,
      referencia: form.value.referencia,
      nombre: form.value.nombre
    }

    if (editando.value) {
      await api.put(`/productos/${form.value.id}`, payload)
      $q.notify({
        type: 'positive',
        message: 'Producto actualizado exitosamente'
      })
    } else {
      await api.post('/productos', payload)
      $q.notify({
        type: 'positive',
        message: 'Producto creado exitosamente'
      })
    }
    cerrarDialogo()
    cargarProductos()
  } catch (error) {
    console.error('Error al guardar:', error)
    const message = error.response?.data?.message || 'Error al guardar producto'
    $q.notify({
      type: 'negative',
      message
    })
  }
}

function confirmarEliminar(id) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar este producto? No podrá eliminarlo si está asociado a capacitaciones.',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/productos/${id}`)
      $q.notify({
        type: 'positive',
        message: 'Producto eliminado exitosamente'
      })
      cargarProductos()
    } catch (error) {
      console.error('Error al eliminar:', error)
      const message = error.response?.data?.message || 'Error al eliminar producto'
      $q.notify({
        type: 'negative',
        message,
        timeout: 5000
      })
    }
  })
}

function getSeccionColor(seccion) {
  const colores = {
    'ANESTESIA': 'purple',
    'VENTILACION': 'blue',
    'TERMOREGULACION': 'orange',
    'MONITOREO': 'green'
  }
  return colores[seccion] || 'grey'
}
</script>
