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
  // Nuevos controladores para métodos de pago
  agregarMetodoPagoController,
  eliminarMetodoPagoController,
  actualizarMetodoPredeterminadoController,
  obtenerMetodosPagoController
} = require("../controllers/usuario.controller");

const {
  createUsuarioSchema,
  updateUsuarioSchema,
  cambiarRolSchema,
  agregarMetodoPagoSchema,
  actualizarMetodoPredeterminadoSchema,
  eliminarMetodoPagoSchema
} = require("../routes/validations/usuario.validation");

// ========== RUTAS EXISTENTES ==========

// Obtener todos los usuarios
router.get("/usuarios", getUsuariosController);

// Obtener usuario por ID
router.get("/usuarios/:id", getUsuarioByIdController);

// Crear nuevo usuario
router.post(
  "/usuarios",
  payloadMiddleware(createUsuarioSchema),
  registerUsuarioController
);

// Cambiar rol de usuario
router.put(
  "/usuarios/rol",
  payloadMiddleware(cambiarRolSchema),
  cambiarRolUsuarioController
);

// Actualizar usuario
router.put(
  "/usuarios/:id",
  payloadMiddleware(updateUsuarioSchema),
  updateUsuarioController
);

// Eliminar usuario
router.delete("/usuarios/:id", deleteUsuarioController);

// Obtener usuarios por tipo
router.get("/usuarios/tipo/:tipo", getUsuariosByTipoController);

// Actualizar membresía de usuario
router.put(
  "/usuarios/:id/membresia",
  updateMembresiaUsuarioController
);

// ========== NUEVAS RUTAS PARA MÉTODOS DE PAGO ==========

// Obtener métodos de pago de un usuario
router.get(
  "/usuarios/:id/metodos-pago",
  obtenerMetodosPagoController
);

// Agregar método de pago a un usuario
router.post(
  "/usuarios/:id/metodos-pago",
  payloadMiddleware(agregarMetodoPagoSchema),
  agregarMetodoPagoController
);

// Eliminar método de pago específico
router.delete(
  "/usuarios/:id/metodos-pago/:metodoId",
  eliminarMetodoPagoController
);

// Actualizar método predeterminado
router.put(
  "/usuarios/:id/metodos-pago/:metodoId/predeterminado",
  actualizarMetodoPredeterminadoController
);

module.exports = router;