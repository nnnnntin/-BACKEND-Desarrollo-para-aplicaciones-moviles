const express = require("express");
const router = express.Router();
const {
  getFacturasController,
  getFacturaByIdController,
  getFacturaByNumeroController,
  getFacturasByUsuarioController,
  getFacturasByEmisorController,
  getFacturasPorEstadoController,
  getFacturasVencidasController,
  getFacturasPorRangoFechasController,
  createFacturaController,
  updateFacturaController,
  deleteFacturaController,
  cambiarEstadoFacturaController,
  marcarFacturaComoPagadaController,
  marcarFacturaComoVencidaController,
  marcarFacturaComoCanceladaController,
  agregarPagoFacturaController,
  actualizarPdfUrlController,
  getFacturasPorRangoMontoController,
  getEstadisticasFacturacionController,
  generarPdfFacturaController,
  filtrarFacturasController
} = require("../controllers/factura.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createFacturaSchema,
  updateFacturaSchema,
  generarPdfFacturaSchema
} = require("./validations/factura.validation");

/**
 * @route GET /facturas
 * @summary Obtener todas las facturas
 * @tags Facturas - Gestión de facturación
 * #swagger.responses[200] = { 
 *   description: 'Lista de facturas obtenida exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Factura' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/facturas", getFacturasController);

/**
 * @route GET /facturas/{id}
 * @summary Obtener factura por ID
 * @tags Facturas - Gestión de facturación
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la factura',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Factura encontrada',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Factura' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Factura no encontrada' }
 */
router.get("/facturas/:id", getFacturaByIdController);

/**
 * @route GET /facturas/numero/{numeroFactura}
 * @summary Obtener factura por número
 * @tags Facturas - Gestión de facturación
 * #swagger.parameters['numeroFactura'] = {
 *   in: 'path',
 *   description: 'Número de factura',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Factura encontrada',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Factura' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Factura no encontrada' }
 */
router.get("/facturas/numero/:numeroFactura", getFacturaByNumeroController);

/**
 * @route POST /facturas
 * @summary Crear nueva factura
 * @tags Facturas - Gestión de facturación
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/createFacturaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { 
 *   description: 'Factura creada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Factura' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/facturas",
  payloadMiddleware(createFacturaSchema),
  createFacturaController
);

/**
 * @route PUT /facturas/{id}
 * @summary Actualizar factura
 * @tags Facturas - Gestión de facturación
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la factura',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/updateFacturaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'Factura actualizada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Factura' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Factura no encontrada' }
 */
router.put(
  "/facturas/:id",
  payloadMiddleware(updateFacturaSchema),
  updateFacturaController
);

/**
 * @route DELETE /facturas/{id}
 * @summary Eliminar factura
 * @tags Facturas - Gestión de facturación
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la factura',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Factura eliminada exitosamente' }
 * #swagger.responses[404] = { description: 'Factura no encontrada' }
 */
router.delete("/facturas/:id", deleteFacturaController);

