const express = require("express");
const router = express.Router();
const payloadMiddleware = require("../middlewares/payload.middleware");

const {
  getReservasServicioController,
  getReservaServicioByIdController,
  getReservasByUsuarioController,
  getReservasByServicioController,
  getReservasByReservaEspacioController,
  getReservasPorEstadoController,
  getReservasPorRangoFechasController,
  createReservaServicioController,
  updateReservaServicioController,
  deleteReservaServicioController,
  cambiarEstadoReservaController,
  confirmarReservaServicioController,
  cancelarReservaServicioController,
  completarReservaServicioController,
  vincularPagoController,
  getReservasPendientesByFechaController,
  aprobarRechazarReservaServicioController,
  filtrarReservasServicioController
} = require("../controllers/reservaServicio.controller");

const {
  createReservaServicioSchema,
  updateReservaServicioSchema,
  aprobarRechazarReservaServicioSchema
} = require("./validations/reservaServicio.validation");

router.get("/reservas-servicio/pendientes",    getReservasPendientesByFechaController);
router.get(
  "/reservas-servicio/filtrar",
  filtrarReservasServicioController
);

router.get("/reservas-servicio",     getReservasServicioController);
router.get("/reservas-servicio/:id", getReservaServicioByIdController);
router.post(
  "/reservas-servicio",
  payloadMiddleware(createReservaServicioSchema),
  createReservaServicioController
);
router.put(
  "/reservas-servicio/:id",
  payloadMiddleware(updateReservaServicioSchema),
  updateReservaServicioController
);
router.delete(
  "/reservas-servicio/:id",
  deleteReservaServicioController
);

router.get(
  "/reservas-servicio/usuario/:usuarioId",
  getReservasByUsuarioController
);
router.get(
  "/reservas-servicio/servicio/:servicioId",
  getReservasByServicioController
);
router.get(
  "/reservas-servicio/reserva-espacio/:reservaEspacioId",
  getReservasByReservaEspacioController
);
router.get("/reservas-servicio/estado/:estado", getReservasPorEstadoController);
router.get("/reservas-servicio/fechas",         getReservasPorRangoFechasController);

router.put(
  "/reservas-servicio/:id/estado",
  cambiarEstadoReservaController
);
router.put(
  "/reservas-servicio/:id/confirmar",
  confirmarReservaServicioController
);
router.put(
  "/reservas-servicio/:id/cancelar",
  cancelarReservaServicioController
);
router.put(
  "/reservas-servicio/:id/completar",
  completarReservaServicioController
);

router.put(
  "/reservas-servicio/:id/pago",
  vincularPagoController
);
router.post(
  "/reservas-servicio/aprobar-rechazar",
  payloadMiddleware(aprobarRechazarReservaServicioSchema),
  aprobarRechazarReservaServicioController
);

module.exports = router;
