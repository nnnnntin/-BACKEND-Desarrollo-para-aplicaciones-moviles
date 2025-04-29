const express = require("express");
const router = express.Router();
const {
  getPromocionesController,
  getPromocionByIdController,
  getPromocionByCodigoController,
  getPromocionesActivasController,
  getPromocionesPorTipoController,
  getPromocionesPorEntidadController,
  getPromocionesPorRangoDeFechasController,
  createPromocionController,
  updatePromocionController,
  deletePromocionController,
  activarPromocionController,
  incrementarUsosController,
  validarPromocionController,
  getPromocionesProximasAExpirarController,
  actualizarAplicabilidadController,
  filtrarPromocionesController
} = require("../controllers/promocion.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createPromocionSchema,
  updatePromocionSchema,
  validarCodigoPromocionSchema
} = require("./validations/promocion.validation");

router.get("/promociones", getPromocionesController);
router.get("/promociones/activas", getPromocionesActivasController);
router.get("/promociones/tipo/:tipo", getPromocionesPorTipoController);
router.get("/promociones/codigo/:codigo", getPromocionByCodigoController);
router.get("/promociones/entidad", getPromocionesPorEntidadController);
router.get("/promociones/fechas", getPromocionesPorRangoDeFechasController);
router.get("/promociones/filtrar", filtrarPromocionesController);
router.get("/promociones/proximas-expirar", getPromocionesProximasAExpirarController);

router.get("/promociones/:id", getPromocionByIdController);

router.post(
  "/promociones/validar",
  payloadMiddleware(validarCodigoPromocionSchema),
  validarPromocionController
);

router.post(
  "/promociones",
  payloadMiddleware(createPromocionSchema),
  createPromocionController
);
router.put(
  "/promociones/:id",
  payloadMiddleware(updatePromocionSchema),
  updatePromocionController
);
router.delete("/promociones/:id", deletePromocionController);

router.put("/promociones/:id/activar", activarPromocionController);
router.put("/promociones/:id/incrementar-usos", incrementarUsosController);
router.put("/promociones/:id/aplicabilidad", actualizarAplicabilidadController);

module.exports = router;
