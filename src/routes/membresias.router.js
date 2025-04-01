const express = require("express");
const router = express.Router();

const {
  getMembresiasController,
  getMembresiaController,
  postMembresiaController,
  putMembresiaController,
  deleteMembresiaController,
} = require("../controllers/membresias.controller");
const payloadMiddleWare = require("../middlewares/payload.middleware");
const membresiaSchema = require("../models/schemas/membresiaSchema");

// Private Routes
router.get("/membresias", getMembresiasController);
router.get("/membresias/:id", getMembresiaController);
router.post("/membresias", payloadMiddleWare(membresiaSchema), postMembresiaController);
router.delete("/membresias/:id", deleteMembresiaController);
router.put("/membresias/:id", putMembresiaController);

module.exports = router;
