const express = require("express");
const router = express.Router();
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  getResenasController,
  getResenaByIdController,
  getResenasByUsuarioController,
  getResenasByEntidadController,
  getResenasByReservaController,
  getResenasPorCalificacionController,
  createResenaController,
  updateResenaController,
  deleteResenaController,
  cambiarEstadoResenaController,
  responderResenaController,
  moderarResenaController,
  getPromedioCalificacionEntidadController
} = require("../controllers/resena.controller");
const {
  createResenaSchema,
  updateResenaSchema,
  responderResenaSchema,
  moderarResenaSchema
} = require("../routes/validations/resena.validation");

router.get("/resenas", getResenasController);

router.get("/resenas/calificacion", getResenasPorCalificacionController);

router.get("/resenas/usuario/:usuarioId", getResenasByUsuarioController);

router.get("/resenas/entidad/:tipoEntidad/:entidadId", getResenasByEntidadController);

router.get("/resenas/reserva/:reservaId", getResenasByReservaController);

router.get("/resenas/promedio/:tipoEntidad/:entidadId", getPromedioCalificacionEntidadController);

router.get("/resenas/:id", getResenaByIdController);

router.post(
  "/resenas",
  payloadMiddleware(createResenaSchema),
  createResenaController
);
router.post(
  "/resenas/responder",
  payloadMiddleware(responderResenaSchema),
  responderResenaController
);
router.post(
  "/resenas/moderar",
  payloadMiddleware(moderarResenaSchema),
  moderarResenaController
);

router.put(
  "/resenas/:id",
  payloadMiddleware(updateResenaSchema),
  updateResenaController
);
router.put("/resenas/:id/estado", cambiarEstadoResenaController);

router.delete("/resenas/:id", deleteResenaController);

module.exports = router;