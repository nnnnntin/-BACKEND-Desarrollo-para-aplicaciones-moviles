const express = require("express");
const router = express.Router();
const {
  getPagosController,
  getPagoController,
  postPagoController,
  putPagoController,
  deletePagoController,
} = require("../controllers/pago.controller");
const payloadMiddleWare = require("../middlewares/payload.middleware");
const {
  createPagoSchema,
  updatePagoSchema
} = require("../routes/validations/pago.validation");

router.get("/pagos", getPagosController);
router.get("/pagos/:id", getPagoController);
router.post(
  "/pagos",
  payloadMiddleWare(createPagoSchema),
  postPagoController
);
router.put(
  "/pagos/:id",
  payloadMiddleWare(updatePagoSchema),
  putPagoController
);
router.delete("/pagos/:id", deletePagoController);

module.exports = router;
