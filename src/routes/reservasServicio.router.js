const express = require("express");
const router = express.Router();
const {
  getReservasServicioController,
  getReservaServicioByIdController,
  getReservasByUsuarioController,
  getReservasByServicioController,
  getReservasByReservaEspacioController,
  getReservasPorEstadoController,
  getReservasPorRangoFechasController,
  createReservaServicioController,
  updateReservaServicioController,
  deleteReservaServicioController,
  cambiarEstadoReservaController,
  confirmarReservaServicioController,
  cancelarReservaServicioController,
  completarReservaServicioController,
  vincularPagoController,
  getReservasPendientesByFechaController,
  aprobarRechazarReservaServicioController,
  filtrarReservasServicioController
} = require("../controllers/reservaServicio.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createReservaServicioSchema,
  updateReservaServicioSchema,
  aprobarRechazarReservaServicioSchema
} = require("./validations/reservaServicio.validation");

/**
 * @route GET /reservas-servicio
 * @summary Obtener todas las reservas de servicio
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.responses[200] = { 
 *   description: 'Lista de reservas de servicio obtenida exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ReservaServicio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/reservas-servicio", getReservasServicioController);

/**
 * @route GET /reservas-servicio/{id}
 * @summary Obtener reserva de servicio por ID
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reserva de servicio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reserva de servicio encontrada',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/ReservaServicio' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Reserva de servicio no encontrada' }
 */
router.get("/reservas-servicio/:id", getReservaServicioByIdController);

/**
 * @route POST /reservas-servicio
 * @summary Crear nueva reserva de servicio
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/createReservaServicioSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { 
 *   description: 'Reserva de servicio creada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/ReservaServicio' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/reservas-servicio",
  payloadMiddleware(createReservaServicioSchema),
  createReservaServicioController
);

/**
 * @route PUT /reservas-servicio/{id}
 * @summary Actualizar reserva de servicio
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reserva de servicio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/updateReservaServicioSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reserva de servicio actualizada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/ReservaServicio' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Reserva de servicio no encontrada' }
 */
router.put(
  "/reservas-servicio/:id",
  payloadMiddleware(updateReservaServicioSchema),
  updateReservaServicioController
);

/**
 * @route DELETE /reservas-servicio/{id}
 * @summary Eliminar reserva de servicio
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reserva de servicio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Reserva de servicio eliminada exitosamente' }
 * #swagger.responses[404] = { description: 'Reserva de servicio no encontrada' }
 */
router.delete("/reservas-servicio/:id", deleteReservaServicioController);

/**
 * @route GET /reservas-servicio/usuario/{usuarioId}
 * @summary Obtener reservas de servicio por usuario
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.parameters['usuarioId'] = {
 *   in: 'path',
 *   description: 'ID del usuario',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reservas de servicio encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ReservaServicio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/reservas-servicio/usuario/:usuarioId", getReservasByUsuarioController);

/**
 * @route GET /reservas-servicio/servicio/{servicioId}
 * @summary Obtener reservas por servicio
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.parameters['servicioId'] = {
 *   in: 'path',
 *   description: 'ID del servicio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reservas de servicio encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ReservaServicio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/reservas-servicio/servicio/:servicioId", getReservasByServicioController);

/**
 * @route GET /reservas-servicio/reserva-espacio/{reservaEspacioId}
 * @summary Obtener reservas de servicio por reserva de espacio
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.parameters['reservaEspacioId'] = {
 *   in: 'path',
 *   description: 'ID de la reserva de espacio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reservas de servicio encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ReservaServicio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/reservas-servicio/reserva-espacio/:reservaEspacioId", getReservasByReservaEspacioController);

/**
 * @route GET /reservas-servicio/estado/{estado}
 * @summary Obtener reservas de servicio por estado
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.parameters['estado'] = {
 *   in: 'path',
 *   description: 'Estado de la reserva',
 *   required: true,
 *   type: 'string',
 *   enum: ['pendiente', 'confirmado', 'cancelado', 'completado']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reservas de servicio encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ReservaServicio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/reservas-servicio/estado/:estado", getReservasPorEstadoController);

/**
 * @route GET /reservas-servicio/fechas
 * @summary Obtener reservas de servicio por rango de fechas
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
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
 * #swagger.parameters['servicioId'] = {
 *   in: 'query',
 *   description: 'ID del servicio',
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reservas de servicio encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ReservaServicio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/reservas-servicio/fechas", getReservasPorRangoFechasController);

/**
 * @route PUT /reservas-servicio/{id}/estado
 * @summary Cambiar estado de reserva de servicio
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reserva de servicio',
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
 *             enum: ['pendiente', 'confirmado', 'cancelado', 'completado']
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Estado de la reserva de servicio actualizado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Reserva de servicio no encontrada' }
 */
