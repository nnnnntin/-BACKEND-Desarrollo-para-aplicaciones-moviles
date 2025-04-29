const express = require("express");
const router = express.Router();
const {
  getEdificiosController,
  getEdificioByIdController,
  getEdificiosByPropietarioController,
  getEdificiosByEmpresaController,
  getEdificiosByCiudadController,
  getEdificiosByPaisController,
  getEdificiosConAmenidadController,
  createEdificioController,
  updateEdificioController,
  deleteEdificioController,
  activarEdificioController,
  actualizarCalificacionController,
  agregarAmenidadController,
  eliminarAmenidadController,
  actualizarHorarioController,
  filtrarEdificiosController
} = require("../controllers/edificio.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createEdificioSchema,
  updateEdificioSchema
} = require("./validations/edificio.validation");

router.get("/edificios", getEdificiosController);

router.get("/edificios/filtrar", filtrarEdificiosController);

router.get("/edificios/:id", getEdificioByIdController);

router.post(
  "/edificios",
  payloadMiddleware(createEdificioSchema),
  createEdificioController
);

router.put(
  "/edificios/:id",
  payloadMiddleware(updateEdificioSchema),
  updateEdificioController
);

router.delete("/edificios/:id", deleteEdificioController);

router.get(
  "/edificios/propietario/:propietarioId",
  getEdificiosByPropietarioController
);

router.get(
  "/edificios/empresa/:empresaId",
  getEdificiosByEmpresaController
);

router.get("/edificios/ciudad/:ciudad", getEdificiosByCiudadController);

router.get("/edificios/pais/:pais", getEdificiosByPaisController);

router.get(
  "/edificios/amenidad/:tipoAmenidad",
  getEdificiosConAmenidadController
);

router.put("/edificios/:id/activar", activarEdificioController);

router.put("/edificios/:id/calificacion", actualizarCalificacionController);

router.post("/edificios/:id/amenidad", agregarAmenidadController);

router.delete(
  "/edificios/:id/amenidad/:amenidadId",
  eliminarAmenidadController
);

router.put("/edificios/:id/horario", actualizarHorarioController);

module.exports = router;
