const express = require("express");
const router = express.Router();
const {
  getPagosController,
  getPagoByIdController,
  getPagosByUsuarioController,
  getPagosPorConceptoController,
  getPagosPorEstadoController,
  getPagosPorEntidadController,
  createPagoController,
  updatePagoController,
  deletePagoController,
  cambiarEstadoPagoController,
  completarPagoController,
  reembolsarPagoController,
  vincularFacturaController,
  getPagosPorRangoFechasController,
  getPagosPorRangoMontosController,
  filtrarPagosController
} = require("../controllers/pago.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createPagoSchema,
  updatePagoSchema,
  reembolsarPagoSchema
} = require("../routes/validations/pago.validation");

/**
 * @route GET /pagos
 * @summary Obtener todos los pagos
 * @tags Pagos - Gestión de pagos
 * #swagger.responses[200] = { 
 *   description: 'Lista de pagos obtenida exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Pago' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/pagos", getPagosController);

/**
 * @route GET /pagos/{id}
 * @summary Obtener pago por ID
 * @tags Pagos - Gestión de pagos
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del pago',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Pago encontrado',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Pago' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Pago no encontrado' }
 */
router.get("/pagos/:id", getPagoByIdController);

/**
 * @route POST /pagos
 * @summary Crear nuevo pago
 * @tags Pagos - Gestión de pagos
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/createPagoSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { 
 *   description: 'Pago creado exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Pago' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/pagos",
  payloadMiddleware(createPagoSchema),
  createPagoController
);

/**
 * @route PUT /pagos/{id}
 * @summary Actualizar pago
 * @tags Pagos - Gestión de pagos
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del pago',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/updatePagoSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'Pago actualizado exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Pago' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Pago no encontrado' }
 */
router.put(
  "/pagos/:id",
  payloadMiddleware(updatePagoSchema),
  updatePagoController
);

/**
 * @route DELETE /pagos/{id}
 * @summary Eliminar pago
 * @tags Pagos - Gestión de pagos
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del pago',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Pago eliminado exitosamente' }
 * #swagger.responses[404] = { description: 'Pago no encontrado' }
 */
router.delete("/pagos/:id", deletePagoController);

/**
 * @route GET /pagos/usuario/{usuarioId}
 * @summary Obtener pagos por usuario
 * @tags Pagos - Gestión de pagos
 * #swagger.parameters['usuarioId'] = {
 *   in: 'path',
 *   description: 'ID del usuario',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Pagos encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Pago' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/pagos/usuario/:usuarioId", getPagosByUsuarioController);

/**
 * @route GET /pagos/concepto/{concepto}
 * @summary Obtener pagos por concepto
 * @tags Pagos - Gestión de pagos
 * #swagger.parameters['concepto'] = {
 *   in: 'path',
 *   description: 'Concepto del pago',
 *   required: true,
 *   type: 'string',
 *   enum: ['reserva', 'membresia', 'multa', 'otro']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Pagos encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Pago' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/pagos/concepto/:concepto", getPagosPorConceptoController);

/**
 * @route GET /pagos/estado/{estado}
 * @summary Obtener pagos por estado
 * @tags Pagos - Gestión de pagos
 * #swagger.parameters['estado'] = {
 *   in: 'path',
 *   description: 'Estado del pago',
 *   required: true,
 *   type: 'string',
 *   enum: ['pendiente', 'completado', 'fallido', 'reembolsado']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Pagos encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Pago' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/pagos/estado/:estado", getPagosPorEstadoController);

/**
 * @route GET /pagos/entidad/{tipoEntidad}/{entidadId}
 * @summary Obtener pagos por entidad
 * @tags Pagos - Gestión de pagos
 * #swagger.parameters['tipoEntidad'] = {
 *   in: 'path',
 *   description: 'Tipo de entidad',
 *   required: true,
 *   type: 'string',
 *   enum: ['reserva', 'membresia']
 * }
 * #swagger.parameters['entidadId'] = {
 *   in: 'path',
 *   description: 'ID de la entidad',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Pagos encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Pago' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/pagos/entidad/:tipoEntidad/:entidadId", getPagosPorEntidadController);

/**
 * @route PUT /pagos/{id}/estado
 * @summary Cambiar estado de pago
 * @tags Pagos - Gestión de pagos
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del pago',
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
 *             enum: ['pendiente', 'completado', 'fallido', 'reembolsado']
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Estado del pago actualizado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Pago no encontrado' }
 */
