<template>
  <q-page padding>
    <div class="text-h5 text-weight-medium q-mb-md">Reportes y Estadísticas</div>

    <!-- Estadísticas Generales -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Total Capacitaciones</div>
            <div class="text-h3">{{ estadisticas.total_capacitaciones || 0 }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section class="bg-secondary text-white">
            <div class="text-h6">Tipos de Plantilla</div>
            <div class="text-h3">{{ estadisticas.por_tipo_plantilla?.length || 0 }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section class="bg-info text-white">
            <div class="text-h6">Clientes Únicos</div>
            <div class="text-h3">{{ estadisticas.top_clientes?.length || 0 }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section class="bg-positive text-white">
            <div class="text-h6">Responsables</div>
            <div class="text-h3">{{ estadisticas.por_responsable?.length || 0 }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-md">Filtros de Búsqueda</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-input
              v-model="filtros.cliente"
              label="Cliente"
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="business" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
            <q-input
              v-model="filtros.fecha_desde"
              label="Fecha Desde"
              type="date"
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
            <q-input
              v-model="filtros.fecha_hasta"
              label="Fecha Hasta"
              type="date"
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.tipo_plantilla"
              :options="plantillas"
              option-value="nombre"
              option-label="nombre_display"
              emit-value
              map-options
              label="Tipo Plantilla"
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="description" />
              </template>
            </q-select>
          </div>

          <div class="col-12">
            <div class="row justify-end q-gutter-sm">
              <q-btn label="Limpiar" flat @click="limpiarFiltros" />
              <q-btn label="Buscar" color="primary" icon="search" @click="buscarCapacitaciones" />
              <q-btn 
                label="Exportar a Excel" 
                color="positive" 
                icon="description" 
                @click="exportarReporte"
                :disable="capacitaciones.length === 0"
              >
                <q-tooltip v-if="capacitaciones.length === 0">
                  Primero realiza una búsqueda
                </q-tooltip>
                <q-tooltip v-else>
                  Exportar con 3 hojas: Capacitaciones, Por Cliente, Por Responsable
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Gráficos -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-md">Por Tipo de Plantilla</div>
            <q-list bordered separator>
              <q-item v-for="item in estadisticas.por_tipo_plantilla" :key="item.tipo_plantilla">
                <q-item-section>
                  <q-item-label>{{ item.tipo_plantilla?.replace('.docx', '') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="primary" :label="item.total" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-md">Por Mes</div>
            <q-list bordered separator>
              <q-item v-for="item in estadisticas.por_mes" :key="item.mes">
                <q-item-section>
                  <q-item-label>{{ formatMes(item.mes) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="secondary" :label="item.total" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-md">Top 5 Clientes</div>
            <q-list bordered separator>
              <q-item v-for="item in estadisticas.top_clientes?.slice(0, 5)" :key="item.cliente">
                <q-item-section avatar>
                  <q-avatar color="info" text-color="white" icon="business" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.cliente }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="info" :label="item.total_capacitaciones" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-md">Por Responsable Drager</div>
            <q-list bordered separator>
              <q-item v-for="item in estadisticas.por_responsable" :key="item.responsable">
                <q-item-section avatar>
                  <q-avatar color="positive" text-color="white" icon="person" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.responsable }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="positive" :label="item.total_capacitaciones" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabla de Capacitaciones -->
    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-md">
          Capacitaciones Encontradas: {{ capacitaciones.length }}
        </div>

        <!-- Vista Grid para móvil -->
        <div v-if="$q.screen.lt.md" class="row q-col-gutter-md">
          <div v-for="cap in capacitaciones" :key="cap.id" class="col-12">
            <q-card bordered>
              <q-card-section>
                <div class="text-subtitle1 text-weight-medium">{{ cap.cliente }}</div>
                <div class="text-caption text-grey-7">{{ cap.direccion }}</div>
                <q-separator class="q-my-sm" />
                <div class="text-body2">
                  <div><strong>Fecha:</strong> {{ formatDate(cap.fecha_instalacion) }}</div>
                  <div><strong>Plantilla:</strong> {{ cap.tipo_plantilla?.replace('.docx', '') }}</div>
                  <div><strong>Responsable:</strong> {{ cap.responsable_drager }}</div>
                  <div v-if="cap.total_productos"><strong>Productos:</strong> {{ cap.total_productos }}</div>
                  <div v-if="cap.total_asistentes"><strong>Asistentes:</strong> {{ cap.total_asistentes }}</div>
                </div>
              </q-card-section>
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
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:body-cell-fecha_instalacion="props">
            <q-td :props="props">
              {{ formatDate(props.row.fecha_instalacion) }}
            </q-td>
          </template>

          <template v-slot:body-cell-tipo_plantilla="props">
            <q-td :props="props">
              <q-badge color="primary">
                {{ props.row.tipo_plantilla?.replace('.docx', '') }}
              </q-badge>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'

const $q = useQuasar()
const loading = ref(false)
const capacitaciones = ref([])
const estadisticas = ref({})
const plantillas = ref([])

const filtros = ref({
  cliente: '',
  fecha_desde: '',
  fecha_hasta: '',
  tipo_plantilla: ''
})

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left', sortable: true },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' },
  { name: 'fecha_instalacion', label: 'Fecha Instalación', field: 'fecha_instalacion', align: 'left', sortable: true },
  { name: 'tipo_plantilla', label: 'Plantilla', field: 'tipo_plantilla', align: 'center' },
  { name: 'responsable_drager', label: 'Responsable', field: 'responsable_drager', align: 'left' },
  { name: 'total_productos', label: 'Productos', field: 'total_productos', align: 'center' },
  { name: 'total_asistentes', label: 'Asistentes', field: 'total_asistentes', align: 'center' }
]

onMounted(() => {
  cargarEstadisticas()
  cargarPlantillas()
  buscarCapacitaciones()
})

async function cargarEstadisticas() {
  try {
    const response = await api.get('/capacitaciones/estadisticas')
    estadisticas.value = response.data
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
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

async function buscarCapacitaciones() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    
    if (filtros.value.cliente) params.append('cliente', filtros.value.cliente)
    if (filtros.value.fecha_desde) params.append('fecha_desde', filtros.value.fecha_desde)
    if (filtros.value.fecha_hasta) params.append('fecha_hasta', filtros.value.fecha_hasta)
    if (filtros.value.tipo_plantilla) params.append('tipo_plantilla', filtros.value.tipo_plantilla)

    const url = `/capacitaciones/reporte${params.toString() ? '?' + params.toString() : ''}`
    const response = await api.get(url)
    capacitaciones.value = response.data.capacitaciones || []
    
    console.log('Capacitaciones cargadas:', capacitaciones.value.length)
  } catch (error) {
    console.error('Error al buscar capacitaciones:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al buscar capacitaciones'
    })
  } finally {
    loading.value = false
  }
}

async function exportarReporte() {
  try {
    const params = new URLSearchParams()
    
    if (filtros.value.cliente) params.append('cliente', filtros.value.cliente)
    if (filtros.value.fecha_desde) params.append('fecha_desde', filtros.value.fecha_desde)
    if (filtros.value.fecha_hasta) params.append('fecha_hasta', filtros.value.fecha_hasta)
    if (filtros.value.tipo_plantilla) params.append('tipo_plantilla', filtros.value.tipo_plantilla)

    const url = `/capacitaciones/reporte${params.toString() ? '?' + params.toString() : ''}`
    const response = await api.get(url)
    
    // Exportar a Excel con formato
    exportarReporteExcel(response.data)
    
    $q.notify({
      type: 'positive',
      message: `✅ Reporte exportado: ${response.data.total} registros`,
      timeout: 2000
    })
  } catch (error) {
    console.error('Error al exportar reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al exportar reporte'
    })
  }
}

function exportarReporteExcel(reporte) {
  // Hoja 1: Datos principales
  const datosCapacitaciones = reporte.capacitaciones.map((cap, index) => ({
    '#': index + 1,
    'ID': cap.id,
    'Cliente': cap.cliente,
    'Dirección': cap.direccion,
    'Cargo/Departamento': cap.cargo_departamento || '',
    'Fecha Instalación': formatDate(cap.fecha_instalacion),
    'Responsable Centro': cap.responsable_centro_salud || '',
    'Responsable Drager': cap.responsable_drager,
    'Email Drager': cap.responsable_drager_email || '',
    'Tipo Plantilla': cap.tipo_plantilla?.replace('.docx', '') || '',
    'Total Productos': cap.total_productos || 0,
    'Total Asistentes': cap.total_asistentes || 0,
    'Fecha Creación': new Date(cap.fecha_creado).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }))
  
  const ws1 = XLSX.utils.json_to_sheet(datosCapacitaciones)
  ws1['!cols'] = [
    { wch: 5 },  // #
    { wch: 6 },  // ID
    { wch: 30 }, // Cliente
    { wch: 35 }, // Dirección
    { wch: 25 }, // Cargo/Departamento
    { wch: 18 }, // Fecha Instalación
    { wch: 25 }, // Responsable Centro
    { wch: 20 }, // Responsable Drager
    { wch: 30 }, // Email Drager
    { wch: 20 }, // Tipo Plantilla
    { wch: 15 }, // Total Productos
    { wch: 15 }, // Total Asistentes
    { wch: 20 }  // Fecha Creación
  ]
  
  // Hoja 2: Resumen por cliente
  const resumenClientes = {}
  reporte.capacitaciones.forEach(cap => {
    if (!resumenClientes[cap.cliente]) {
      resumenClientes[cap.cliente] = {
        'Cliente': cap.cliente,
        'Total Capacitaciones': 0,
        'Total Productos': 0,
        'Total Asistentes': 0
      }
    }
    resumenClientes[cap.cliente]['Total Capacitaciones']++
    resumenClientes[cap.cliente]['Total Productos'] += cap.total_productos || 0
    resumenClientes[cap.cliente]['Total Asistentes'] += cap.total_asistentes || 0
  })
  
  const datosResumen = Object.values(resumenClientes)
  const ws2 = XLSX.utils.json_to_sheet(datosResumen)
  ws2['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }]
  
  // Hoja 3: Resumen por responsable
  const resumenResponsables = {}
  reporte.capacitaciones.forEach(cap => {
    const responsable = cap.responsable_drager || 'Sin responsable'
    if (!resumenResponsables[responsable]) {
      resumenResponsables[responsable] = {
        'Responsable': responsable,
        'Email': cap.responsable_drager_email || '',
        'Total Capacitaciones': 0,
        'Total Productos': 0,
        'Total Asistentes': 0
      }
    }
    resumenResponsables[responsable]['Total Capacitaciones']++
    resumenResponsables[responsable]['Total Productos'] += cap.total_productos || 0
    resumenResponsables[responsable]['Total Asistentes'] += cap.total_asistentes || 0
  })
  
  const datosResponsables = Object.values(resumenResponsables)
  const ws3 = XLSX.utils.json_to_sheet(datosResponsables)
  ws3['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }]
  
  // Crear workbook con múltiples hojas
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, ws1, 'Capacitaciones')
  XLSX.utils.book_append_sheet(workbook, ws2, 'Por Cliente')
  XLSX.utils.book_append_sheet(workbook, ws3, 'Por Responsable')
  
  // Guardar
  const nombreArchivo = `reporte_capacitaciones_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, nombreArchivo)
  
  console.log(`✅ Exportado: ${nombreArchivo}`)
  console.log(`📊 Total capacitaciones: ${reporte.total}`)
  console.log(`📋 Hojas: Capacitaciones, Por Cliente, Por Responsable`)
}

function limpiarFiltros() {
  filtros.value = {
    cliente: '',
    fecha_desde: '',
    fecha_hasta: '',
    tipo_plantilla: ''
  }
  buscarCapacitaciones()
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-ES')
}

function formatMes(mes) {
  if (!mes) return ''
  const [year, month] = mes.split('-')
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return `${meses[parseInt(month) - 1]} ${year}`
}
</script>
