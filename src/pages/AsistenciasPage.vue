<template>
  <q-page padding>
    <div class="text-h5 text-weight-medium q-mb-md">Reportes de Asistencias</div>

    <!-- Estadísticas Generales -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Total Asistencias</div>
            <div class="text-h3">{{ estadisticas.total_asistencias || 0 }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section class="bg-secondary text-white">
            <div class="text-h6">Técnicos</div>
            <div class="text-h3">{{ getTotalPorTipo('tecnico') }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section class="bg-info text-white">
            <div class="text-h6">Profesionales</div>
            <div class="text-h3">{{ getTotalPorTipo('profesional') }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section class="bg-positive text-white">
            <div class="text-h6">Promedio por Capacitación</div>
            <div class="text-h3">{{ estadisticas.promedio_por_capacitacion?.toFixed(1) || 0 }}</div>
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
              v-model="filtros.nombre"
              label="Nombre del Asistente"
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-2">
            <q-select
              v-model="filtros.tipo_asistente"
              :options="tiposAsistente"
              label="Tipo Asistente"
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="badge" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-2">
            <q-input
              v-model="filtros.capacitacion_id"
              label="ID Capacitación"
              type="number"
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="tag" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-2">
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

          <div class="col-12">
            <div class="row justify-end q-gutter-sm">
              <q-btn label="Limpiar" flat @click="limpiarFiltros" />
              <q-btn label="Buscar" color="primary" icon="search" @click="buscarAsistencias" />
              <q-btn 
                label="Excel Simple" 
                color="secondary" 
                icon="description" 
                @click="descargarExcel"
                :disable="asistencias.length === 0"
              >
                <q-tooltip>Exportar datos actuales a Excel (1 hoja)</q-tooltip>
              </q-btn>
              <q-btn 
                label="Excel Completo" 
                color="positive" 
                icon="table_chart" 
                @click="descargarExcelCompleto"
                :disable="asistencias.length === 0"
              >
                <q-tooltip v-if="asistencias.length === 0">
                  Primero realiza una búsqueda
                </q-tooltip>
                <q-tooltip v-else>
                  Exportar con estadísticas (4 hojas: Asistencias, Por Tipo, Por Cliente, Top Asistentes)
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Gráficos de Estadísticas -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-md">Por Mes</div>
            <q-list bordered separator>
              <q-item v-for="item in estadisticas.por_mes" :key="item.mes">
                <q-item-section>
                  <q-item-label>{{ formatMes(item.mes) }}</q-item-label>
                  <q-item-label caption>
                    Técnicos: {{ item.tecnicos }} | Profesionales: {{ item.profesionales }}
                  </q-item-label>
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
            <div class="text-subtitle1 text-weight-medium q-mb-md">Top 10 Asistentes Frecuentes</div>
            <q-list bordered separator>
              <q-item v-for="item in estadisticas.top_asistentes?.slice(0, 10)" :key="item.nombre">
                <q-item-section avatar>
                  <q-avatar 
                    :color="item.tipo_asistente === 'tecnico' ? 'secondary' : 'info'" 
                    text-color="white" 
                    icon="person"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.nombre }}</q-item-label>
                  <q-item-label caption>
                    <q-badge 
                      :color="item.tipo_asistente === 'tecnico' ? 'secondary' : 'info'"
                      :label="item.tipo_asistente.toUpperCase()"
                    />
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="positive" :label="item.total_asistencias" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-md">Asistencias por Capacitación</div>
            <q-list bordered separator>
              <q-item v-for="item in estadisticas.por_capacitacion?.slice(0, 10)" :key="item.capacitacion_id">
                <q-item-section>
                  <q-item-label>
                    <strong>ID {{ item.capacitacion_id }}:</strong> {{ item.cliente }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ formatDate(item.fecha_instalacion) }} | 
                    Técnicos: {{ item.tecnicos }} | Profesionales: {{ item.profesionales }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="primary" :label="`${item.total_asistentes} asistentes`" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabla de Asistencias -->
    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-md">
          Asistencias Encontradas: {{ asistencias.length }}
        </div>

        <!-- Vista Grid para móvil -->
        <div v-if="$q.screen.lt.md" class="row q-col-gutter-md">
          <div v-for="asistencia in asistencias" :key="asistencia.id" class="col-12">
            <q-card bordered>
              <q-card-section>
                <div class="text-subtitle1 text-weight-medium">{{ asistencia.nombre }}</div>
                <q-badge 
                  :color="asistencia.tipo_asistente === 'tecnico' ? 'secondary' : 'info'"
                  :label="asistencia.tipo_asistente.toUpperCase()"
                />
                <q-separator class="q-my-sm" />
                <div class="text-body2">
                  <div><strong>Capacitación ID:</strong> {{ asistencia.capacitacion_id }}</div>
                  <div><strong>Cliente:</strong> {{ asistencia.cliente }}</div>
                  <div><strong>Fecha:</strong> {{ formatDate(asistencia.fecha) }}</div>
                  <div><strong>Responsable:</strong> {{ asistencia.responsable_drager }}</div>
                  <div v-if="asistencia.productos_capacitacion">
                    <strong>Productos:</strong> {{ asistencia.productos_capacitacion }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Vista Tabla para escritorio -->
        <q-table
          v-else
          :rows="asistencias"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          :pagination="{ rowsPerPage: 15 }"
        >
          <template v-slot:body-cell-tipo_asistente="props">
            <q-td :props="props">
              <q-badge 
                :color="props.row.tipo_asistente === 'tecnico' ? 'secondary' : 'info'"
                :label="props.row.tipo_asistente.toUpperCase()"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-fecha="props">
            <q-td :props="props">
              {{ formatDate(props.row.fecha) }}
            </q-td>
          </template>

          <template v-slot:body-cell-firma="props">
            <q-td :props="props">
              <q-icon 
                :name="props.row.firma ? 'check_circle' : 'cancel'"
                :color="props.row.firma ? 'positive' : 'negative'"
                size="sm"
              />
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
const asistencias = ref([])
const estadisticas = ref({})

const tiposAsistente = ['tecnico', 'profesional']

const filtros = ref({
  nombre: '',
  tipo_asistente: '',
  capacitacion_id: '',
  fecha_desde: '',
  fecha_hasta: ''
})

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'capacitacion_id', label: 'Cap. ID', field: 'capacitacion_id', align: 'center', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'tipo_asistente', label: 'Tipo', field: 'tipo_asistente', align: 'center', sortable: true },
  { name: 'fecha', label: 'Fecha Asistencia', field: 'fecha', align: 'left', sortable: true },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left', sortable: true },
  { name: 'responsable_drager', label: 'Responsable Drager', field: 'responsable_drager', align: 'left' },
  { name: 'productos_capacitacion', label: 'Productos', field: 'productos_capacitacion', align: 'center' },
  { name: 'firma', label: 'Firma', field: 'firma', align: 'center' }
]

