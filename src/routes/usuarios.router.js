const express = require("express");
const router = express.Router();

const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  getUsuariosController,
  getUsuarioByIdController,
  getUsuariosByTipoController,
  registerUsuarioController,
  updateUsuarioController,
  deleteUsuarioController,
  cambiarRolUsuarioController,
  updateMembresiaUsuarioController
} = require("../controllers/usuario.controller");

const {
  createUsuarioSchema,
  updateUsuarioSchema,
  cambiarRolSchema
} = require("../routes/validations/usuario.validation");

router.get("/usuarios", getUsuariosController);

router.get("/usuarios/:id", getUsuarioByIdController);

router.post(
  "/usuarios",
  payloadMiddleware(createUsuarioSchema),
  registerUsuarioController
);

router.put(
  "/usuarios/rol",
  payloadMiddleware(cambiarRolSchema),
  cambiarRolUsuarioController
);

router.put(
  "/usuarios/:id",
  payloadMiddleware(updateUsuarioSchema),
  updateUsuarioController
);

router.delete("/usuarios/:id", deleteUsuarioController);

router.get("/usuarios/tipo/:tipo", getUsuariosByTipoController);

router.put(
  "/usuarios/:id/membresia",
  updateMembresiaUsuarioController
);

module.exports = router;
