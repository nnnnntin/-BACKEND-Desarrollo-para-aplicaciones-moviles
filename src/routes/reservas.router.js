const express = require("express");
const router = express.Router();

const {
  getReservasController,
  getReservaController,
  postReservaController,
  putReservaController,
  deleteReservaController,
} = require("../controllers/reservas.controller");
const payloadMiddleWare = require("../middlewares/paylod.middleware");
const reservaSchema = require("../models/schemas/reservaSchema");

// Private Routes
router.get("/reservas", getReservasController);
router.get("/reservas/:id", getReservaController);
router.post("/reservas", payloadMiddleWare(reservaSchema), postReservaController);
router.delete("/reservas/:id", deleteReservaController);
router.put("/reservas/:id", putReservaController);

module.exports = router;
