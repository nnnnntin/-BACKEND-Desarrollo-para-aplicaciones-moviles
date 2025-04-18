const express = require("express");
const router = express.Router();
const {
  getResenasController,
  getResenaController,
  postResenaController,
  putResenaController,
  deleteResenaController,
} = require("../controllers/resena.controller");
const payloadMiddleWare = require("../middlewares/payload.middleware");
const {
  createResenaSchema,
  updateResenaSchema
} = require("../routes/validations/resena.validation");

router.get("/resenas", getResenasController);
router.get("/resenas/:id", getResenaController);
router.post(
  "/resenas",
  payloadMiddleWare(createResenaSchema),
  postResenaController
);
router.put(
  "/resenas/:id",
  payloadMiddleWare(updateResenaSchema),
  putResenaController
);
router.delete("/resenas/:id", deleteResenaController);

module.exports = router;