onMounted(() => {
  cargarEstadisticas()
  buscarAsistencias()
})

async function cargarEstadisticas() {
  try {
    const response = await api.get('/asistencias/estadisticas')
    estadisticas.value = response.data
    console.log('Estadísticas cargadas:', estadisticas.value)
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar estadísticas'
    })
  }
}

async function buscarAsistencias() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    
    if (filtros.value.nombre) params.append('nombre', filtros.value.nombre)
    if (filtros.value.tipo_asistente) params.append('tipo_asistente', filtros.value.tipo_asistente)
    if (filtros.value.capacitacion_id) params.append('capacitacion_id', filtros.value.capacitacion_id)
    if (filtros.value.fecha_desde) params.append('fecha_desde', filtros.value.fecha_desde)
    if (filtros.value.fecha_hasta) params.append('fecha_hasta', filtros.value.fecha_hasta)

    const url = `/asistencias/reporte${params.toString() ? '?' + params.toString() : ''}`
    const response = await api.get(url)
    asistencias.value = response.data.asistencias || []
    
    console.log('Asistencias cargadas:', asistencias.value.length)
    
    $q.notify({
      type: 'positive',
      message: `${asistencias.value.length} asistencias encontradas`,
      timeout: 1000
    })
  } catch (error) {
    console.error('Error al buscar asistencias:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al buscar asistencias'
    })
  } finally {
    loading.value = false
  }
}

