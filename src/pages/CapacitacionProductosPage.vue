<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <q-btn 
        flat 
        round 
        dense 
        icon="arrow_back" 
        @click="$router.back()"
      />
      <div class="text-h5 text-weight-medium q-ml-md">
        Productos de Capacitación #{{ capacitacionId }}
      </div>
    </div>

    <!-- Información de la capacitación -->
    <q-card flat bordered class="q-mb-md" v-if="capacitacion">
      <q-card-section class="bg-primary text-white">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <div class="text-caption">Cliente</div>
            <div class="text-body1 text-weight-medium">{{ capacitacion.cliente }}</div>
          </div>
          <div class="col-12 col-md-4">
            <div class="text-caption">Fecha Instalación</div>
            <div class="text-body1">{{ formatDate(capacitacion.fecha_instalacion) }}</div>
          </div>
          <div class="col-12 col-md-4">
            <div class="text-caption">Responsable Drager</div>
            <div class="text-body1">{{ capacitacion.responsable_drager }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Botones de acción -->
    <div :class="$q.screen.lt.md ? 'column q-gutter-sm q-mb-md' : 'row q-gutter-sm q-mb-md'">
      <q-btn
        :label="$q.screen.lt.md ? 'Agregar' : 'Agregar Producto'"
        color="primary"
        icon="add"
        @click="abrirDialogoAgregar"
        :class="$q.screen.lt.md ? 'full-width' : ''"
      />
      <q-btn
        :label="$q.screen.lt.md ? 'Múltiples' : 'Agregar Múltiples'"
        color="secondary"
        icon="playlist_add"
        @click="abrirDialogoMultiple"
        :class="$q.screen.lt.md ? 'full-width' : ''"
      />
      <q-space v-if="!$q.screen.lt.md" />
      <q-btn
        :label="$q.screen.lt.md ? 'Excel' : 'Exportar a Excel'"
        color="positive"
        icon="description"
        @click="exportarExcel"
        :disable="productos.length === 0"
        :class="$q.screen.lt.md ? 'full-width' : ''"
      >
        <q-tooltip v-if="productos.length === 0">
          No hay productos para exportar
        </q-tooltip>
        <q-tooltip v-else>
          Exportar listado de productos a Excel
        </q-tooltip>
      </q-btn>
    </div>

    <!-- Tabla de productos -->
    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-md">
          Productos Asignados: {{ productos.length }}
        </div>

        <!-- Vista Grid para móvil -->
        <div v-if="$q.screen.lt.md" class="row q-col-gutter-md">
          <div v-for="prod in productos" :key="prod.id" class="col-12">
            <q-card bordered>
              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <div class="col">
                    <div class="text-subtitle1 text-weight-medium">{{ prod.producto_nombre }}</div>
                    <q-badge color="primary" :label="prod.seccion_nombre" />
                  </div>
                  <div class="col-auto">
                    <q-btn
                      flat
                      round
                      dense
                      icon="edit"
                      color="primary"
                      @click="abrirDialogoEditar(prod)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      color="negative"
                      @click="confirmarEliminar(prod)"
                    />
                  </div>
                </div>
                <q-separator class="q-my-sm" />
                <div class="text-body2">
                  <div v-if="prod.referencia"><strong>Referencia:</strong> {{ prod.referencia }}</div>
                  <div v-if="prod.numero_serie"><strong>N° Serie:</strong> {{ prod.numero_serie }}</div>
                  <div v-if="prod.version_software"><strong>Versión SW:</strong> {{ prod.version_software }}</div>
                  <div v-if="prod.internal_id"><strong>ID Interno:</strong> {{ prod.internal_id }}</div>
                </div>
              </q-card-section>
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
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:body-cell-producto_nombre="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.row.producto_nombre }}</div>
              <div class="text-caption text-grey-7">{{ props.row.referencia }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-seccion_nombre="props">
            <q-td :props="props">
              <q-badge color="primary" :label="props.row.seccion_nombre" />
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
                @click="abrirDialogoEditar(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="confirmarEliminar(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Diálogo para agregar un producto -->
    <q-dialog v-model="dialogoAgregar" :maximized="$q.screen.lt.md">
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Agregar Producto</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="agregarProducto">
            <!-- Buscador de productos -->
            <q-select
              v-model="formAgregar.producto"
              :options="productosDisponibles"
              option-value="id"
              option-label="nombre"
              label="Buscar Producto"
              outlined
              use-input
              input-debounce="300"
              @filter="buscarProductosDisponibles"
              class="q-mb-md"
              :rules="[val => !!val || 'Selecciona un producto']"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                    <q-item-label caption>
                      <q-badge color="primary" :label="scope.opt.seccion_nombre" />
                      {{ scope.opt.referencia }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
              v-model="formAgregar.numero_serie"
              label="Número de Serie (opcional)"
              outlined
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="pin" />
              </template>
            </q-input>

            <q-input
              v-model="formAgregar.version_software"
              label="Versión Software (opcional)"
              outlined
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="settings" />
              </template>
            </q-input>

            <q-input
              v-model="formAgregar.internal_id"
              label="ID Interno (opcional)"
              outlined
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="tag" />
              </template>
            </q-input>

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancelar" flat v-close-popup />
              <q-btn label="Agregar" type="submit" color="primary" :loading="guardando" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diálogo para agregar múltiples productos -->
    <q-dialog v-model="dialogoMultiple" :maximized="$q.screen.lt.md">
      <q-card style="min-width: 600px">
        <q-card-section class="bg-secondary text-white">
          <div class="text-h6">Agregar Múltiples Productos</div>
        </q-card-section>

        <q-card-section>
          <div class="q-mb-md">
            <q-select
              v-model="productoTemp"
              :options="productosDisponibles"
              option-value="id"
              option-label="nombre"
              label="Buscar y agregar a la lista"
              outlined
              use-input
              input-debounce="300"
              @filter="buscarProductosDisponibles"
              @update:model-value="agregarAListaTemp"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                    <q-item-label caption>
                      <q-badge color="primary" :label="scope.opt.seccion_nombre" />
                      {{ scope.opt.referencia }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div class="text-subtitle2 q-mb-sm">Productos seleccionados: {{ listaProductosMultiple.length }}</div>

          <q-list bordered separator>
            <q-item v-for="(item, index) in listaProductosMultiple" :key="index">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" icon="inventory_2" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.producto.nombre }}</q-item-label>
                <q-item-label caption>{{ item.producto.seccion_nombre }}</q-item-label>
                <div class="row q-col-gutter-sm q-mt-xs">
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="item.numero_serie"
                      label="N° Serie"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="item.version_software"
                      label="Versión SW"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="item.internal_id"
                      label="ID Interno"
                      outlined
                      dense
                    />
                  </div>
                </div>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  @click="listaProductosMultiple.splice(index, 1)"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn label="Cancelar" flat v-close-popup />
            <q-btn 
              label="Guardar Todos" 
              color="secondary" 
              icon="save" 
              @click="agregarProductosMultiples"
              :loading="guardando"
              :disable="listaProductosMultiple.length === 0"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diálogo para editar producto -->
    <q-dialog v-model="dialogoEditar" :maximized="$q.screen.lt.md">
      <q-card style="min-width: 500px">
        <q-card-section class="bg-info text-white">
          <div class="text-h6">Editar Producto</div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            {{ formEditar.producto_nombre }}
            <q-badge color="primary" :label="formEditar.seccion_nombre" class="q-ml-sm" />
          </div>

          <q-form @submit="actualizarProducto">
            <q-input
              v-model="formEditar.numero_serie"
              label="Número de Serie"
              outlined
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="pin" />
              </template>
            </q-input>

            <q-input
              v-model="formEditar.version_software"
              label="Versión Software"
              outlined
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="settings" />
              </template>
            </q-input>

            <q-input
              v-model="formEditar.internal_id"
              label="ID Interno"
              outlined
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="tag" />
              </template>
            </q-input>

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancelar" flat v-close-popup />
              <q-btn label="Actualizar" type="submit" color="primary" :loading="guardando" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'

const route = useRoute()
const $q = useQuasar()

const capacitacionId = ref(route.params.id)
const loading = ref(false)
const guardando = ref(false)
const productos = ref([])
const capacitacion = ref(null)
const productosDisponibles = ref([])
const productoTemp = ref(null)

const dialogoAgregar = ref(false)
const dialogoMultiple = ref(false)
const dialogoEditar = ref(false)

const formAgregar = ref({
  producto: null,
  numero_serie: '',
  version_software: '',
  internal_id: ''
})

const formEditar = ref({
  id: null,
  producto_nombre: '',
  seccion_nombre: '',
  numero_serie: '',
  version_software: '',
  internal_id: ''
})

const listaProductosMultiple = ref([])

const columns = [
  { name: 'producto_nombre', label: 'Producto', field: 'producto_nombre', align: 'left', sortable: true },
  { name: 'seccion_nombre', label: 'Sección', field: 'seccion_nombre', align: 'center', sortable: true },
  { name: 'numero_serie', label: 'N° Serie', field: 'numero_serie', align: 'left' },
  { name: 'version_software', label: 'Versión SW', field: 'version_software', align: 'left' },
  { name: 'internal_id', label: 'ID Interno', field: 'internal_id', align: 'left' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

onMounted(() => {
  cargarProductos()
  cargarCapacitacion()
})

async function cargarCapacitacion() {
  try {
    const response = await api.get(`/capacitaciones/${capacitacionId.value}`)
    capacitacion.value = response.data
  } catch (error) {
    console.error('Error al cargar capacitación:', error)
  }
}

async function cargarProductos() {
  loading.value = true
  try {
    const response = await api.get(`/capacitaciones/${capacitacionId.value}/productos`)
    productos.value = response.data
    console.log('Productos cargados:', productos.value.length)
  } catch (error) {
    console.error('Error al cargar productos:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al cargar productos'
    })
  } finally {
    loading.value = false
  }
}

async function buscarProductosDisponibles(val, update) {
  if (val.length < 2) {
    update(() => {
      productosDisponibles.value = []
    })
    return
  }

  try {
    const response = await api.get(`/productos/buscar?q=${val}`)
    update(() => {
      productosDisponibles.value = response.data
    })
  } catch (error) {
    console.error('Error al buscar productos:', error)
    update(() => {
      productosDisponibles.value = []
    })
  }
}

function abrirDialogoAgregar() {
  formAgregar.value = {
    producto: null,
    numero_serie: '',
    version_software: '',
    internal_id: ''
  }
  dialogoAgregar.value = true
}

async function agregarProducto() {
  guardando.value = true
  try {
    const payload = {
      producto_id: formAgregar.value.producto.id,
      numero_serie: formAgregar.value.numero_serie || null,
      version_software: formAgregar.value.version_software || null,
      internal_id: formAgregar.value.internal_id || null
    }

    await api.post(`/capacitaciones/${capacitacionId.value}/productos`, payload)
    
    $q.notify({
      type: 'positive',
      message: 'Producto agregado exitosamente'
    })
    
    dialogoAgregar.value = false
    cargarProductos()
  } catch (error) {
    console.error('Error al agregar producto:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al agregar producto'
    })
  } finally {
    guardando.value = false
  }
}

function abrirDialogoMultiple() {
  listaProductosMultiple.value = []
  productoTemp.value = null
  dialogoMultiple.value = true
}

function agregarAListaTemp(producto) {
  if (producto && !listaProductosMultiple.value.find(p => p.producto.id === producto.id)) {
    listaProductosMultiple.value.push({
      producto: producto,
      numero_serie: '',
      version_software: '',
      internal_id: ''
    })
  }
  productoTemp.value = null
}

async function agregarProductosMultiples() {
  guardando.value = true
  try {
    const payload = {
      productos: listaProductosMultiple.value.map(item => ({
        producto_id: item.producto.id,
        numero_serie: item.numero_serie || null,
        version_software: item.version_software || null,
        internal_id: item.internal_id || null
      }))
    }

    const response = await api.post(
      `/capacitaciones/${capacitacionId.value}/productos/batch`,
      payload
    )
    
    const { agregados, errores } = response.data.resultados
    
    let mensaje = `✅ ${agregados.length} productos agregados`
    if (errores && errores.length > 0) {
      mensaje += `\n⚠️ ${errores.length} productos con errores`
    }
    
    $q.notify({
      type: agregados.length > 0 ? 'positive' : 'warning',
      message: mensaje,
      multiLine: true,
      timeout: 3000
    })
    
    dialogoMultiple.value = false
    cargarProductos()
  } catch (error) {
    console.error('Error al agregar productos:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al agregar productos'
    })
  } finally {
    guardando.value = false
  }
}

function abrirDialogoEditar(producto) {
  formEditar.value = { ...producto }
  dialogoEditar.value = true
}

async function actualizarProducto() {
  guardando.value = true
  try {
    const payload = {
      numero_serie: formEditar.value.numero_serie || null,
      version_software: formEditar.value.version_software || null,
      internal_id: formEditar.value.internal_id || null
    }

    await api.put(
      `/capacitaciones/${capacitacionId.value}/productos/${formEditar.value.id}`,
      payload
    )
    
    $q.notify({
      type: 'positive',
      message: 'Producto actualizado exitosamente'
    })
    
    dialogoEditar.value = false
    cargarProductos()
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al actualizar producto'
    })
  } finally {
    guardando.value = false
  }
}

function confirmarEliminar(producto) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar "${producto.producto_nombre}" de esta capacitación?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await eliminarProducto(producto.id)
  })
}