router.put("/pagos/:id/estado", cambiarEstadoPagoController);

/**
 * @route PUT /pagos/{id}/completar
 * @summary Completar pago
 * @tags Pagos - Gestión de pagos
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del pago',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         properties: {
 *           comprobante: { type: 'string', format: 'uri' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Pago completado exitosamente' }
 * #swagger.responses[404] = { description: 'Pago no encontrado' }
 */
router.put("/pagos/:id/completar", completarPagoController);

/**
 * @route POST /pagos/reembolsar
 * @summary Reembolsar pago
 * @tags Pagos - Gestión de pagos
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/reembolsarPagoSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Pago reembolsado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Pago no encontrado' }
 */
router.post(
  "/pagos/reembolsar",
  payloadMiddleware(reembolsarPagoSchema),
  reembolsarPagoController
);

/**
 * @route PUT /pagos/{id}/factura
 * @summary Vincular factura a pago
 * @tags Pagos - Gestión de pagos
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del pago',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['facturaId'],
 *         properties: {
 *           facturaId: { type: 'string' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Factura vinculada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Pago o factura no encontrados' }
 */
router.put("/pagos/:id/factura", vincularFacturaController);

/**
 * @route GET /pagos/fechas
 * @summary Obtener pagos por rango de fechas
 * @tags Pagos - Gestión de pagos
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
 *   description: 'Pagos encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Pago' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/pagos/fechas", getPagosPorRangoFechasController);

/**
 * @route GET /pagos/montos
 * @summary Obtener pagos por rango de montos
 * @tags Pagos - Gestión de pagos
 * #swagger.parameters['montoMinimo'] = {
 *   in: 'query',
 *   description: 'Monto mínimo',
 *   required: true,
 *   type: 'number',
 *   minimum: 0
 * }
 * #swagger.parameters['montoMaximo'] = {
 *   in: 'query',
 *   description: 'Monto máximo',
 *   required: true,
 *   type: 'number',
 *   minimum: 0
 * }
 * #swagger.responses[200] = { 
 *   description: 'Pagos encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Pago' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/pagos/montos", getPagosPorRangoMontosController);

/**
 * @route GET /pagos/filtrar
 * @summary Filtrar pagos por criterios
 * @tags Pagos - Gestión de pagos
 * #swagger.parameters['usuarioId'] = {
 *   in: 'query',
 *   description: 'ID del usuario',
 *   type: 'string'
 * }
 * #swagger.parameters['conceptoPago'] = {
 *   in: 'query',
 *   description: 'Concepto del pago',
 *   type: 'string',
 *   enum: ['reserva', 'membresia', 'multa', 'otro']
 * }
 * #swagger.parameters['estado'] = {
 *   in: 'query',
 *   description: 'Estado del pago',
 *   type: 'string',
 *   enum: ['pendiente', 'completado', 'fallido', 'reembolsado']
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
 * #swagger.parameters['montoMinimo'] = {
 *   in: 'query',
 *   description: 'Monto mínimo',
 *   type: 'number',
 *   minimum: 0
 * }
 * #swagger.parameters['montoMaximo'] = {
 *   in: 'query',
 *   description: 'Monto máximo',
 *   type: 'number',
 *   minimum: 0
 * }
 * #swagger.responses[200] = { 
 *   description: 'Pagos filtrados encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Pago' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/pagos/filtrar", filtrarPagosController);

module.exports = router;