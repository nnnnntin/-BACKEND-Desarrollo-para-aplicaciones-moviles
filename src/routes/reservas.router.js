const express = require("express");
const router = express.Router();
const {
  getReservasController,
  getReservaByIdController,
  getReservasByUsuarioController,
  getReservasByEntidadController,
  getReservasPendientesAprobacionController,
  getReservasPorFechaController,
  createReservaController,
  updateReservaController,
  deleteReservaController,
  cambiarEstadoReservaController,
  aprobarReservaController,
  rechazarReservaController,
  getReservasRecurrentesController,
  vincularPagoReservaController,
  cancelarReservaController,
  filtrarReservasController
} = require("../controllers/reserva.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createReservaSchema,
  updateReservaSchema,
  cancelarReservaSchema
} = require("../routes/validations/reserva.validation");

/**
 * @route GET /reservas
 * @summary Obtener todas las reservas
 * @tags Reservas - Gestión de reservas
 * #swagger.responses[200] = { 
 *   description: 'Lista de reservas obtenida exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Reserva' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/reservas", getReservasController);

/**
 * @route GET /reservas/{id}
 * @summary Obtener reserva por ID
 * @tags Reservas - Gestión de reservas
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reserva',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reserva encontrada',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Reserva' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Reserva no encontrada' }
 */
router.get("/reservas/:id", getReservaByIdController);

/**
 * @route POST /reservas
 * @summary Crear nueva reserva
 * @tags Reservas - Gestión de reservas
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/createReservaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { 
 *   description: 'Reserva creada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Reserva' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/reservas",
  payloadMiddleware(createReservaSchema),
  createReservaController
);

/**
 * @route PUT /reservas/{id}
 * @summary Actualizar reserva
 * @tags Reservas - Gestión de reservas
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reserva',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/updateReservaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reserva actualizada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Reserva' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Reserva no encontrada' }
 */
router.put(
  "/reservas/:id",
  payloadMiddleware(updateReservaSchema),
  updateReservaController
);

/**
 * @route DELETE /reservas/{id}
 * @summary Eliminar reserva
 * @tags Reservas - Gestión de reservas
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reserva',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Reserva eliminada exitosamente' }
 * #swagger.responses[404] = { description: 'Reserva no encontrada' }
 */
router.delete("/reservas/:id", deleteReservaController);

/**
 * @route GET /reservas/usuario/{usuarioId}
 * @summary Obtener reservas por usuario
 * @tags Reservas - Gestión de reservas
 * #swagger.parameters['usuarioId'] = {
 *   in: 'path',
 *   description: 'ID del usuario',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reservas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Reserva' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/reservas/usuario/:usuarioId", getReservasByUsuarioController);

/**
 * @route GET /reservas/entidad/{tipoEntidad}/{entidadId}
 * @summary Obtener reservas por entidad
 * @tags Reservas - Gestión de reservas
 * #swagger.parameters['tipoEntidad'] = {
 *   in: 'path',
 *   description: 'Tipo de entidad',
 *   required: true,
 *   type: 'string',
 *   enum: ['oficina', 'sala_reunion', 'escritorio_flexible']
 * }
 * #swagger.parameters['entidadId'] = {
 *   in: 'path',
 *   description: 'ID de la entidad',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reservas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Reserva' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/reservas/entidad/:tipoEntidad/:entidadId", getReservasByEntidadController);

/**
 * @route GET /reservas/pendientes
 * @summary Obtener reservas pendientes de aprobación
 * @tags Reservas - Gestión de reservas
 * #swagger.responses[200] = { 
 *   description: 'Reservas pendientes encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Reserva' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/reservas/pendientes", getReservasPendientesAprobacionController);

/**
 * @route GET /reservas/fecha
 * @summary Obtener reservas por fecha
 * @tags Reservas - Gestión de reservas
 * #swagger.parameters['fecha'] = {
 *   in: 'query',
 *   description: 'Fecha (YYYY-MM-DD)',
 *   required: true,
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['tipoEntidad'] = {
 *   in: 'query',
 *   description: 'Tipo de entidad',
 *   type: 'string',
 *   enum: ['oficina', 'sala_reunion', 'escritorio_flexible']
 * }
 * #swagger.parameters['entidadId'] = {
 *   in: 'query',
 *   description: 'ID de la entidad',
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reservas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Reserva' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/reservas/fecha", getReservasPorFechaController);

/**
 * @route PUT /reservas/{id}/estado
 * @summary Cambiar estado de reserva
 * @tags Reservas - Gestión de reservas
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reserva',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['estado'],
 *         properties: {
 *           estado: { 
 *             type: 'string',
 *             enum: ['pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio']
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Estado de la reserva actualizado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Reserva no encontrada' }
 */
