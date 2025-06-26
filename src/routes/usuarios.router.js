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
  updateMembresiaUsuarioController,
  getPerfilCompletoUsuarioController,
  addMetodoPagoController,
  updateMetodoPagoController,
  deleteMetodoPagoController,
  setDefaultMetodoPagoController
} = require("../controllers/usuario.controller");

const {
  createUsuarioSchema,
  updateUsuarioSchema,
  cambiarRolSchema,
  addMetodoPagoSchema,
  updateMetodoPagoSchema,
  deleteMetodoPagoSchema
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

router.get("/usuarios/:id/perfil-completo", getPerfilCompletoUsuarioController);

router.post(
  "/usuarios/:id/metodos-pago",
  payloadMiddleware(addMetodoPagoSchema),
  addMetodoPagoController
);

router.put(
  "/usuarios/:id/metodos-pago",
  payloadMiddleware(updateMetodoPagoSchema),
  updateMetodoPagoController
);

router.delete(
  "/usuarios/:id/metodos-pago",
  payloadMiddleware(deleteMetodoPagoSchema),
  deleteMetodoPagoController
);

router.put(
  "/usuarios/:id/metodos-pago/predeterminado",
  setDefaultMetodoPagoController
);

module.exports = router;