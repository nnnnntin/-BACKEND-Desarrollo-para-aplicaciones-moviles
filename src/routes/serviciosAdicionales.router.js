const express = require("express");
const router = express.Router();
const {
  getServiciosAdicionalesController,
  getServicioAdicionalByIdController,
  getServiciosByTipoController,
  getServiciosByProveedorController,
  getServiciosByEspacioController,
  getServiciosByRangoPrecioController,
  getServiciosByUnidadPrecioController,
  getServiciosDisponiblesEnFechaController,
  createServicioAdicionalController,
  updateServicioAdicionalController,
  deleteServicioAdicionalController,
  activarServicioAdicionalController,
  actualizarPrecioController,
  actualizarDisponibilidadController,
  asignarEspacioController,
  eliminarEspacioController,
  getServiciosConAprobacionController,
  filtrarServiciosAdicionalesController
} = require("../controllers/servicioAdicional.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createServicioAdicionalSchema,
  updateServicioAdicionalSchema
} = require("./validations/servicioAdicional.validation");

/**
 * @route GET /servicios-adicionales
 * @summary Obtener todos los servicios adicionales
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.responses[200] = { 
 *   description: 'Lista de servicios adicionales obtenida exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ServicioAdicional' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/servicios-adicionales", getServiciosAdicionalesController);

/**
 * @route GET /servicios-adicionales/{id}
 * @summary Obtener servicio adicional por ID
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del servicio adicional',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Servicio adicional encontrado',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/ServicioAdicional' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Servicio adicional no encontrado' }
 */
router.get("/servicios-adicionales/:id", getServicioAdicionalByIdController);

/**
 * @route POST /servicios-adicionales
 * @summary Crear nuevo servicio adicional
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/createServicioAdicionalSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { 
 *   description: 'Servicio adicional creado exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/ServicioAdicional' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/servicios-adicionales",
  payloadMiddleware(createServicioAdicionalSchema),
  createServicioAdicionalController
);

/**
 * @route PUT /servicios-adicionales/{id}
 * @summary Actualizar servicio adicional
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del servicio adicional',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/updateServicioAdicionalSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'Servicio adicional actualizado exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/ServicioAdicional' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Servicio adicional no encontrado' }
 */
router.put(
  "/servicios-adicionales/:id",
  payloadMiddleware(updateServicioAdicionalSchema),
  updateServicioAdicionalController
);

/**
 * @route DELETE /servicios-adicionales/{id}
 * @summary Eliminar servicio adicional
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del servicio adicional',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Servicio adicional eliminado exitosamente' }
 * #swagger.responses[404] = { description: 'Servicio adicional no encontrado' }
 */
router.delete("/servicios-adicionales/:id", deleteServicioAdicionalController);

/**
 * @route GET /servicios-adicionales/tipo/{tipo}
 * @summary Obtener servicios adicionales por tipo
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.parameters['tipo'] = {
 *   in: 'path',
 *   description: 'Tipo de servicio',
 *   required: true,
 *   type: 'string',
 *   enum: ['catering', 'limpieza', 'recepcion', 'parking', 'impresion', 'otro']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Servicios adicionales encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ServicioAdicional' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/servicios-adicionales/tipo/:tipo", getServiciosByTipoController);

/**
 * @route GET /servicios-adicionales/proveedor/{proveedorId}
 * @summary Obtener servicios adicionales por proveedor
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.parameters['proveedorId'] = {
 *   in: 'path',
 *   description: 'ID del proveedor',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Servicios adicionales encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ServicioAdicional' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/servicios-adicionales/proveedor/:proveedorId", getServiciosByProveedorController);

/**
 * @route GET /servicios-adicionales/espacio/{espacioId}
 * @summary Obtener servicios adicionales por espacio
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.parameters['espacioId'] = {
 *   in: 'path',
 *   description: 'ID del espacio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Servicios adicionales encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ServicioAdicional' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/servicios-adicionales/espacio/:espacioId", getServiciosByEspacioController);

/**
 * @route GET /servicios-adicionales/precio
 * @summary Obtener servicios adicionales por rango de precio
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.parameters['precioMinimo'] = {
 *   in: 'query',
 *   description: 'Precio mínimo',
 *   type: 'number',
 *   minimum: 0
 * }
 * #swagger.parameters['precioMaximo'] = {
 *   in: 'query',
 *   description: 'Precio máximo',
 *   type: 'number',
 *   minimum: 0
 * }
 * #swagger.responses[200] = { 
 *   description: 'Servicios adicionales encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ServicioAdicional' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/servicios-adicionales/precio", getServiciosByRangoPrecioController);

/**
 * @route GET /servicios-adicionales/unidad-precio/{unidadPrecio}
 * @summary Obtener servicios adicionales por unidad de precio
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.parameters['unidadPrecio'] = {
 *   in: 'path',
 *   description: 'Unidad de precio',
 *   required: true,
 *   type: 'string',
 *   enum: ['por_uso', 'por_hora', 'por_persona', 'por_dia']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Servicios adicionales encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ServicioAdicional' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/servicios-adicionales/unidad-precio/:unidadPrecio", getServiciosByUnidadPrecioController);

/**
 * @route GET /servicios-adicionales/disponibles
 * @summary Obtener servicios adicionales disponibles en fecha
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.parameters['fecha'] = {
 *   in: 'query',
 *   description: 'Fecha (YYYY-MM-DD)',
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['hora'] = {
 *   in: 'query',
 *   description: 'Hora (HH:MM)',
 *   type: 'string'
 * }
 * #swagger.parameters['espacioId'] = {
 *   in: 'query',
 *   description: 'ID del espacio',
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Servicios adicionales disponibles encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ServicioAdicional' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/servicios-adicionales/disponibles", getServiciosDisponiblesEnFechaController);

/**
 * @route PUT /servicios-adicionales/{id}/activar
 * @summary Activar o desactivar servicio adicional
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del servicio adicional',
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
 * #swagger.responses[200] = { description: 'Estado del servicio adicional actualizado exitosamente' }
 * #swagger.responses[404] = { description: 'Servicio adicional no encontrado' }
 */
