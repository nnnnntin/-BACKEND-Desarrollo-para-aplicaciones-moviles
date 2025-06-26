const express = require("express");
const router = express.Router();
const {
  getEscritoriosFlexiblesController,
  getEscritorioFlexibleByIdController,
  getEscritorioFlexibleByCodigoController,
  getEscritoriosByNombreController, // Nuevo import agregado
  getEscritoriosByEdificioController,
  getEscritoriosByTipoController,
  getEscritoriosByAmenidadesController,
  getEscritoriosByPropietarioController,
  getEscritoriosByRangoPrecioController,
  createEscritorioFlexibleController,
  updateEscritorioFlexibleController,
  deleteEscritorioFlexibleController,
  cambiarEstadoEscritorioController,
  agregarAmenidadController,
  eliminarAmenidadController,
  getEscritoriosDisponiblesController,
  filtrarEscritoriosFlexiblesController
} = require("../controllers/escritorioFlexible.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createEscritorioFlexibleSchema,
  updateEscritorioFlexibleSchema
} = require("./validations/escritorioFlexible.validation");

router.get("/escritorios-flexibles/precio", getEscritoriosByRangoPrecioController);
router.get("/escritorios-flexibles/disponibles", getEscritoriosDisponiblesController);
router.get("/escritorios-flexibles/filtrar", filtrarEscritoriosFlexiblesController);
router.get("/escritorios-flexibles/amenidades/:tipoAmenidad", getEscritoriosByAmenidadesController);
router.get("/escritorios-flexibles/propietario/:propietarioId", getEscritoriosByPropietarioController);
router.get("/escritorios-flexibles/tipo/:tipo", getEscritoriosByTipoController);
router.get("/escritorios-flexibles/edificio/:edificioId", getEscritoriosByEdificioController);
router.get("/escritorios-flexibles/codigo/:codigo", getEscritorioFlexibleByCodigoController);
router.get("/escritorios-flexibles/nombre/:nombre", getEscritoriosByNombreController); // Nueva ruta agregada

router.get("/escritorios-flexibles", getEscritoriosFlexiblesController);
router.get("/escritorios-flexibles/:id", getEscritorioFlexibleByIdController);

router.post(
  "/escritorios-flexibles",
  payloadMiddleware(createEscritorioFlexibleSchema),
  createEscritorioFlexibleController
);

router.put(
  "/escritorios-flexibles/:id",
  payloadMiddleware(updateEscritorioFlexibleSchema),
  updateEscritorioFlexibleController
);

router.delete("/escritorios-flexibles/:id", deleteEscritorioFlexibleController);

router.put("/escritorios-flexibles/:id/estado", cambiarEstadoEscritorioController);
router.post("/escritorios-flexibles/:id/amenidad", agregarAmenidadController);
router.delete("/escritorios-flexibles/:id/amenidad/:amenidadId", eliminarAmenidadController);

module.exports = router;