const express = require("express");
const router = express.Router();

const {
  getReservasController,
  getReservaByIdController,
  getReservasByUsuarioController,
  getReservasByClienteController,
  getReservasByEntidadController,
  getReservasPendientesAprobacionController,
  getReservasPorFechaController,
  createReservaController,
  updateReservaController,
  deleteReservaController,
  cambiarEstadoReservaController,
  aprobarReservaController,
  rechazarReservaController,
  getReservasRecurrentesController,
  vincularPagoReservaController,
  cancelarReservaController,
  filtrarReservasController,
  getEstadisticasGananciasClienteController,
  getReservasByProveedorController
} = require("../controllers/reserva.controller");

const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createReservaSchema,
  updateReservaSchema,
  cancelarReservaSchema
} = require("../routes/validations/reserva.validation");

router.get("/reservas/pendientes", getReservasPendientesAprobacionController);
router.get("/reservas/fecha", getReservasPorFechaController);
router.get("/reservas/recurrentes", getReservasRecurrentesController);
router.get("/reservas/filtrar", filtrarReservasController);

router.get("/reservas/cliente/:clienteId", getReservasByClienteController); 
router.get("/reservas/cliente/:clienteId/estadisticas", getEstadisticasGananciasClienteController); 

router.get("/reservas/usuario/:usuarioId", getReservasByUsuarioController);
router.get("/reservas/entidad/:tipoEntidad/:entidadId", getReservasByEntidadController);

router.get("/reservas/:id", getReservaByIdController);

router.get("/reservas/proveedor/:proveedorId", getReservasByProveedorController);

router.get("/reservas", getReservasController);
router.post("/reservas",
  payloadMiddleware(createReservaSchema),
  createReservaController
);
router.put("/reservas/:id",
  payloadMiddleware(updateReservaSchema),
  updateReservaController
);
router.delete("/reservas/:id", deleteReservaController);

router.put("/reservas/:id/estado", cambiarEstadoReservaController);
router.put("/reservas/:id/aprobar", aprobarReservaController);
router.put("/reservas/:id/rechazar", rechazarReservaController);
router.put("/reservas/:id/pago", vincularPagoReservaController);
router.post(
  "/reservas/cancelar",
  payloadMiddleware(cancelarReservaSchema),
  cancelarReservaController
);

module.exports = router;