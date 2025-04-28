const express = require("express");
const router = express.Router();
const payloadMiddleware = require("../middlewares/payload.middleware");
const { createUsuarioSchema, loginSchema } = require("../routes/validations/usuario.validation");
const { postAuthSignup, postAuthLogin } = require("../controllers/auth.controller");

/**
 * @route POST /auth/signup
 * @summary Registrar un nuevo usuario
 * @tags Auth - Operaciones de autenticación
 * #swagger.requestBody = { 
 *   required: true, 
 *   content: { 
 *     'application/json': { 
 *       schema: { $ref: '#/definitions/Usuario' },
 *       example: {
 *         tipoUsuario: "individual",
 *         username: "jdoe",
 *         email: "jdoe@example.com",
 *         password: "password123",
 *         nombre: "John",
 *         apellidos: "Doe"
 *       }
 *     } 
 *   } 
 * }
 * #swagger.responses[201] = { 
 *   description: 'Usuario registrado exitosamente', 
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Usuario' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/signup",
  payloadMiddleware(createUsuarioSchema),
  postAuthSignup
);

/**
 * @route POST /auth/login
 * @summary Iniciar sesión
 * @tags Auth - Operaciones de autenticación
 * #swagger.requestBody = { 
 *   required: true, 
 *   content: { 
 *     'application/json': { 
 *       schema: { 
 *         type: 'object', 
 *         required: ['username', 'password'],
 *         properties: { 
 *           username: { type: 'string', example: 'jdoe' }, 
 *           password: { type: 'string', example: 'password123' } 
 *         } 
 *       } 
 *     } 
 *   } 
 * }
 * #swagger.responses[200] = { 
 *   description: 'Inicio de sesión exitoso', 
 *   content: {
 *     'application/json': {
 *       schema: { 
 *         type: 'object', 
 *         properties: { 
 *           token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
 *           usuario: { $ref: '#/definitions/Usuario' }
 *         } 
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[401] = { description: 'Credenciales inválidas' }
 */
router.post(
  "/login",
  payloadMiddleware(loginSchema),
  postAuthLogin
);

module.exports = router;