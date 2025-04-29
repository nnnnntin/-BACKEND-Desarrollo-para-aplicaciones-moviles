
const express = require("express");
const router = express.Router();

const {
  getFacturasController,
  getFacturaByIdController,
  getFacturaByNumeroController,
  getFacturasByUsuarioController,
  getFacturasByEmisorController,
  getFacturasPorEstadoController,
  getFacturasVencidasController,
  getFacturasPorRangoFechasController,
  createFacturaController,
  updateFacturaController,
  deleteFacturaController,
  cambiarEstadoFacturaController,
  marcarFacturaComoPagadaController,
  marcarFacturaComoVencidaController,
  marcarFacturaComoCanceladaController,
  agregarPagoFacturaController,
  actualizarPdfUrlController,
  getFacturasPorRangoMontoController,
  getEstadisticasFacturacionController,
  generarPdfFacturaController,
  filtrarFacturasController
} = require("../controllers/factura.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createFacturaSchema,
  updateFacturaSchema,
  generarPdfFacturaSchema
} = require("./validations/factura.validation");

router.get("/facturas", getFacturasController);

router.get("/facturas/numero/:numeroFactura", getFacturaByNumeroController);
router.get("/facturas/usuario/:usuarioId", getFacturasByUsuarioController);
router.get("/facturas/estado/:estado", getFacturasPorEstadoController);
router.get("/facturas/vencidas",    getFacturasVencidasController);
router.get("/facturas/fechas",      getFacturasPorRangoFechasController);
router.get("/facturas/montos",      getFacturasPorRangoMontoController);
router.get("/facturas/filtrar",     filtrarFacturasController);

router.post(
  "/facturas",
  payloadMiddleware(createFacturaSchema),
  createFacturaController
);

router.get("/facturas/:id", getFacturaByIdController);

router.put(
  "/facturas/:id",
  payloadMiddleware(updateFacturaSchema),
  updateFacturaController
);
router.delete("/facturas/:id", deleteFacturaController);

router.put("/facturas/:id/cancelar",marcarFacturaComoCanceladaController);
router.post("/facturas/:id/pago",   agregarPagoFacturaController);
router.put("/facturas/:id/pdf",     actualizarPdfUrlController);

module.exports = router;
