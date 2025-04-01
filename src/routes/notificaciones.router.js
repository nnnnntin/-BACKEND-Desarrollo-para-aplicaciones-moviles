const express = require("express");
const router = express.Router();

const {
  getNotificacionesController,
  getNotificacionController,
  postNotificacionController,
  putNotificacionController,
  deleteNotificacionController,
} = require("../controllers/notificaciones.controller");
const payloadMiddleWare = require("../middlewares/paylod.middleware");
const notificacionSchema = require("../models/schemas/notificacionSchema");

// Private Routes
router.get("/notificaciones", getNotificacionesController);
router.get("/notificaciones/:id", getNotificacionController);
router.post("/notificaciones", payloadMiddleWare(notificacionSchema), postNotificacionController);
router.delete("/notificaciones/:id", deleteNotificacionController);
router.put("/notificaciones/:id", putNotificacionController);

module.exports = router;
