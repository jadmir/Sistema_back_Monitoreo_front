<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-medium">Capacitaciones</div>
      <q-space />
      <q-btn 
        color="primary" 
        icon="add" 
        label="Nueva Capacitación" 
        @click="abrirDialogoNuevo"
        :class="$q.screen.lt.md ? 'q-mt-sm full-width' : ''"
      />
    </div>

    <!-- Vista Grid para móvil -->
    <div v-if="$q.screen.lt.md" class="row q-col-gutter-md">
      <div v-for="capacitacion in capacitaciones" :key="capacitacion.id" class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium">{{ capacitacion.cliente }}</div>
            <div class="text-caption text-grey-7">{{ capacitacion.direccion }}</div>
            <q-separator class="q-my-sm" />
            <div class="text-body2">
              <div><strong>Departamento:</strong> {{ capacitacion.cargo_departamento }}</div>
              <div><strong>Fecha Instalación:</strong> {{ formatDate(capacitacion.fecha_instalacion) }}</div>
              <div><strong>Responsable:</strong> {{ capacitacion.responsable_centro_salud }}</div>
              <div><strong>Plantilla:</strong> {{ capacitacion.tipo_plantilla?.replace('.docx', '') }}</div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions>
            <q-btn flat dense icon="inventory_2" color="secondary" @click="verProductos(capacitacion.id)">
              <q-tooltip>Ver Productos</q-tooltip>
            </q-btn>
            <q-btn flat dense icon="download" color="primary" @click="descargarWord(capacitacion.id)">
              <q-tooltip>Descargar Word</q-tooltip>
            </q-btn>
            <q-btn flat dense icon="visibility" color="info" @click="verDetalle(capacitacion.id)">
              <q-tooltip>Ver Detalle</q-tooltip>
            </q-btn>
            <q-btn flat dense icon="edit" color="warning" @click="editarCapacitacion(capacitacion)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat dense icon="delete" color="negative" @click="confirmarEliminar(capacitacion.id)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Vista Tabla para escritorio -->
    <q-table
      v-else
      :rows="capacitaciones"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat dense round icon="inventory_2" color="secondary" @click="verProductos(props.row.id)">
            <q-tooltip>Ver Productos</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="download" color="primary" @click="descargarWord(props.row.id)">
            <q-tooltip>Descargar Word</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="visibility" color="info" @click="verDetalle(props.row.id)">
            <q-tooltip>Ver Detalle</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="edit" color="warning" @click="editarCapacitacion(props.row)">
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
      <q-card :style="$q.screen.lt.md ? '' : 'min-width: 700px; max-width: 900px'">
        <q-card-section class="row items-center bg-primary text-white">
          <q-icon name="school" :size="$q.screen.lt.md ? '28px' : '32px'" class="q-mr-sm" />
          <div :class="$q.screen.lt.md ? 'text-subtitle1' : 'text-h6'">
            {{ editando ? 'Editar Capacitación' : 'Nueva Capacitación' }}
          </div>
          <q-space />
          <q-btn flat round dense icon="close" @click="cerrarDialogo" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md" style="max-height: 70vh; overflow-y: auto;">
          <q-form @submit="guardarCapacitacion">
            <!-- Información General -->
            <div class="text-subtitle1 text-weight-medium q-mb-md">Información General</div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.tipo_plantilla"
                  :options="plantillas"
                  option-value="nombre"
                  option-label="nombre_display"
                  emit-value
                  map-options
                  label="Plantilla *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Campo requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" />
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.fecha_instalacion"
                  label="Fecha Instalación *"
                  type="date"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Campo requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.cliente"
                  label="Cliente *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Campo requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="business" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.direccion"
                  label="Dirección *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Campo requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="location_on" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.cargo_departamento"
                  label="Cargo/Departamento *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Campo requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.responsable_centro_salud"
                  label="Responsable Centro de Salud *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Campo requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- Productos -->
            <div class="row items-center q-mb-md">
              <div class="text-subtitle1 text-weight-medium">Productos</div>
              <q-space />
            </div>

            <!-- Búsqueda de Productos -->
            <div class="q-mb-md">
              <q-input
                v-model="busquedaProducto"
                label="Buscar producto por referencia o nombre"
                outlined
                dense
                clearable
                @update:model-value="buscarProductos"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>

              <!-- Resultados de búsqueda -->
              <q-list v-if="resultadosBusqueda.length > 0" bordered separator class="q-mt-sm" style="max-height: 200px; overflow-y: auto;">
                <q-item 
                  v-for="prod in resultadosBusqueda" 
                  :key="prod.id"
                  clickable
                  @click="agregarProductoSeleccionado(prod)"
                >
                  <q-item-section>
                    <q-item-label><strong>{{ prod.referencia }}</strong> - {{ prod.nombre }}</q-item-label>
                    <q-item-label caption>{{ prod.seccion_nombre }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat dense round icon="add" color="primary" size="sm" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Productos Seleccionados -->
            <div v-for="(producto, index) in form.productos" :key="index" class="q-mb-md q-pa-md" style="border: 1px solid #e0e0e0; border-radius: 8px; background: #f5f5f5;">
              <div class="row items-center q-mb-sm">
                <div class="text-subtitle2">
                  <q-icon name="inventory" class="q-mr-xs" />
                  <strong>{{ producto.referencia }}</strong> - {{ producto.nombre }}
                </div>
                <q-space />
                <q-btn flat dense round size="sm" icon="delete" color="negative" @click="eliminarProducto(index)" />
              </div>

              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="producto.numero_serie"
                    label="Número de Serie"
                    outlined
                    dense
                    hint="Opcional"
                  >
                    <template v-slot:prepend>
                      <q-icon name="qr_code" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-4">
                  <q-input
                    v-model="producto.version_software"
                    label="Versión Software"
                    outlined
                    dense
                    hint="Opcional"
                  >
                    <template v-slot:prepend>
                      <q-icon name="update" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-4">
                  <q-input
                    v-model="producto.internal_id"
                    label="Internal ID"
                    outlined
                    dense
                    hint="Opcional"
                  >
                    <template v-slot:prepend>
                      <q-icon name="tag" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- Asistentes -->
            <div class="row items-center q-mb-md">
              <div class="text-subtitle1 text-weight-medium">Asistentes</div>
              <q-space />
              <q-btn size="sm" color="primary" icon="add" label="Agregar Asistente" @click="agregarAsistente" />
            </div>

            <div v-for="(asistente, index) in form.asistentes" :key="index" class="q-mb-md q-pa-md" style="border: 1px solid #e0e0e0; border-radius: 8px;">
              <div class="row items-center q-mb-sm">
                <div class="text-subtitle2">Asistente {{ index + 1 }}</div>
                <q-space />
                <q-btn flat dense round size="sm" icon="delete" color="negative" @click="eliminarAsistente(index)" />
              </div>

              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-8">
                  <q-input
                    v-model="asistente.nombre"
                    label="Nombre *"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Campo requerido']"
                  />
                </div>

                <div class="col-12 col-md-4">
                  <q-select
                    v-model="asistente.tipo_asistente"
                    :options="['usuario', 'tecnico']"
                    label="Tipo *"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Campo requerido']"
                  />
                </div>

                <div v-if="asistente.tipo_asistente === 'usuario'" class="col-12">
                  <q-input
                    v-model.number="asistente.usuario_id"
                    label="ID Usuario"
                    type="number"
                    outlined
                    dense
                    hint="Opcional: ID del usuario en el sistema"
                  />
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div :class="$q.screen.lt.md ? 'column q-gutter-sm' : 'row justify-end q-gutter-sm'">
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

    <!-- Diálogo Detalle -->
    <q-dialog v-model="showDetalleDialog" :maximized="$q.screen.lt.md">
      <q-card :style="$q.screen.lt.md ? '' : 'min-width: 600px; max-width: 800px'">
        <q-card-section class="row items-center bg-info text-white">
          <q-icon name="visibility" :size="$q.screen.lt.md ? '28px' : '32px'" class="q-mr-sm" />
          <div :class="$q.screen.lt.md ? 'text-subtitle1' : 'text-h6'">Detalle de Capacitación</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="detalleCapacitacion" style="max-height: 70vh; overflow-y: auto;">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Información General</div>
          <q-list bordered separator class="q-mb-md">
            <q-item>
              <q-item-section>
                <q-item-label caption>Cliente</q-item-label>
                <q-item-label>{{ detalleCapacitacion.cliente }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Dirección</q-item-label>
                <q-item-label>{{ detalleCapacitacion.direccion }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Departamento</q-item-label>
                <q-item-label>{{ detalleCapacitacion.cargo_departamento }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Fecha Instalación</q-item-label>
                <q-item-label>{{ formatDate(detalleCapacitacion.fecha_instalacion) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Responsable Centro de Salud</q-item-label>
                <q-item-label>{{ detalleCapacitacion.responsable_centro_salud }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Plantilla</q-item-label>
                <q-item-label>{{ detalleCapacitacion.tipo_plantilla }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="text-subtitle1 text-weight-medium q-mb-sm">Productos</div>
          <q-list bordered separator class="q-mb-md">
            <q-item v-for="prod in detalleCapacitacion.productos" :key="prod.id">
              <q-item-section>
                <q-item-label>{{ prod.producto_nombre }}</q-item-label>
                <q-item-label caption>Serie: {{ prod.numero_serie }}</q-item-label>
                <q-item-label caption v-if="prod.version_software">Software: {{ prod.version_software }}</q-item-label>
                <q-item-label caption v-if="prod.internal_id">ID: {{ prod.internal_id }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="text-subtitle1 text-weight-medium q-mb-sm">Asistentes</div>
          <q-list bordered separator>
            <q-item v-for="asist in detalleCapacitacion.asistentes" :key="asist.id">
              <q-item-section>
                <q-item-label>{{ asist.nombre }}</q-item-label>
                <q-item-label caption>Tipo: {{ asist.tipo_asistente }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()
const loading = ref(false)
const capacitaciones = ref([])
const plantillas = ref([])
const busquedaProducto = ref('')
const resultadosBusqueda = ref([])
const showDialog = ref(false)
const showDetalleDialog = ref(false)
const editando = ref(false)
const detalleCapacitacion = ref(null)

const columns = [
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left', sortable: true },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' },
  { name: 'cargo_departamento', label: 'Departamento', field: 'cargo_departamento', align: 'left' },
  { name: 'fecha_instalacion', label: 'Fecha Instalación', field: 'fecha_instalacion', align: 'left', sortable: true, format: (val) => formatDate(val) },
  { name: 'responsable_centro_salud', label: 'Responsable', field: 'responsable_centro_salud', align: 'left' },
  { name: 'tipo_plantilla', label: 'Plantilla', field: 'tipo_plantilla', align: 'left', format: (val) => val?.replace('.docx', '') },
  { name: 'actions', label: 'Acciones', align: 'center' }
]

const form = ref({
  tipo_plantilla: '',
  cliente: '',
  direccion: '',
  cargo_departamento: '',
  fecha_instalacion: '',
  responsable_centro_salud: '',
  productos: [],
  asistentes: []
})

onMounted(() => {
  cargarCapacitaciones()
  cargarPlantillas()
})

async function cargarCapacitaciones() {
  loading.value = true
  try {
    const response = await api.get('/capacitaciones')
    capacitaciones.value = response.data
  } catch (error) {
    console.error('Error al cargar capacitaciones:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar capacitaciones'
    })
  } finally {
    loading.value = false
  }
}

async function cargarPlantillas() {
  try {
    const response = await api.get('/capacitaciones/plantillas')
    plantillas.value = response.data
  } catch (error) {
    console.error('Error al cargar plantillas:', error)
  }
}

let busquedaTimeout = null

async function buscarProductos() {
  clearTimeout(busquedaTimeout)

  if (!busquedaProducto.value || busquedaProducto.value.length < 2) {
    resultadosBusqueda.value = []
    return
  }

  busquedaTimeout = setTimeout(async () => {
    try {
      const response = await api.get(`/productos/buscar?q=${busquedaProducto.value}`)
      resultadosBusqueda.value = response.data
    } catch (error) {
      console.error('Error al buscar productos:', error)
    }
  }, 300)
}

function agregarProductoSeleccionado(producto) {
  // Evitar duplicados
  if (form.value.productos.find(p => p.producto_id === producto.id)) {
    $q.notify({
      type: 'warning',
      message: 'Este producto ya fue agregado'
    })
    return
  }

  form.value.productos.push({
    producto_id: producto.id,
    referencia: producto.referencia,
    nombre: producto.nombre,
    numero_serie: '',
    version_software: '',
    internal_id: ''
  })

  busquedaProducto.value = ''
  resultadosBusqueda.value = []
}

function abrirDialogoNuevo() {
  editando.value = false
  busquedaProducto.value = ''
  resultadosBusqueda.value = []
  form.value = {
    tipo_plantilla: '',
    cliente: '',
    direccion: '',
    cargo_departamento: '',
    fecha_instalacion: new Date().toISOString().split('T')[0],
    responsable_centro_salud: '',
    productos: [],
    asistentes: []
  }
  showDialog.value = true
}

async function editarCapacitacion(capacitacion) {
  editando.value = true
  busquedaProducto.value = ''
  resultadosBusqueda.value = []
  
  try {
    // Obtener detalle completo con productos
    const response = await api.get(`/capacitaciones/${capacitacion.id}`)
    const detalle = response.data
    
    form.value = {
      id: capacitacion.id,
      tipo_plantilla: capacitacion.tipo_plantilla,
      cliente: capacitacion.cliente,
      direccion: capacitacion.direccion,
      cargo_departamento: capacitacion.cargo_departamento,
      fecha_instalacion: capacitacion.fecha_instalacion,
      responsable_centro_salud: capacitacion.responsable_centro_salud,
      productos: detalle.productos?.map(p => ({
        producto_id: p.producto_id,
        referencia: p.referencia,
        nombre: p.producto_nombre,
        numero_serie: p.numero_serie || '',
        version_software: p.version_software || '',
        internal_id: p.internal_id || ''
      })) || [],
      asistentes: detalle.asistentes?.map(a => ({
        nombre: a.nombre,
        tipo_asistente: a.tipo_asistente,
        usuario_id: a.usuario_id || null
      })) || []
    }
    showDialog.value = true
  } catch (error) {
    console.error('Error al cargar capacitación:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar capacitación'
    })
  }
}

function verProductos(capacitacionId) {
  router.push(`/capacitaciones/${capacitacionId}/productos`)
}

function cerrarDialogo() {
  showDialog.value = false
  busquedaProducto.value = ''
  resultadosBusqueda.value = []
  form.value = {
    tipo_plantilla: '',
    cliente: '',
    direccion: '',
    cargo_departamento: '',
    fecha_instalacion: '',
    responsable_centro_salud: '',
    productos: [],
    asistentes: []
  }
}

function eliminarProducto(index) {
  form.value.productos.splice(index, 1)
}

function agregarAsistente() {
  form.value.asistentes.push({
    nombre: '',
    tipo_asistente: 'usuario',
    usuario_id: null
  })
}

function eliminarAsistente(index) {
  form.value.asistentes.splice(index, 1)
}

async function guardarCapacitacion() {
  try {
    // Validar que haya al menos un producto
    if (form.value.productos.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'Debe agregar al menos un producto'
      })
      return
    }

    // Preparar datos para enviar
    const payload = {
      tipo_plantilla: form.value.tipo_plantilla,
      cliente: form.value.cliente,
      direccion: form.value.direccion,
      cargo_departamento: form.value.cargo_departamento,
      fecha_instalacion: form.value.fecha_instalacion,
      responsable_centro_salud: form.value.responsable_centro_salud,
      productos: form.value.productos.map(p => ({
        producto_id: p.producto_id,
        numero_serie: p.numero_serie || null,
        version_software: p.version_software || null,
        internal_id: p.internal_id || null
      })),
      asistentes: form.value.asistentes
    }

    if (editando.value) {
      await api.put(`/capacitaciones/${form.value.id}`, payload)
      $q.notify({
        type: 'positive',
        message: 'Capacitación actualizada exitosamente'
      })
    } else {
      await api.post('/capacitaciones', payload)
      $q.notify({
        type: 'positive',
        message: 'Capacitación creada exitosamente'
      })
    }
    cerrarDialogo()
    cargarCapacitaciones()
  } catch (error) {
    console.error('Error al guardar:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al guardar capacitación'
    })
  }
}

async function verDetalle(id) {
  try {
    const response = await api.get(`/capacitaciones/${id}`)
    detalleCapacitacion.value = response.data
    showDetalleDialog.value = true
  } catch (error) {
    console.error('Error al cargar detalle:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar detalle'
    })
  }
}

async function descargarWord(id) {
  try {
    const response = await api.get(`/capacitaciones/${id}/generar-word`, {
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `capacitacion_${id}.docx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    $q.notify({
      type: 'positive',
      message: 'Documento descargado exitosamente'
    })
  } catch (error) {
    console.error('Error al descargar:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al descargar documento'
    })
  }
}

function confirmarEliminar(id) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar esta capacitación?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/capacitaciones/${id}`)
      $q.notify({
        type: 'positive',
        message: 'Capacitación eliminada exitosamente'
      })
      cargarCapacitaciones()
    } catch (error) {
      console.error('Error al eliminar:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar capacitación'
      })
    }
  })
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-ES')
}
</script>
