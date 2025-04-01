const express = require("express");
const router = express.Router();

const {
  getResenasController,
  getResenaController,
  postResenaController,
  putResenaController,
  deleteResenaController,
} = require("../controllers/resenas.controller");
const payloadMiddleWare = require("../middlewares/payload.middleware");
const resenaSchema = require("../models/schemas/resenaSchema");

// Private Routes
router.get("/resenas", getResenasController);
router.get("/resenas/:id", getResenaController);
router.post("/resenas", payloadMiddleWare(resenaSchema), postResenaController);
router.delete("/resenas/:id", deleteResenaController);
router.put("/resenas/:id", putResenaController);

module.exports = router;
