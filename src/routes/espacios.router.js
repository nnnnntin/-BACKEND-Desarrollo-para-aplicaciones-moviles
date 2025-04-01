const express = require("express");
const router = express.Router();

const {
  getEspaciosController,
  getEspacioController,
  postEspacioController,
  putEspacioController,
  deleteEspacioController,
} = require("../controllers/espacios.controller");
const payloadMiddleWare = require("../middlewares/payload.middleware");
const espacioSchema = require("../models/schemas/espacioSchema");

// Private Routes
router.get("/espacios", getEspaciosController);
router.get("/espacios/:id", getEspacioController);
router.post("/espacios", payloadMiddleWare(espacioSchema), postEspacioController);
router.delete("/espacios/:id", deleteEspacioController);
router.put("/espacios/:id", putEspacioController);

module.exports = router;