function descargarExcel() {
  if (asistencias.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos para exportar'
    })
    return
  }

  try {
    // Preparar datos
    const datosAsistencias = asistencias.value.map((asist, index) => ({
      '#': index + 1,
      'ID': asist.id,
      'ID Capacitación': asist.capacitacion_id,
      'Nombre Asistente': asist.nombre,
      'Tipo': asist.tipo_asistente?.toUpperCase() || '',
      'Fecha Asistencia': formatDate(asist.fecha),
      'Cliente': asist.cliente || '',
      'Dirección': asist.direccion || '',
      'Responsable Centro': asist.responsable_centro_salud || '',
      'Fecha Instalación': formatDate(asist.fecha_instalacion),
      'Tipo Plantilla': asist.tipo_plantilla?.replace('.docx', '') || '',
      'Responsable Drager': asist.responsable_drager || '',
      'Email Drager': asist.responsable_drager_email || '',
      'Productos': asist.productos_capacitacion || 0,
      'Tiene Firma': asist.firma ? 'SÍ' : 'NO',
      'Fecha Registro': new Date(asist.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }))
    
    const worksheet = XLSX.utils.json_to_sheet(datosAsistencias)
    
    // Configurar anchos de columna
    worksheet['!cols'] = [
      { wch: 5 },  // #
      { wch: 6 },  // ID
      { wch: 15 }, // ID Capacitación
      { wch: 25 }, // Nombre
      { wch: 12 }, // Tipo
      { wch: 18 }, // Fecha Asistencia
      { wch: 30 }, // Cliente
      { wch: 35 }, // Dirección
      { wch: 25 }, // Responsable Centro
      { wch: 18 }, // Fecha Instalación
      { wch: 20 }, // Tipo Plantilla
      { wch: 20 }, // Responsable Drager
      { wch: 30 }, // Email Drager
      { wch: 10 }, // Productos
      { wch: 12 }, // Tiene Firma
      { wch: 20 }  // Fecha Registro
    ]
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistencias')
    
    const nombreArchivo = `asistencias_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, nombreArchivo)
    
    $q.notify({
      type: 'positive',
      message: `✅ Excel exportado: ${asistencias.value.length} registros`,
      timeout: 2000
    })
  } catch (error) {
    console.error('Error al exportar:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al exportar a Excel'
    })
  }
}

function descargarExcelCompleto() {
  if (asistencias.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos para exportar'
    })
    return
  }

  try {
    // Hoja 1: Datos principales
    const datosAsistencias = asistencias.value.map((asist, index) => ({
      '#': index + 1,
      'ID': asist.id,
      'ID Capacitación': asist.capacitacion_id,
      'Nombre Asistente': asist.nombre,
      'Tipo': asist.tipo_asistente?.toUpperCase() || '',
      'Fecha Asistencia': formatDate(asist.fecha),
      'Cliente': asist.cliente || '',
      'Dirección': asist.direccion || '',
      'Responsable Centro': asist.responsable_centro_salud || '',
      'Fecha Instalación': formatDate(asist.fecha_instalacion),
      'Responsable Drager': asist.responsable_drager || '',
      'Email Drager': asist.responsable_drager_email || '',
      'Productos': asist.productos_capacitacion || 0,
      'Tiene Firma': asist.firma ? 'SÍ' : 'NO'
    }))
    
    const ws1 = XLSX.utils.json_to_sheet(datosAsistencias)
    ws1['!cols'] = [
      { wch: 5 }, { wch: 6 }, { wch: 15 }, { wch: 25 }, { wch: 12 },
      { wch: 18 }, { wch: 30 }, { wch: 35 }, { wch: 25 }, { wch: 18 },
      { wch: 20 }, { wch: 30 }, { wch: 10 }, { wch: 12 }
    ]
    
    // Hoja 2: Resumen por tipo
    const resumenTipo = {}
    asistencias.value.forEach(asist => {
      const tipo = asist.tipo_asistente || 'Sin tipo'
      if (!resumenTipo[tipo]) {
        resumenTipo[tipo] = {
          'Tipo': tipo.toUpperCase(),
          'Total Asistencias': 0,
          'Clientes Distintos': new Set()
        }
      }
      resumenTipo[tipo]['Total Asistencias']++
      if (asist.cliente) resumenTipo[tipo]['Clientes Distintos'].add(asist.cliente)
    })
    
    const datosTipo = Object.values(resumenTipo).map(item => ({
      'Tipo': item.Tipo,
      'Total Asistencias': item['Total Asistencias'],
      'Clientes Distintos': item['Clientes Distintos'].size
    }))
    
    const ws2 = XLSX.utils.json_to_sheet(datosTipo)
    ws2['!cols'] = [{ wch: 15 }, { wch: 18 }, { wch: 18 }]
    
    // Hoja 3: Resumen por cliente
    const resumenClientes = {}
    asistencias.value.forEach(asist => {
      const cliente = asist.cliente || 'Sin cliente'
      if (!resumenClientes[cliente]) {
        resumenClientes[cliente] = {
          'Cliente': cliente,
          'Total Asistentes': 0,
          'Técnicos': 0,
          'Profesionales': 0
        }
      }
      resumenClientes[cliente]['Total Asistentes']++
      if (asist.tipo_asistente === 'tecnico') resumenClientes[cliente]['Técnicos']++
      if (asist.tipo_asistente === 'profesional') resumenClientes[cliente]['Profesionales']++
    })
    
    const datosClientes = Object.values(resumenClientes)
    const ws3 = XLSX.utils.json_to_sheet(datosClientes)
    ws3['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 15 }, { wch: 18 }]
    
    // Hoja 4: Top asistentes
    const conteoAsistentes = {}
    asistencias.value.forEach(asist => {
      const key = `${asist.nombre}_${asist.tipo_asistente}`
      if (!conteoAsistentes[key]) {
        conteoAsistentes[key] = {
          'Nombre': asist.nombre,
          'Tipo': asist.tipo_asistente?.toUpperCase() || '',
          'Veces que Asistió': 0,
          'Última Asistencia': asist.fecha
        }
      }
      conteoAsistentes[key]['Veces que Asistió']++
      if (new Date(asist.fecha) > new Date(conteoAsistentes[key]['Última Asistencia'])) {
        conteoAsistentes[key]['Última Asistencia'] = asist.fecha
      }
    })
    
    const topAsistentes = Object.values(conteoAsistentes)
      .sort((a, b) => b['Veces que Asistió'] - a['Veces que Asistió'])
      .slice(0, 20)
      .map(item => ({
        ...item,
        'Última Asistencia': formatDate(item['Última Asistencia'])
      }))
    
    const ws4 = XLSX.utils.json_to_sheet(topAsistentes)
    ws4['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 18 }, { wch: 18 }]
    
    // Crear workbook con múltiples hojas
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, ws1, 'Asistencias')
    XLSX.utils.book_append_sheet(workbook, ws2, 'Por Tipo')
    XLSX.utils.book_append_sheet(workbook, ws3, 'Por Cliente')
    XLSX.utils.book_append_sheet(workbook, ws4, 'Top Asistentes')
    
    const nombreArchivo = `asistencias_completo_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, nombreArchivo)
    
    console.log(`✅ Exportado: ${nombreArchivo}`)
    console.log(`📊 Total asistencias: ${asistencias.value.length}`)
    console.log(`📋 Hojas: Asistencias, Por Tipo, Por Cliente, Top Asistentes`)
    
    $q.notify({
      type: 'positive',
      message: `✅ Excel completo exportado: ${asistencias.value.length} registros`,
      timeout: 2000
    })
  } catch (error) {
    console.error('Error al exportar:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al exportar Excel completo'
    })
  }
}

function limpiarFiltros() {
  filtros.value = {
    nombre: '',
    tipo_asistente: '',
    capacitacion_id: '',
    fecha_desde: '',
    fecha_hasta: ''
  }
  buscarAsistencias()
}

function getTotalPorTipo(tipo) {
  const encontrado = estadisticas.value.por_tipo?.find(item => item.tipo_asistente === tipo)
  return encontrado?.total || 0
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