router.put("/servicios-adicionales/:id/activar", activarServicioAdicionalController);

/**
 * @route PUT /servicios-adicionales/{id}/precio
 * @summary Actualizar precio de servicio adicional
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del servicio adicional',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['precio', 'unidadPrecio'],
 *         properties: {
 *           precio: { type: 'number', minimum: 0 },
 *           unidadPrecio: { 
 *             type: 'string',
 *             enum: ['por_uso', 'por_hora', 'por_persona', 'por_dia']
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Precio actualizado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Servicio adicional no encontrado' }
 */
router.put("/servicios-adicionales/:id/precio", actualizarPrecioController);

/**
 * @route PUT /servicios-adicionales/{id}/disponibilidad
 * @summary Actualizar disponibilidad de servicio adicional
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del servicio adicional',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['disponibilidad'],
 *         properties: {
 *           disponibilidad: {
 *             type: 'object',
 *             properties: {
 *               diasDisponibles: {
 *                 type: 'array',
 *                 items: {
 *                   type: 'string',
 *                   enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
 *                 }
 *               },
 *               horaInicio: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
 *               horaFin: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Disponibilidad actualizada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Servicio adicional no encontrado' }
 */
router.put("/servicios-adicionales/:id/disponibilidad", actualizarDisponibilidadController);

/**
 * @route POST /servicios-adicionales/{id}/espacio
 * @summary Asignar espacio a servicio adicional
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del servicio adicional',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['espacioId'],
 *         properties: {
 *           espacioId: { type: 'string' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Espacio asignado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Servicio adicional o espacio no encontrados' }
 */
router.post("/servicios-adicionales/:id/espacio", asignarEspacioController);

/**
 * @route DELETE /servicios-adicionales/{id}/espacio/{espacioId}
 * @summary Eliminar espacio de servicio adicional
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del servicio adicional',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.parameters['espacioId'] = {
 *   in: 'path',
 *   description: 'ID del espacio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Espacio eliminado exitosamente' }
 * #swagger.responses[404] = { description: 'Servicio adicional o espacio no encontrados' }
 */
router.delete("/servicios-adicionales/:id/espacio/:espacioId", eliminarEspacioController);

/**
 * @route GET /servicios-adicionales/aprobacion
 * @summary Obtener servicios adicionales que requieren aprobación
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.responses[200] = { 
 *   description: 'Servicios adicionales que requieren aprobación encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ServicioAdicional' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/servicios-adicionales/aprobacion", getServiciosConAprobacionController);

/**
 * @route GET /servicios-adicionales/filtrar
 * @summary Filtrar servicios adicionales por criterios
 * @tags Servicios Adicionales - Gestión de servicios adicionales
 * #swagger.parameters['tipo'] = {
 *   in: 'query',
 *   description: 'Tipo de servicio',
 *   type: 'string',
 *   enum: ['catering', 'limpieza', 'recepcion', 'parking', 'impresion', 'otro']
 * }
 * #swagger.parameters['precioMaximo'] = {
 *   in: 'query',
 *   description: 'Precio máximo',
 *   type: 'number',
 *   minimum: 0
 * }
 * #swagger.parameters['unidadPrecio'] = {
 *   in: 'query',
 *   description: 'Unidad de precio',
 *   type: 'string',
 *   enum: ['por_uso', 'por_hora', 'por_persona', 'por_dia']
 * }
 * #swagger.parameters['diaDisponible'] = {
 *   in: 'query',
 *   description: 'Día disponible',
 *   type: 'string',
 *   enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
 * }
 * #swagger.parameters['proveedorId'] = {
 *   in: 'query',
 *   description: 'ID del proveedor',
 *   type: 'string'
 * }
 * #swagger.parameters['espacioId'] = {
 *   in: 'query',
 *   description: 'ID del espacio',
 *   type: 'string'
 * }
 * #swagger.parameters['requiereAprobacion'] = {
 *   in: 'query',
 *   description: 'Requiere aprobación',
 *   type: 'boolean'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Servicios adicionales filtrados encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/ServicioAdicional' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/servicios-adicionales/filtrar", filtrarServiciosAdicionalesController);

module.exports = router;