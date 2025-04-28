const express = require("express");
const router = express.Router();
const {
  getPromocionesController,
  getPromocionByIdController,
  getPromocionByCodigoController,
  getPromocionesActivasController,
  getPromocionesPorTipoController,
  getPromocionesPorEntidadController,
  getPromocionesPorRangoDeFechasController,
  createPromocionController,
  updatePromocionController,
  deletePromocionController,
  activarPromocionController,
  incrementarUsosController,
  validarPromocionController,
  getPromocionesProximasAExpirarController,
  actualizarAplicabilidadController,
  filtrarPromocionesController
} = require("../controllers/promocion.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createPromocionSchema,
  updatePromocionSchema,
  validarCodigoPromocionSchema
} = require("./validations/promocion.validation");

/**
 * @route GET /promociones
 * @summary Obtener todas las promociones
 * @tags Promociones - Gestión de promociones
 * #swagger.responses[200] = { 
 *   description: 'Lista de promociones obtenida exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Promocion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/promociones", getPromocionesController);

/**
 * @route GET /promociones/{id}
 * @summary Obtener promoción por ID
 * @tags Promociones - Gestión de promociones
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la promoción',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Promoción encontrada',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Promocion' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Promoción no encontrada' }
 */
router.get("/promociones/:id", getPromocionByIdController);

/**
 * @route GET /promociones/codigo/{codigo}
 * @summary Obtener promoción por código
 * @tags Promociones - Gestión de promociones
 * #swagger.parameters['codigo'] = {
 *   in: 'path',
 *   description: 'Código de la promoción',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Promoción encontrada',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Promocion' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Promoción no encontrada' }
 */
router.get("/promociones/codigo/:codigo", getPromocionByCodigoController);

/**
 * @route POST /promociones
 * @summary Crear nueva promoción
 * @tags Promociones - Gestión de promociones
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/createPromocionSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { 
 *   description: 'Promoción creada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Promocion' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/promociones",
  payloadMiddleware(createPromocionSchema),
  createPromocionController
);

/**
 * @route PUT /promociones/{id}
 * @summary Actualizar promoción
 * @tags Promociones - Gestión de promociones
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la promoción',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/updatePromocionSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'Promoción actualizada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Promocion' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Promoción no encontrada' }
 */
router.put(
  "/promociones/:id",
  payloadMiddleware(updatePromocionSchema),
  updatePromocionController
);

/**
 * @route DELETE /promociones/{id}
 * @summary Eliminar promoción
 * @tags Promociones - Gestión de promociones
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la promoción',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Promoción eliminada exitosamente' }
 * #swagger.responses[404] = { description: 'Promoción no encontrada' }
 */
router.delete("/promociones/:id", deletePromocionController);

/**
 * @route GET /promociones/activas
 * @summary Obtener promociones activas
 * @tags Promociones - Gestión de promociones
 * #swagger.responses[200] = { 
 *   description: 'Promociones activas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Promocion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/promociones/activas", getPromocionesActivasController);

/**
 * @route GET /promociones/tipo/{tipo}
 * @summary Obtener promociones por tipo
 * @tags Promociones - Gestión de promociones
 * #swagger.parameters['tipo'] = {
 *   in: 'path',
 *   description: 'Tipo de promoción',
 *   required: true,
 *   type: 'string',
 *   enum: ['porcentaje', 'monto_fijo', 'gratuito']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Promociones encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Promocion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/promociones/tipo/:tipo", getPromocionesPorTipoController);

/**
 * @route GET /promociones/entidad
 * @summary Obtener promociones por entidad
 * @tags Promociones - Gestión de promociones
 * #swagger.parameters['entidadTipo'] = {
 *   in: 'query',
 *   description: 'Tipo de entidad',
 *   required: true,
 *   type: 'string',
 *   enum: ['oficina', 'sala_reunion', 'escritorio_flexible', 'membresia', 'servicio']
 * }
 * #swagger.parameters['entidadId'] = {
 *   in: 'query',
 *   description: 'ID de la entidad',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Promociones encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Promocion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/promociones/entidad", getPromocionesPorEntidadController);

/**
 * @route GET /promociones/fechas
 * @summary Obtener promociones por rango de fechas
 * @tags Promociones - Gestión de promociones
 * #swagger.parameters['fechaInicio'] = {
 *   in: 'query',
 *   description: 'Fecha de inicio (YYYY-MM-DD)',
 *   required: true,
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['fechaFin'] = {
 *   in: 'query',
 *   description: 'Fecha de fin (YYYY-MM-DD)',
 *   required: true,
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Promociones encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Promocion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/promociones/fechas", getPromocionesPorRangoDeFechasController);

/**
 * @route PUT /promociones/{id}/activar
 * @summary Activar o desactivar promoción
 * @tags Promociones - Gestión de promociones
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la promoción',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['activo'],
 *         properties: {
 *           activo: { type: 'boolean' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Estado de la promoción actualizado exitosamente' }
 * #swagger.responses[404] = { description: 'Promoción no encontrada' }
 */
