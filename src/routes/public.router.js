const express = require("express");
const swaggerUi = require("swagger-ui-express");
const publicRouter = express.Router();
const swaggerDocument = require("../public/swagger.json");

const {
  healthController,
  pingController,
} = require("../controllers/public.controller");

/**
 * @route GET /health
 * @summary Verificar el estado de salud de la API
 * @tags Sistema - Operaciones del sistema
 * #swagger.responses[200] = { 
 *   description: 'API funcionando correctamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         properties: {
 *           status: { type: 'string', example: 'ok' },
 *           timestamp: { type: 'string', format: 'date-time' },
 *           version: { type: 'string', example: '1.0.0' }
 *         }
 *       }
 *     }
 *   }
 * }
 */
publicRouter.get("/health", healthController);

/**
 * @route GET /ping
 * @summary Verificar la conectividad de la API
 * @tags Sistema - Operaciones del sistema
 * #swagger.responses[200] = { 
 *   description: 'Ping exitoso',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         properties: {
 *           message: { type: 'string', example: 'pong' }
 *         }
 *       }
 *     }
 *   }
 * }
 */
publicRouter.get("/ping", pingController);

/**
 * @route GET /swagger
 * @summary Documentación de la API con Swagger UI
 * @tags Sistema - Operaciones del sistema
 * #swagger.ignore = true
 */
publicRouter.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = publicRouter;