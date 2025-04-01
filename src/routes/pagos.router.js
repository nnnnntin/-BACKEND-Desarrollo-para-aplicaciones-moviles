const express = require("express");
const router = express.Router();

const {
  getPagosController,
  getPagoController,
  postPagoController,
  putPagoController,
  deletePagoController,
} = require("../controllers/pagos.controller");
const payloadMiddleWare = require("../middlewares/paylod.middleware");
const pagoSchema = require("../models/schemas/pagoSchema");

// Private Routes
router.get("/pagos", getPagosController);
router.get("/pagos/:id", getPagoController);
router.post("/pagos", payloadMiddleWare(pagoSchema), postPagoController);
router.delete("/pagos/:id", deletePagoController);
router.put("/pagos/:id", putPagoController);

module.exports = router;
