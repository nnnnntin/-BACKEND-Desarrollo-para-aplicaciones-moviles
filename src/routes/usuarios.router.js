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

/**
 * @route GET /usuarios
 * @summary Obtener todos los usuarios
 * @tags Usuarios - Gestión de usuarios
 */
router.get("/usuarios", getUsuariosController);

/**
 * @route GET /usuarios/{id}
 * @summary Obtener usuario por ID
 * @tags Usuarios - Gestión de usuarios
 */
router.get("/usuarios/:id", getUsuarioByIdController);

/**
 * @route POST /usuarios
 * @summary Registrar un nuevo usuario
 * @tags Usuarios - Gestión de usuarios
 */
router.post(
  "/usuarios",
  payloadMiddleware(createUsuarioSchema),
  registerUsuarioController
);

/**
 * @route PUT /usuarios/rol
 * @summary Cambiar rol de usuario
 * @tags Usuarios - Gestión de usuarios
 */
router.put(
  "/usuarios/rol",
  payloadMiddleware(cambiarRolSchema),
  cambiarRolUsuarioController
);

/**
 * @route PUT /usuarios/{id}
 * @summary Actualizar información de usuario
 * @tags Usuarios - Gestión de usuarios
 */
router.put(
  "/usuarios/:id",
  payloadMiddleware(updateUsuarioSchema),
  updateUsuarioController
);

/**
 * @route DELETE /usuarios/{id}
 * @summary Eliminar usuario
 * @tags Usuarios - Gestión de usuarios
 */
router.delete("/usuarios/:id", deleteUsuarioController);

/**
 * @route GET /usuarios/tipo/{tipo}
 * @summary Obtener usuarios por tipo
 * @tags Usuarios - Gestión de usuarios
 */
router.get("/usuarios/tipo/:tipo", getUsuariosByTipoController);

/**
 * @route PUT /usuarios/{id}/membresia
 * @summary Actualizar membresía de usuario
 * @tags Usuarios - Gestión de usuarios
 */
router.put(
  "/usuarios/:id/membresia",
  updateMembresiaUsuarioController
);

module.exports = router;