/**
 * @route GET /facturas/usuario/{usuarioId}
 * @summary Obtener facturas por usuario
 * @tags Facturas - Gestión de facturación
 * #swagger.parameters['usuarioId'] = {
 *   in: 'path',
 *   description: 'ID del usuario',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Facturas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Factura' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/facturas/usuario/:usuarioId", getFacturasByUsuarioController);

/**
 * @route GET /facturas/emisor
 * @summary Obtener facturas por emisor
 * @tags Facturas - Gestión de facturación
 * #swagger.parameters['emisorId'] = {
 *   in: 'query',
 *   description: 'ID del emisor',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.parameters['tipoEmisor'] = {
 *   in: 'query',
 *   description: 'Tipo de emisor',
 *   required: true,
 *   type: 'string',
 *   enum: ['plataforma', 'inmobiliaria', 'proveedor']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Facturas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Factura' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/facturas/emisor", getFacturasByEmisorController);

/**
 * @route GET /facturas/estado/{estado}
 * @summary Obtener facturas por estado
 * @tags Facturas - Gestión de facturación
 * #swagger.parameters['estado'] = {
 *   in: 'path',
 *   description: 'Estado de la factura',
 *   required: true,
 *   type: 'string',
 *   enum: ['pendiente', 'pagada', 'vencida', 'cancelada']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Facturas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Factura' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/facturas/estado/:estado", getFacturasPorEstadoController);

/**
 * @route GET /facturas/vencidas
 * @summary Obtener facturas vencidas
 * @tags Facturas - Gestión de facturación
 * #swagger.parameters['diasVencimiento'] = {
 *   in: 'query',
 *   description: 'Días de vencimiento',
 *   type: 'integer',
 *   default: 0
 * }
 * #swagger.responses[200] = { 
 *   description: 'Facturas vencidas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Factura' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/facturas/vencidas", getFacturasVencidasController);

/**
 * @route GET /facturas/fechas
 * @summary Obtener facturas por rango de fechas
 * @tags Facturas - Gestión de facturación
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
 * #swagger.parameters['tipoFecha'] = {
 *   in: 'query',
 *   description: 'Tipo de fecha',
 *   type: 'string',
 *   enum: ['emision', 'vencimiento'],
 *   default: 'emision'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Facturas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Factura' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/facturas/fechas", getFacturasPorRangoFechasController);

/**
 * @route PUT /facturas/{id}/estado
 * @summary Cambiar estado de factura
 * @tags Facturas - Gestión de facturación
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la factura',
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
 *             enum: ['pendiente', 'pagada', 'vencida', 'cancelada']
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Estado de la factura actualizado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Factura no encontrada' }
 */
router.put("/facturas/:id/estado", cambiarEstadoFacturaController);

/**
 * @route PUT /facturas/{id}/pagar
 * @summary Marcar factura como pagada
 * @tags Facturas - Gestión de facturación
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la factura',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         properties: {
 *           metodoPago: { type: 'string' },
 *           fechaPago: { type: 'string', format: 'date' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Factura marcada como pagada exitosamente' }
 * #swagger.responses[404] = { description: 'Factura no encontrada' }
 */
router.put("/facturas/:id/pagar", marcarFacturaComoPagadaController);

/**
 * @route PUT /facturas/{id}/vencer
 * @summary Marcar factura como vencida
 * @tags Facturas - Gestión de facturación
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la factura',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Factura marcada como vencida exitosamente' }
 * #swagger.responses[404] = { description: 'Factura no encontrada' }
 */
router.put("/facturas/:id/vencer", marcarFacturaComoVencidaController);

/**
 * @route PUT /facturas/{id}/cancelar
 * @summary Marcar factura como cancelada
 * @tags Facturas - Gestión de facturación
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la factura',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         properties: {
 *           motivo: { type: 'string' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Factura marcada como cancelada exitosamente' }
 * #swagger.responses[404] = { description: 'Factura no encontrada' }
 */
router.put("/facturas/:id/cancelar", marcarFacturaComoCanceladaController);

/**
 * @route POST /facturas/{id}/pago
 * @summary Agregar pago a factura
 * @tags Facturas - Gestión de facturación
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la factura',
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
 * #swagger.responses[200] = { description: 'Pago agregado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Factura no encontrada' }
 */
router.post("/facturas/:id/pago", agregarPagoFacturaController);

/**
 * @route PUT /facturas/{id}/pdf
 * @summary Actualizar URL del PDF de la factura
 * @tags Facturas - Gestión de facturación
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la factura',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['pdfUrl'],
 *         properties: {
 *           pdfUrl: { type: 'string', format: 'uri' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'URL del PDF actualizada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Factura no encontrada' }
 */
router.put("/facturas/:id/pdf", actualizarPdfUrlController);