router.put("/reservas-servicio/:id/estado", cambiarEstadoReservaController);

/**
 * @route PUT /reservas-servicio/{id}/confirmar
 * @summary Confirmar reserva de servicio
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reserva de servicio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Reserva de servicio confirmada exitosamente' }
 * #swagger.responses[404] = { description: 'Reserva de servicio no encontrada' }
 */
router.put("/reservas-servicio/:id/confirmar", confirmarReservaServicioController);

/**
 * @route PUT /reservas-servicio/{id}/cancelar
 * @summary Cancelar reserva de servicio
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reserva de servicio',
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
 *           motivo: { type: 'string' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Reserva de servicio cancelada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Reserva de servicio no encontrada' }
 */
router.put("/reservas-servicio/:id/cancelar", cancelarReservaServicioController);

/**
 * @route PUT /reservas-servicio/{id}/completar
 * @summary Completar reserva de servicio
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reserva de servicio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         properties: {
 *           comentario: { type: 'string' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Reserva de servicio completada exitosamente' }
 * #swagger.responses[404] = { description: 'Reserva de servicio no encontrada' }
 */
router.put("/reservas-servicio/:id/completar", completarReservaServicioController);

/**
 * @route PUT /reservas-servicio/{id}/pago
 * @summary Vincular pago a reserva de servicio
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reserva de servicio',
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
 * #swagger.responses[404] = { description: 'Reserva de servicio o pago no encontrados' }
 */
router.put("/reservas-servicio/:id/pago", vincularPagoController);

/**
 * @route GET /reservas-servicio/pendientes
 * @summary Obtener reservas de servicio pendientes por fecha
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.parameters['fecha'] = {
 *   in: 'query',
 *   description: 'Fecha (YYYY-MM-DD)',
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['servicioId'] = {
 *   in: 'query',
 *   description: 'ID del servicio',
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reservas de servicio pendientes encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ReservaServicio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/reservas-servicio/pendientes", getReservasPendientesByFechaController);

/**
 * @route POST /reservas-servicio/aprobar-rechazar
 * @summary Aprobar o rechazar reserva de servicio
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/aprobarRechazarReservaServicioSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Reserva de servicio aprobada o rechazada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Reserva de servicio no encontrada' }
 */
router.post(
  "/reservas-servicio/aprobar-rechazar",
  payloadMiddleware(aprobarRechazarReservaServicioSchema),
  aprobarRechazarReservaServicioController
);

/**
 * @route GET /reservas-servicio/filtrar
 * @summary Filtrar reservas de servicio por criterios
 * @tags Reservas de Servicio - Gestión de reservas de servicios adicionales
 * #swagger.parameters['usuarioId'] = {
 *   in: 'query',
 *   description: 'ID del usuario',
 *   type: 'string'
 * }
 * #swagger.parameters['servicioId'] = {
 *   in: 'query',
 *   description: 'ID del servicio',
 *   type: 'string'
 * }
 * #swagger.parameters['reservaEspacioId'] = {
 *   in: 'query',
 *   description: 'ID de la reserva de espacio',
 *   type: 'string'
 * }
 * #swagger.parameters['estado'] = {
 *   in: 'query',
 *   description: 'Estado de la reserva',
 *   type: 'string',
 *   enum: ['pendiente', 'confirmado', 'cancelado', 'completado']
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
 *   description: 'Reservas de servicio filtradas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ReservaServicio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/reservas-servicio/filtrar", filtrarReservasServicioController);

module.exports = router;