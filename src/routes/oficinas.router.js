const express = require("express");
const router = express.Router();
const {
  getOficinasController,
  getOficinaController,
  postOficinaController,
  putOficinaController,
  deleteOficinaController,
} = require("../controllers/oficina.controller");
const payloadMiddleWare = require("../middlewares/payload.middleware");
const {
  createOficinaSchema,
  updateOficinaSchema
} = require("../routes/validations/oficina.validation");

router.get("/oficinas", getOficinasController);
router.get("/oficinas/:id", getOficinaController);
router.post(
  "/oficinas",
  payloadMiddleWare(createOficinaSchema),
  postOficinaController
);
router.put(
  "/oficinas/:id",
  payloadMiddleWare(updateOficinaSchema),
  putOficinaController
);
router.delete("/oficinas/:id", deleteOficinaController);

module.exports = router;
