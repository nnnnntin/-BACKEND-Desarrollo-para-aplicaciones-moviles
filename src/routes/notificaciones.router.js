const express = require("express");
const router = express.Router();

const {
  getNotificacionesController,
  getNotificacionByIdController,
  getNotificacionesByUsuarioController,
  getNotificacionesPorTipoController,
  createNotificacionController,
  updateNotificacionController,
  deleteNotificacionController,
  marcarComoLeidaController,
  marcarTodasComoLeidasController,
  getNotificacionesPorEntidadController,
  filtrarNotificacionesController
} = require("../controllers/notificacion.controller");

const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createNotificacionSchema,
  updateNotificacionSchema,
  marcarLeidaSchema
} = require("../routes/validations/notificacion.validation");

router.get("/notificaciones", getNotificacionesController);

router.get("/notificaciones/filtrar", filtrarNotificacionesController);

router.get("/notificaciones/usuario/:usuarioId", getNotificacionesByUsuarioController);

router.get("/notificaciones/tipo/:tipo", getNotificacionesPorTipoController);

router.get("/notificaciones/entidad/:tipoEntidad/:entidadId", getNotificacionesPorEntidadController);

router.get("/notificaciones/:id", getNotificacionByIdController);

router.post(
  "/notificaciones",
  payloadMiddleware(createNotificacionSchema),
  createNotificacionController
);

router.put(
  "/notificaciones/:id",
  payloadMiddleware(updateNotificacionSchema),
  updateNotificacionController
);

router.delete(
  "/notificaciones/:id",
  deleteNotificacionController
);

router.post(
  "/notificaciones/leer",
  payloadMiddleware(marcarLeidaSchema),
  marcarComoLeidaController
);

router.put(
  "/notificaciones/usuario/:usuarioId/leer-todas",
  marcarTodasComoLeidasController
);

module.exports = router;
