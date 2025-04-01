const express = require("express");
const router = express.Router();

const {
  getOficinasController,
  getOficinaController,
  postOficinaController,
  putOficinaController,
  deleteOficinaController,
} = require("../controllers/oficinas.controller");
const payloadMiddleWare = require("../middlewares/paylod.middleware");
const oficinaSchema = require("../models/schemas/oficinaSchema");

// Private Routes
router.get("/oficinas", getOficinasController);
router.get("/oficinas/:id", getOficinaController);
router.post("/oficinas", payloadMiddleWare(oficinaSchema), postOficinaController);
router.delete("/oficinas/:id", deleteOficinaController);
router.put("/oficinas/:id", putOficinaController);

module.exports = router;
