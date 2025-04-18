const express = require("express");
const router = express.Router();
const {
  getEspaciosController,
  getEspacioController,
  postEspacioController,
  putEspacioController,
  deleteEspacioController,
} = require("../controllers/espacio.controller");
const payloadMiddleWare = require("../middlewares/payload.middleware");
const {
  createEspacioSchema,
  updateEspacioSchema
} = require("../routes/validations/espacio.validation");

router.get("/espacios", getEspaciosController);
router.get("/espacios/:id", getEspacioController);
router.post(
  "/espacios",
  payloadMiddleWare(createEspacioSchema),
  postEspacioController
);
router.put(
  "/espacios/:id",
  payloadMiddleWare(updateEspacioSchema),
  putEspacioController
);
router.delete("/espacios/:id", deleteEspacioController);

module.exports = router;