async function eliminarProducto(productoId) {
  try {
    await api.delete(`/capacitaciones/${capacitacionId.value}/productos/${productoId}`)
    
    $q.notify({
      type: 'positive',
      message: 'Producto eliminado exitosamente'
    })
    
    cargarProductos()
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al eliminar producto'
    })
  }
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-ES')
}

function exportarExcel() {
  if (productos.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay productos para exportar'
    })
    return
  }

  try {
    // Preparar datos
    const datosExcel = productos.value.map((prod, index) => ({
      '#': index + 1,
      'ID': prod.id,
      'Producto': prod.producto_nombre,
      'Referencia': prod.referencia || '',
      'Sección': prod.seccion_nombre,
      'Número de Serie': prod.numero_serie || '',
      'Versión Software': prod.version_software || '',
      'ID Interno': prod.internal_id || ''
    }))
    
    const worksheet = XLSX.utils.json_to_sheet(datosExcel)
    
    // Configurar anchos de columna
    worksheet['!cols'] = [
      { wch: 5 },  // #
      { wch: 6 },  // ID
      { wch: 30 }, // Producto
      { wch: 25 }, // Referencia
      { wch: 20 }, // Sección
      { wch: 20 }, // Número de Serie
      { wch: 20 }, // Versión Software
      { wch: 15 }  // ID Interno
    ]
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos')
    
    const cliente = capacitacion.value?.cliente || 'capacitacion'
    const nombreArchivo = `productos_${cliente.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, nombreArchivo)
    
    $q.notify({
      type: 'positive',
      message: `✅ Excel exportado: ${productos.value.length} productos`,
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
</script>
