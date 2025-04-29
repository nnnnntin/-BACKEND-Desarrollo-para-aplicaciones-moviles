const express = require("express");
const router = express.Router();

const {
  getOficinasController,
  getOficinaByIdController,
  getOficinaByCodigoController,
  getOficinasByEdificioController,
  getOficinasByTipoController,
  getOficinasByPropietarioController,
  getOficinasByEmpresaController,
  createOficinaController,
  updateOficinaController,
  deleteOficinaController,
  cambiarEstadoOficinaController,
  getOficinasByCapacidadController,
  getOficinasByRangoPrecioController,
  getOficinasDisponiblesController,
  actualizarCalificacionController,
  filtrarOficinasController
} = require("../controllers/oficina.controller");

const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createOficinaSchema,
  updateOficinaSchema
} = require("../routes/validations/oficina.validation");

router.get("/oficinas", getOficinasController);

router.get("/oficinas/capacidad", getOficinasByCapacidadController);
router.get("/oficinas/precio", getOficinasByRangoPrecioController);
router.get("/oficinas/disponibles", getOficinasDisponiblesController);
router.get("/oficinas/filtrar", filtrarOficinasController);

router.get("/oficinas/codigo/:codigo", getOficinaByCodigoController);
router.get("/oficinas/edificio/:edificioId", getOficinasByEdificioController);
router.get("/oficinas/tipo/:tipo", getOficinasByTipoController);
router.get("/oficinas/propietario/:propietarioId", getOficinasByPropietarioController);
router.get("/oficinas/empresa/:empresaId", getOficinasByEmpresaController);

router.get("/oficinas/:id", getOficinaByIdController);

router.post(
  "/oficinas",
  payloadMiddleware(createOficinaSchema),
  createOficinaController
);

router.put(
  "/oficinas/:id",
  payloadMiddleware(updateOficinaSchema),
  updateOficinaController
);

router.delete("/oficinas/:id", deleteOficinaController);

router.put("/oficinas/:id/estado", cambiarEstadoOficinaController);
router.put("/oficinas/:id/calificacion", actualizarCalificacionController);

module.exports = router;
