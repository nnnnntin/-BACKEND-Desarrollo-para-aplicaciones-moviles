const express = require("express");
const router = express.Router();
const {
  getMembresiasController,
  getMembresiaController,
  postMembresiaController,
  putMembresiaController,
  deleteMembresiaController,
} = require("../controllers/membresia.controller");
const payloadMiddleWare = require("../middlewares/payload.middleware");
const {
  createMembresiaSchema,
  updateMembresiaSchema
} = require("../routes/validations/membresia.validation");

router.get("/membresias", getMembresiasController);
router.get("/membresias/:id", getMembresiaController);
router.post(
  "/membresias",
  payloadMiddleWare(createMembresiaSchema),
  postMembresiaController
);
router.put(
  "/membresias/:id",
  payloadMiddleWare(updateMembresiaSchema),
  putMembresiaController
);
router.delete("/membresias/:id", deleteMembresiaController);

module.exports = router;
