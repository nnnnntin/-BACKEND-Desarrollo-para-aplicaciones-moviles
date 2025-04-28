const express = require("express");
const router = express.Router();
const {
  getNotificacionesController,
  getNotificacionByIdController,
  getNotificacionesByUsuarioController,
  getNotificacionesPorTipoController,
  getNotificacionesPendientesController,
  createNotificacionController,
  updateNotificacionController,
  deleteNotificacionController,
  marcarComoLeidaController,
  marcarTodasComoLeidasController,
  eliminarNotificacionesExpiradasController,
  getNotificacionesPorEntidadController,
  filtrarNotificacionesController
} = require("../controllers/notificacion.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createNotificacionSchema,
  updateNotificacionSchema,
  marcarLeidaSchema
} = require("../routes/validations/notificacion.validation");

/**
 * @route GET /notificaciones
 * @summary Obtener todas las notificaciones
 * @tags Notificaciones - Gestión de notificaciones
 * #swagger.responses[200] = { 
 *   description: 'Lista de notificaciones obtenida exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Notificacion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/notificaciones", getNotificacionesController);

/**
 * @route GET /notificaciones/{id}
 * @summary Obtener notificación por ID
 * @tags Notificaciones - Gestión de notificaciones
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la notificación',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Notificación encontrada',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Notificacion' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Notificación no encontrada' }
 */
router.get("/notificaciones/:id", getNotificacionByIdController);

/**
 * @route POST /notificaciones
 * @summary Crear nueva notificación
 * @tags Notificaciones - Gestión de notificaciones
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/createNotificacionSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { 
 *   description: 'Notificación creada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Notificacion' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/notificaciones",
  payloadMiddleware(createNotificacionSchema),
  createNotificacionController
);

/**
 * @route PUT /notificaciones/{id}
 * @summary Actualizar notificación
 * @tags Notificaciones - Gestión de notificaciones
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la notificación',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/updateNotificacionSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'Notificación actualizada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Notificacion' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Notificación no encontrada' }
 */
router.put(
  "/notificaciones/:id",
  payloadMiddleware(updateNotificacionSchema),
  updateNotificacionController
);

/**
 * @route DELETE /notificaciones/{id}
 * @summary Eliminar notificación
 * @tags Notificaciones - Gestión de notificaciones
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la notificación',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Notificación eliminada exitosamente' }
 * #swagger.responses[404] = { description: 'Notificación no encontrada' }
 */
router.delete("/notificaciones/:id", deleteNotificacionController);

/**
 * @route GET /notificaciones/usuario/{usuarioId}
 * @summary Obtener notificaciones por usuario
 * @tags Notificaciones - Gestión de notificaciones
 * #swagger.parameters['usuarioId'] = {
 *   in: 'path',
 *   description: 'ID del usuario',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Notificaciones encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Notificacion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/notificaciones/usuario/:usuarioId", getNotificacionesByUsuarioController);

/**
 * @route GET /notificaciones/tipo/{tipo}
 * @summary Obtener notificaciones por tipo
 * @tags Notificaciones - Gestión de notificaciones
 * #swagger.parameters['tipo'] = {
 *   in: 'path',
 *   description: 'Tipo de notificación',
 *   required: true,
 *   type: 'string',
 *   enum: ['reserva', 'pago', 'sistema', 'recordatorio', 'promocion']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Notificaciones encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Notificacion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/notificaciones/tipo/:tipo", getNotificacionesPorTipoController);

/**
 * @route GET /notificaciones/pendientes/{usuarioId}
 * @summary Obtener notificaciones pendientes de usuario
 * @tags Notificaciones - Gestión de notificaciones
 * #swagger.parameters['usuarioId'] = {
 *   in: 'path',
 *   description: 'ID del usuario',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Notificaciones pendientes encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Notificacion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/notificaciones/pendientes/:usuarioId", getNotificacionesPendientesController);

/**
 * @route POST /notificaciones/leer
 * @summary Marcar notificación como leída
 * @tags Notificaciones - Gestión de notificaciones
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/marcarLeidaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Notificación marcada como leída exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Notificación no encontrada' }
 */
router.post(
  "/notificaciones/leer",
  payloadMiddleware(marcarLeidaSchema),
  marcarComoLeidaController
);

/**
 * @route PUT /notificaciones/usuario/{usuarioId}/leer-todas
 * @summary Marcar todas las notificaciones de un usuario como leídas
 * @tags Notificaciones - Gestión de notificaciones
 * #swagger.parameters['usuarioId'] = {
 *   in: 'path',
 *   description: 'ID del usuario',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Notificaciones marcadas como leídas exitosamente' }
 * #swagger.responses[404] = { description: 'Usuario no encontrado' }
 */
router.put("/notificaciones/usuario/:usuarioId/leer-todas", marcarTodasComoLeidasController);

/**
 * @route DELETE /notificaciones/expiradas
 * @summary Eliminar notificaciones expiradas
 * @tags Notificaciones - Gestión de notificaciones
 * #swagger.parameters['diasAntiguedad'] = {
 *   in: 'query',
 *   description: 'Días de antigüedad',
 *   type: 'integer',
 *   default: 30
 * }
 * #swagger.responses[200] = { description: 'Notificaciones expiradas eliminadas exitosamente' }
 */
router.delete("/notificaciones/expiradas", eliminarNotificacionesExpiradasController);

/**
 * @route GET /notificaciones/entidad/{tipoEntidad}/{entidadId}
 * @summary Obtener notificaciones por entidad relacionada
 * @tags Notificaciones - Gestión de notificaciones
 * #swagger.parameters['tipoEntidad'] = {
 *   in: 'path',
 *   description: 'Tipo de entidad',
 *   required: true,
 *   type: 'string',
 *   enum: ['reserva', 'pago', 'oficina', 'usuario', 'membresia']
 * }
 * #swagger.parameters['entidadId'] = {
 *   in: 'path',
 *   description: 'ID de la entidad',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Notificaciones encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Notificacion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/notificaciones/entidad/:tipoEntidad/:entidadId", getNotificacionesPorEntidadController);

/**
 * @route GET /notificaciones/filtrar
 * @summary Filtrar notificaciones por criterios
 * @tags Notificaciones - Gestión de notificaciones
 * #swagger.parameters['destinatarioId'] = {
 *   in: 'query',
 *   description: 'ID del destinatario',
 *   type: 'string'
 * }
 * #swagger.parameters['tipoNotificacion'] = {
 *   in: 'query',
 *   description: 'Tipo de notificación',
 *   type: 'string',
 *   enum: ['reserva', 'pago', 'sistema', 'recordatorio', 'promocion']
 * }
 * #swagger.parameters['leido'] = {
 *   in: 'query',
 *   description: 'Estado de lectura',
 *   type: 'boolean'
 * }
 * #swagger.parameters['prioridad'] = {
 *   in: 'query',
 *   description: 'Prioridad',
 *   type: 'string',
 *   enum: ['baja', 'media', 'alta']
 * }
 * #swagger.parameters['desde'] = {
 *   in: 'query',
 *   description: 'Fecha desde (YYYY-MM-DD)',
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['hasta'] = {
 *   in: 'query',
 *   description: 'Fecha hasta (YYYY-MM-DD)',
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Notificaciones filtradas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Notificacion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/notificaciones/filtrar", filtrarNotificacionesController);

module.exports = router;