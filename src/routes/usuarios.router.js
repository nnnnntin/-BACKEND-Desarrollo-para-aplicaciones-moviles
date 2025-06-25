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
  // ← NUEVOS IMPORTS para métodos de pago
  addMetodoPagoController,
  updateMetodoPagoController,
  deleteMetodoPagoController,
  setDefaultMetodoPagoController
} = require("../controllers/usuario.controller");

const {
  createUsuarioSchema,
  updateUsuarioSchema,
  cambiarRolSchema,
  // ← NUEVOS IMPORTS para validaciones de métodos de pago
  addMetodoPagoSchema,
  updateMetodoPagoSchema,
  deleteMetodoPagoSchema
} = require("../routes/validations/usuario.validation");

// Rutas existentes de usuarios
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

// ← NUEVAS RUTAS: Gestión de métodos de pago
// Agregar método de pago
router.post(
  "/usuarios/:id/metodos-pago",
  payloadMiddleware(addMetodoPagoSchema),
  addMetodoPagoController
);

// Actualizar método de pago
router.put(
  "/usuarios/:id/metodos-pago",
  payloadMiddleware(updateMetodoPagoSchema),
  updateMetodoPagoController
);

// Eliminar método de pago
router.delete(
  "/usuarios/:id/metodos-pago",
  payloadMiddleware(deleteMetodoPagoSchema),
  deleteMetodoPagoController
);

// Establecer método de pago como predeterminado
router.put(
  "/usuarios/:id/metodos-pago/predeterminado",
  setDefaultMetodoPagoController
);

module.exports = router;