router.put("/promociones/:id/activar", activarPromocionController);

/**
 * @route PUT /promociones/{id}/incrementar-usos
 * @summary Incrementar usos de promoción
 * @tags Promociones - Gestión de promociones
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la promoción',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         properties: {
 *           cantidad: { 
 *             type: 'integer',
 *             minimum: 1,
 *             default: 1
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Usos de promoción incrementados exitosamente' }
 * #swagger.responses[404] = { description: 'Promoción no encontrada' }
 */
router.put("/promociones/:id/incrementar-usos", incrementarUsosController);

/**
 * @route POST /promociones/validar
 * @summary Validar código de promoción
 * @tags Promociones - Gestión de promociones
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/validarCodigoPromocionSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'Promoción validada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         properties: {
 *           valida: { type: 'boolean' },
 *           promocion: { $ref: '#/definitions/Promocion' },
 *           descuento: { type: 'number' },
 *           mensaje: { type: 'string' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos o promoción no válida' }
 */
router.post(
  "/promociones/validar",
  payloadMiddleware(validarCodigoPromocionSchema),
  validarPromocionController
);

/**
 * @route GET /promociones/proximas-expirar
 * @summary Obtener promociones próximas a expirar
 * @tags Promociones - Gestión de promociones
 * #swagger.parameters['diasProximos'] = {
 *   in: 'query',
 *   description: 'Días próximos',
 *   type: 'integer',
 *   default: 7
 * }
 * #swagger.responses[200] = { 
 *   description: 'Promociones próximas a expirar encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Promocion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/promociones/proximas-expirar", getPromocionesProximasAExpirarController);

/**
 * @route PUT /promociones/{id}/aplicabilidad
 * @summary Actualizar aplicabilidad de promoción
 * @tags Promociones - Gestión de promociones
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la promoción',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['aplicableA'],
 *         properties: {
 *           aplicableA: {
 *             type: 'object',
 *             required: ['entidad', 'ids'],
 *             properties: {
 *               entidad: { 
 *                 type: 'string',
 *                 enum: ['oficina', 'sala_reunion', 'escritorio_flexible', 'membresia', 'servicio']
 *               },
 *               ids: {
 *                 type: 'array',
 *                 items: { type: 'string' }
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Aplicabilidad de promoción actualizada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Promoción no encontrada' }
 */
router.put("/promociones/:id/aplicabilidad", actualizarAplicabilidadController);

/**
 * @route GET /promociones/filtrar
 * @summary Filtrar promociones por criterios
 * @tags Promociones - Gestión de promociones
 * #swagger.parameters['activo'] = {
 *   in: 'query',
 *   description: 'Estado activo',
 *   type: 'boolean'
 * }
 * #swagger.parameters['tipo'] = {
 *   in: 'query',
 *   description: 'Tipo de promoción',
 *   type: 'string',
 *   enum: ['porcentaje', 'monto_fijo', 'gratuito']
 * }
 * #swagger.parameters['entidadTipo'] = {
 *   in: 'query',
 *   description: 'Tipo de entidad',
 *   type: 'string',
 *   enum: ['oficina', 'sala_reunion', 'escritorio_flexible', 'membresia', 'servicio']
 * }
 * #swagger.parameters['entidadId'] = {
 *   in: 'query',
 *   description: 'ID de la entidad',
 *   type: 'string'
 * }
 * #swagger.parameters['vigente'] = {
 *   in: 'query',
 *   description: 'Vigencia',
 *   type: 'boolean'
 * }
 * #swagger.parameters['fechaDesde'] = {
 *   in: 'query',
 *   description: 'Fecha desde (YYYY-MM-DD)',
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['fechaHasta'] = {
 *   in: 'query',
 *   description: 'Fecha hasta (YYYY-MM-DD)',
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Promociones filtradas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Promocion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/promociones/filtrar", filtrarPromocionesController);

module.exports = router;