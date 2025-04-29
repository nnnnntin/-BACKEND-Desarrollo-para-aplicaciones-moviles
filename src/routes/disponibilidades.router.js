const express = require("express");
const router = express.Router();
const {
  getDisponibilidadesController,
  getDisponibilidadByIdController,
  getDisponibilidadByEntidadController,
  getDisponibilidadByFechaController,
  getDisponibilidadEnRangoController,
  createDisponibilidadController,
  updateDisponibilidadController,
  deleteDisponibilidadController,
  getFranjasDisponiblesController,
  reservarFranjaController,
  liberarFranjaController,
  bloquearFranjaController,
  desbloquearFranjaController,
  crearDisponibilidadDiariaController,
  consultarDisponibilidadController
} = require("../controllers/disponibilidad.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createDisponibilidadSchema,
  updateDisponibilidadSchema,
  bloquearFranjaHorariaSchema
} = require("../routes/validations/disponibilidad.validation");

router.get("/disponibilidades", getDisponibilidadesController);

router.post(
  "/disponibilidades",
  payloadMiddleware(createDisponibilidadSchema),
  createDisponibilidadController
);

router.get(
  "/disponibilidades/entidad/:entidadId/:tipoEntidad",
  getDisponibilidadByEntidadController
);

router.get(
  "/disponibilidades/fecha",
  getDisponibilidadByFechaController
);

router.get(
  "/disponibilidades/rango",
  getDisponibilidadEnRangoController
);

router.get(
  "/disponibilidades/franjas",
  getFranjasDisponiblesController
);

router.get(
  "/disponibilidades/consultar",
  consultarDisponibilidadController
);


router.post(
  "/disponibilidades/reservar",
  reservarFranjaController
);

router.post(
  "/disponibilidades/liberar",
  liberarFranjaController
);

router.post(
  "/disponibilidades/bloquear",
  payloadMiddleware(bloquearFranjaHorariaSchema),
  bloquearFranjaController
);

router.post(
  "/disponibilidades/desbloquear",
  desbloquearFranjaController
);

router.post(
  "/disponibilidades/crear-diaria",
  crearDisponibilidadDiariaController
);


router.get(
  "/disponibilidades/:id([0-9a-fA-F]{24})",
  getDisponibilidadByIdController
);

router.put(
  "/disponibilidades/:id([0-9a-fA-F]{24})",
  payloadMiddleware(updateDisponibilidadSchema),
  updateDisponibilidadController
);

router.delete(
  "/disponibilidades/:id([0-9a-fA-F]{24})",
  deleteDisponibilidadController
);

module.exports = router;
