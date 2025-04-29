const express = require("express");
const router = express.Router();
const {
  getServiciosAdicionalesController,
  getServicioAdicionalByIdController,
  getServiciosByTipoController,
  getServiciosByProveedorController,
  getServiciosByEspacioController,
  getServiciosByRangoPrecioController,
  getServiciosByUnidadPrecioController,
  getServiciosDisponiblesEnFechaController,
  createServicioAdicionalController,
  updateServicioAdicionalController,
  deleteServicioAdicionalController,
  activarServicioAdicionalController,
  actualizarPrecioController,
  actualizarDisponibilidadController,
  asignarEspacioController,
  eliminarEspacioController,
  getServiciosConAprobacionController,
  filtrarServiciosAdicionalesController
} = require("../controllers/servicioAdicional.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createServicioAdicionalSchema,
  updateServicioAdicionalSchema
} = require("./validations/servicioAdicional.validation");

router.get("/servicios-adicionales", getServiciosAdicionalesController);

router.get("/servicios-adicionales/precio", getServiciosByRangoPrecioController);
router.get("/servicios-adicionales/tipo/:tipo", getServiciosByTipoController);
router.get("/servicios-adicionales/proveedor/:proveedorId", getServiciosByProveedorController);
router.get("/servicios-adicionales/espacio/:espacioId", getServiciosByEspacioController);
router.get("/servicios-adicionales/unidad-precio/:unidadPrecio", getServiciosByUnidadPrecioController);
router.get("/servicios-adicionales/disponibles", getServiciosDisponiblesEnFechaController);
router.get("/servicios-adicionales/aprobacion", getServiciosConAprobacionController);
router.get("/servicios-adicionales/filtrar", filtrarServiciosAdicionalesController);

router.get(
  "/servicios-adicionales/:id([0-9a-fA-F]{24})",
  getServicioAdicionalByIdController
);

router.post(
  "/servicios-adicionales",
  payloadMiddleware(createServicioAdicionalSchema),
  createServicioAdicionalController
);

router.put(
  "/servicios-adicionales/:id",
  payloadMiddleware(updateServicioAdicionalSchema),
  updateServicioAdicionalController
);

router.delete(
  "/servicios-adicionales/:id",
  deleteServicioAdicionalController
);

router.put(
  "/servicios-adicionales/:id/activar",
  activarServicioAdicionalController
);

router.post(
  "/servicios-adicionales/:id/espacio",
  asignarEspacioController
);

router.delete(
  "/servicios-adicionales/:id/espacio/:espacioId",
  eliminarEspacioController
);

module.exports = router;
