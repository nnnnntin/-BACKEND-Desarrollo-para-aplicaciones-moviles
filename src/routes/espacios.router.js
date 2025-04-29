const express = require("express");
const router = express.Router();

const {
  getEspaciosController,
  getEspacioByIdController,
  getEspaciosByEdificioController,
  getEspaciosByTipoController,
  getEspaciosByPropietarioController,
  getEspaciosByEmpresaController,
  createEspacioController,
  updateEspacioController,
  deleteEspacioController,
  cambiarEstadoEspacioController,
  getEspaciosDisponiblesController,
  filtrarEspaciosController,
  getEspaciosByAmenidadesController
} = require("../controllers/espacio.controller");

const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createEspacioSchema,
  updateEspacioSchema
} = require("../routes/validations/espacio.validation");

router.get("/espacios", getEspaciosController);

router.get("/espacios/disponibles", getEspaciosDisponiblesController);
router.get("/espacios/filtrar", filtrarEspaciosController);
router.get("/espacios/amenidades", getEspaciosByAmenidadesController);

router.get("/espacios/:id", getEspacioByIdController);

router.post(
  "/espacios",
  payloadMiddleware(createEspacioSchema),
  createEspacioController
);

router.put(
  "/espacios/:id",
  payloadMiddleware(updateEspacioSchema),
  updateEspacioController
);

router.delete("/espacios/:id", deleteEspacioController);

router.get("/espacios/edificio/:edificioId", getEspaciosByEdificioController);

router.get("/espacios/tipo/:tipo", getEspaciosByTipoController);

router.get("/espacios/propietario/:propietarioId", getEspaciosByPropietarioController);

router.get("/espacios/empresa/:empresaId", getEspaciosByEmpresaController);

router.put("/espacios/:id/estado", cambiarEstadoEspacioController);

module.exports = router;
