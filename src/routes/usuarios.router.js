const express = require("express");
const router = express.Router();
const {
  getUsuariosController,
  getUsuarioController,
  postUsuarioController,
  putUsuarioController,
  deleteUsuarioController,
} = require("../controllers/usuario.controller");
const payloadMiddleWare = require("../middlewares/payload.middleware");
const {
  signupSchema,
  updateUserSchema
} = require("../routes/validations/usuario.validation");

router.get("/usuarios", getUsuariosController);
router.get("/usuarios/:id", getUsuarioController);
router.post(
  "/usuarios",
  payloadMiddleWare(signupSchema),
  postUsuarioController
);
router.put(
  "/usuarios/:id",
  payloadMiddleWare(updateUserSchema),
  putUsuarioController
);
router.delete("/usuarios/:id", deleteUsuarioController);

module.exports = router;
