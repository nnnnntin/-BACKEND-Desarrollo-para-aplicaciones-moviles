const express = require("express");
const router = express.Router();

const {
  getSalasReunionController,
  getSalaReunionByIdController,
  getSalaReunionByCodigoController,
  getSalasByEdificioController,
  getSalasByCapacidadController,
  getSalasByConfiguracionController,
  getSalasByEquipamientoController,
  getSalasByPropietarioController,
  getSalasByRangoPrecioController,
  createSalaReunionController,
  updateSalaReunionController,
  deleteSalaReunionController,
  cambiarEstadoSalaController,
  agregarEquipamientoController,
  eliminarEquipamientoController,
  actualizarPreciosController,
  getSalasDisponiblesController,
  filtrarSalasReunionController
} = require("../controllers/salaReunion.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createSalaReunionSchema,
  updateSalaReunionSchema
} = require("../routes/validations/salaReunion.validation");

router.get("/salas-reunion", getSalasReunionController);

router.get("/salas-reunion/disponibles", getSalasDisponiblesController);
router.get("/salas-reunion/filtrar", filtrarSalasReunionController);
router.get("/salas-reunion/capacidad", getSalasByCapacidadController);
router.get("/salas-reunion/precio", getSalasByRangoPrecioController);

router.get("/salas-reunion/codigo/:codigo", getSalaReunionByCodigoController);
router.get("/salas-reunion/edificio/:edificioId", getSalasByEdificioController);
router.get("/salas-reunion/configuracion/:configuracion", getSalasByConfiguracionController);
router.get("/salas-reunion/equipamiento/:tipoEquipamiento", getSalasByEquipamientoController);
router.get("/salas-reunion/propietario/:propietarioId", getSalasByPropietarioController);

router.get("/salas-reunion/:id", getSalaReunionByIdController);

router.post(
  "/salas-reunion",
  payloadMiddleware(createSalaReunionSchema),
  createSalaReunionController
);
router.put(
  "/salas-reunion/:id",
  payloadMiddleware(updateSalaReunionSchema),
  updateSalaReunionController
);
router.delete("/salas-reunion/:id", deleteSalaReunionController);

router.put("/salas-reunion/:id/estado", cambiarEstadoSalaController);
router.post("/salas-reunion/:id/equipamiento", agregarEquipamientoController);
router.delete("/salas-reunion/:id/equipamiento/:equipamientoId", eliminarEquipamientoController);
router.put("/salas-reunion/:id/precios", actualizarPreciosController);

module.exports = router;