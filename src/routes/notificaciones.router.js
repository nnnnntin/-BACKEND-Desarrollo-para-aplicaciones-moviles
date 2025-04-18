const express = require("express");
const router = express.Router();
const {
  getNotificacionesController,
  getNotificacionController,
  postNotificacionController,
  putNotificacionController,
  deleteNotificacionController,
} = require("../controllers/notificacion.controller");
const payloadMiddleWare = require("../middlewares/payload.middleware");
const {
  createNotificacionSchema,
  updateNotificacionSchema
} = require("../routes/validations/notificacion.validation");

router.get("/notificaciones", getNotificacionesController);
router.get("/notificaciones/:id", getNotificacionController);
router.post(
  "/notificaciones",
  payloadMiddleWare(createNotificacionSchema),
  postNotificacionController
);
router.put(
  "/notificaciones/:id",
  payloadMiddleWare(updateNotificacionSchema),
  putNotificacionController
);
router.delete("/notificaciones/:id", deleteNotificacionController);

module.exports = router;
