const express = require("express");
const router = express.Router();

const {
  getPagosController,
  getPagoByIdController,
  getPagosByUsuarioController,
  getPagosPorConceptoController,
  getPagosPorEstadoController,
  getPagosPorEntidadController,
  createPagoController,
  updatePagoController,
  deletePagoController,
  cambiarEstadoPagoController,
  completarPagoController,
  reembolsarPagoController,
  vincularFacturaController,
  getPagosPorRangoFechasController,
  getPagosPorRangoMontosController,
  filtrarPagosController
} = require("../controllers/pago.controller");

const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createPagoSchema,
  updatePagoSchema,
  reembolsarPagoSchema
} = require("../routes/validations/pago.validation");

router.get("/pagos", getPagosController);

router.post(
  "/pagos",
  payloadMiddleware(createPagoSchema),
  createPagoController
);

router.post(
  "/pagos/reembolsar",
  payloadMiddleware(reembolsarPagoSchema),
  reembolsarPagoController
);

router.get("/pagos/montos", getPagosPorRangoMontosController);
router.get("/pagos/filtrar", filtrarPagosController);

router.get(
  "/pagos/usuario/:usuarioId",
  getPagosByUsuarioController
);
router.get(
  "/pagos/concepto/:concepto",
  getPagosPorConceptoController
);
router.get(
  "/pagos/estado/:estado",
  getPagosPorEstadoController
);
router.get(
  "/pagos/entidad/:tipoEntidad/:entidadId",
  getPagosPorEntidadController
);

router.get("/pagos/:id", getPagoByIdController);
router.put(
  "/pagos/:id",
  payloadMiddleware(updatePagoSchema),
  updatePagoController
);
router.delete("/pagos/:id", deletePagoController);

router.put(
  "/pagos/:id/estado",
  cambiarEstadoPagoController
);
router.put(
  "/pagos/:id/completar",
  completarPagoController
);
router.put(
  "/pagos/:id/factura",
  vincularFacturaController
);

module.exports = router;