/**
 * @route GET /facturas/montos
 * @summary Obtener facturas por rango de montos
 * @tags Facturas - Gestión de facturación
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
 *   description: 'Facturas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Factura' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/facturas/montos", getFacturasPorRangoMontoController);

/**
 * @route GET /facturas/estadisticas
 * @summary Obtener estadísticas de facturación
 * @tags Facturas - Gestión de facturación
 * #swagger.parameters['periodoInicio'] = {
 *   in: 'query',
 *   description: 'Fecha de inicio del período (YYYY-MM-DD)',
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['periodoFin'] = {
 *   in: 'query',
 *   description: 'Fecha de fin del período (YYYY-MM-DD)',
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['tipoEmisor'] = {
 *   in: 'query',
 *   description: 'Tipo de emisor',
 *   type: 'string',
 *   enum: ['plataforma', 'inmobiliaria', 'proveedor']
 * }
 * #swagger.parameters['agruparPor'] = {
 *   in: 'query',
 *   description: 'Agrupar por',
 *   type: 'string',
 *   enum: ['dia', 'semana', 'mes'],
 *   default: 'mes'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Estadísticas de facturación obtenidas exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         properties: {
 *           totalFacturado: { type: 'number' },
 *           totalPagado: { type: 'number' },
 *           totalPendiente: { type: 'number' },
 *           totalVencido: { type: 'number' },
 *           porEstado: {
 *             type: 'object',
 *             properties: {
 *               pendiente: { type: 'number' },
 *               pagada: { type: 'number' },
 *               vencida: { type: 'number' },
 *               cancelada: { type: 'number' }
 *             }
 *           },
 *           seriesTiempo: {
 *             type: 'array',
 *             items: {
 *               type: 'object',
 *               properties: {
 *                 periodo: { type: 'string' },
 *                 total: { type: 'number' }
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 */
router.get("/facturas/estadisticas", getEstadisticasFacturacionController);

/**
 * @route POST /facturas/generar-pdf
 * @summary Generar PDF de factura
 * @tags Facturas - Gestión de facturación
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/generarPdfFacturaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'PDF generado exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         properties: {
 *           pdfUrl: { type: 'string', format: 'uri' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Factura no encontrada' }
 */
router.post(
  "/facturas/generar-pdf",
  payloadMiddleware(generarPdfFacturaSchema),
  generarPdfFacturaController
);

/**
 * @route GET /facturas/filtrar
 * @summary Filtrar facturas por criterios
 * @tags Facturas - Gestión de facturación
 * #swagger.parameters['usuarioId'] = {
 *   in: 'query',
 *   description: 'ID del usuario',
 *   type: 'string'
 * }
 * #swagger.parameters['emisorId'] = {
 *   in: 'query',
 *   description: 'ID del emisor',
 *   type: 'string'
 * }
 * #swagger.parameters['tipoEmisor'] = {
 *   in: 'query',
 *   description: 'Tipo de emisor',
 *   type: 'string',
 *   enum: ['plataforma', 'inmobiliaria', 'proveedor']
 * }
 * #swagger.parameters['estado'] = {
 *   in: 'query',
 *   description: 'Estado de la factura',
 *   type: 'string',
 *   enum: ['pendiente', 'pagada', 'vencida', 'cancelada']
 * }
 * #swagger.parameters['fechaEmisionDesde'] = {
 *   in: 'query',
 *   description: 'Fecha de emisión desde (YYYY-MM-DD)',
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['fechaEmisionHasta'] = {
 *   in: 'query',
 *   description: 'Fecha de emisión hasta (YYYY-MM-DD)',
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['fechaVencimientoDesde'] = {
 *   in: 'query',
 *   description: 'Fecha de vencimiento desde (YYYY-MM-DD)',
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['fechaVencimientoHasta'] = {
 *   in: 'query',
 *   description: 'Fecha de vencimiento hasta (YYYY-MM-DD)',
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
 *   description: 'Facturas filtradas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Factura' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/facturas/filtrar", filtrarFacturasController);

module.exports = router;