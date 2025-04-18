const express = require("express");
const router = express.Router();
const {
  getReservasController,
  getReservaController,
  postReservaController,
  putReservaController,
  deleteReservaController,
} = require("../controllers/reserva.controller");
const payloadMiddleWare = require("../middlewares/payload.middleware");
const {
  createReservaSchema,
  updateReservaSchema
} = require("../routes/validations/reserva.validation");

router.get("/reservas", getReservasController);
router.get("/reservas/:id", getReservaController);
router.post(
  "/reservas",
  payloadMiddleWare(createReservaSchema),
  postReservaController
);
router.put(
  "/reservas/:id",
  payloadMiddleWare(updateReservaSchema),
  putReservaController
);
router.delete("/reservas/:id", deleteReservaController);

module.exports = router;
