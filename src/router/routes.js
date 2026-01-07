const routes = [
  {
    path: "/login",
    component: () => import("pages/LoginPage.vue"),
  },
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", redirect: "/capacitaciones" },

      {
        path: "usuarios",
        component: () => import("pages/UsuariosPage.vue"),
        meta: { requiresAdmin: true },
      },

      {
        path: "secciones",
        component: () => import("pages/SeccionesPage.vue"),
        meta: { requiresAdmin: true },
      },

      {
        path: "productos",
        component: () => import("pages/ProductosPage.vue"),
        meta: { requiresAdmin: true },
      },

      {
        path: "asistencias",
        component: () => import("pages/AsistenciasPage.vue"),
        meta: { requiresAuth: true },
      },

      {
        path: "capacitaciones",
        component: () => import("pages/CapacitacionesPage.vue"),
        meta: { requiresAuth: true },
      },

      {
        path: "capacitaciones/:id/productos",
        component: () => import("pages/CapacitacionProductosPage.vue"),
        meta: { requiresAuth: true },
      },

      {
        path: "reportes",
        component: () => import("pages/ReportesPage.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },
];

export default routes;