router.put("/reservas/:id/estado", cambiarEstadoReservaController);

/**
 * @route PUT /reservas/{id}/aprobar
 * @summary Aprobar reserva
 * @tags Reservas - Gestión de reservas
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reserva',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         properties: {
 *           usuarioId: { type: 'string' },
 *           notas: { type: 'string' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Reserva aprobada exitosamente' }
 * #swagger.responses[404] = { description: 'Reserva no encontrada' }
 */
router.put("/reservas/:id/aprobar", aprobarReservaController);

/**
 * @route PUT /reservas/{id}/rechazar
 * @summary Rechazar reserva
 * @tags Reservas - Gestión de reservas
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reserva',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['motivo'],
 *         properties: {
 *           motivo: { type: 'string' },
 *           usuarioId: { type: 'string' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Reserva rechazada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Reserva no encontrada' }
 */
router.put("/reservas/:id/rechazar", rechazarReservaController);

/**
 * @route GET /reservas/recurrentes
 * @summary Obtener reservas recurrentes
 * @tags Reservas - Gestión de reservas
 * #swagger.parameters['usuarioId'] = {
 *   in: 'query',
 *   description: 'ID del usuario',
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reservas recurrentes encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Reserva' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/reservas/recurrentes", getReservasRecurrentesController);

/**
 * @route PUT /reservas/{id}/pago
 * @summary Vincular pago a reserva
 * @tags Reservas - Gestión de reservas
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reserva',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['pagoId'],
 *         properties: {
 *           pagoId: { type: 'string' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Pago vinculado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Reserva o pago no encontrados' }
 */
router.put("/reservas/:id/pago", vincularPagoReservaController);

/**
 * @route POST /reservas/cancelar
 * @summary Cancelar reserva
 * @tags Reservas - Gestión de reservas
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/cancelarReservaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Reserva cancelada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Reserva no encontrada' }
 */
router.post(
  "/reservas/cancelar",
  payloadMiddleware(cancelarReservaSchema),
  cancelarReservaController
);

/**
 * @route GET /reservas/filtrar
 * @summary Filtrar reservas por criterios
 * @tags Reservas - Gestión de reservas
 * #swagger.parameters['usuarioId'] = {
 *   in: 'query',
 *   description: 'ID del usuario',
 *   type: 'string'
 * }
 * #swagger.parameters['tipoEntidad'] = {
 *   in: 'query',
 *   description: 'Tipo de entidad',
 *   type: 'string',
 *   enum: ['oficina', 'sala_reunion', 'escritorio_flexible']
 * }
 * #swagger.parameters['entidadId'] = {
 *   in: 'query',
 *   description: 'ID de la entidad',
 *   type: 'string'
 * }
 * #swagger.parameters['estado'] = {
 *   in: 'query',
 *   description: 'Estado de la reserva',
 *   type: 'string',
 *   enum: ['pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio']
 * }
 * #swagger.parameters['fechaInicio'] = {
 *   in: 'query',
 *   description: 'Fecha de inicio (YYYY-MM-DD)',
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['fechaFin'] = {
 *   in: 'query',
 *   description: 'Fecha de fin (YYYY-MM-DD)',
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['esRecurrente'] = {
 *   in: 'query',
 *   description: 'Es recurrente',
 *   type: 'boolean'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reservas filtradas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Reserva' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/reservas/filtrar", filtrarReservasController);

module.exports = router;