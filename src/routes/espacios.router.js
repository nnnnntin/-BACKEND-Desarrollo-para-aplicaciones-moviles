const express = require("express");
const router = express.Router();
const {
  getEspaciosController,
  getEspacioByIdController,
  getEspaciosByEdificioController,
  getEspaciosByTipoController,
  getEspaciosByPropietarioController,
  getEspaciosByEmpresaController,
  createEspacioController,
  updateEspacioController,
  deleteEspacioController,
  cambiarEstadoEspacioController,
  getEspaciosDisponiblesController,
  filtrarEspaciosController,
  getEspaciosByAmenidadesController
} = require("../controllers/espacio.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createEspacioSchema,
  updateEspacioSchema
} = require("../routes/validations/espacio.validation");

/**
 * @route GET /espacios
 * @summary Obtener todos los espacios
 * @tags Espacios - Gestión de espacios
 * #swagger.responses[200] = { 
 *   description: 'Lista de espacios obtenida exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Espacio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/espacios", getEspaciosController);

/**
 * @route GET /espacios/{id}
 * @summary Obtener espacio por ID
 * @tags Espacios - Gestión de espacios
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del espacio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Espacio encontrado',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Espacio' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Espacio no encontrado' }
 */
router.get("/espacios/:id", getEspacioByIdController);

/**
 * @route POST /espacios
 * @summary Crear nuevo espacio
 * @tags Espacios - Gestión de espacios
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/createEspacioSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { 
 *   description: 'Espacio creado exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Espacio' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/espacios",
  payloadMiddleware(createEspacioSchema),
  createEspacioController
);

/**
 * @route PUT /espacios/{id}
 * @summary Actualizar espacio
 * @tags Espacios - Gestión de espacios
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del espacio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/updateEspacioSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'Espacio actualizado exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Espacio' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Espacio no encontrado' }
 */
router.put(
  "/espacios/:id",
  payloadMiddleware(updateEspacioSchema),
  updateEspacioController
);

/**
 * @route DELETE /espacios/{id}
 * @summary Eliminar espacio
 * @tags Espacios - Gestión de espacios
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del espacio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Espacio eliminado exitosamente' }
 * #swagger.responses[404] = { description: 'Espacio no encontrado' }
 */
router.delete("/espacios/:id", deleteEspacioController);

/**
 * @route GET /espacios/edificio/{edificioId}
 * @summary Obtener espacios por edificio
 * @tags Espacios - Gestión de espacios
 * #swagger.parameters['edificioId'] = {
 *   in: 'path',
 *   description: 'ID del edificio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Espacios encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Espacio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/espacios/edificio/:edificioId", getEspaciosByEdificioController);

/**
 * @route GET /espacios/tipo/{tipo}
 * @summary Obtener espacios por tipo
 * @tags Espacios - Gestión de espacios
 * #swagger.parameters['tipo'] = {
 *   in: 'path',
 *   description: 'Tipo de espacio',
 *   required: true,
 *   type: 'string',
 *   enum: ['oficina', 'sala_reunion', 'escritorio_flexible', 'otro']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Espacios encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Espacio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/espacios/tipo/:tipo", getEspaciosByTipoController);

/**
 * @route GET /espacios/propietario/{propietarioId}
 * @summary Obtener espacios por propietario
 * @tags Espacios - Gestión de espacios
 * #swagger.parameters['propietarioId'] = {
 *   in: 'path',
 *   description: 'ID del propietario',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Espacios encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Espacio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/espacios/propietario/:propietarioId", getEspaciosByPropietarioController);

/**
 * @route GET /espacios/empresa/{empresaId}
 * @summary Obtener espacios por empresa
 * @tags Espacios - Gestión de espacios
 * #swagger.parameters['empresaId'] = {
 *   in: 'path',
 *   description: 'ID de la empresa',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Espacios encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Espacio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/espacios/empresa/:empresaId", getEspaciosByEmpresaController);

/**
 * @route PUT /espacios/{id}/estado
 * @summary Cambiar estado de espacio
 * @tags Espacios - Gestión de espacios
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del espacio',
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
 *             enum: ['disponible', 'ocupado', 'mantenimiento', 'reservado']
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Estado del espacio actualizado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Espacio no encontrado' }
 */
router.put("/espacios/:id/estado", cambiarEstadoEspacioController);

/**
 * @route GET /espacios/disponibles
 * @summary Obtener espacios disponibles
 * @tags Espacios - Gestión de espacios
 * #swagger.parameters['tipo'] = {
 *   in: 'query',
 *   description: 'Tipo de espacio',
 *   type: 'string',
 *   enum: ['oficina', 'sala_reunion', 'escritorio_flexible', 'otro']
 * }
 * #swagger.parameters['fecha'] = {
 *   in: 'query',
 *   description: 'Fecha (YYYY-MM-DD)',
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['horaInicio'] = {
 *   in: 'query',
 *   description: 'Hora de inicio (HH:MM)',
 *   type: 'string'
 * }
 * #swagger.parameters['horaFin'] = {
 *   in: 'query',
 *   description: 'Hora de fin (HH:MM)',
 *   type: 'string'
 * }
 * #swagger.parameters['edificioId'] = {
 *   in: 'query',
 *   description: 'ID del edificio',
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Espacios disponibles encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Espacio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/espacios/disponibles", getEspaciosDisponiblesController);

/**
 * @route GET /espacios/filtrar
 * @summary Filtrar espacios por criterios
 * @tags Espacios - Gestión de espacios
 * #swagger.parameters['tipo'] = {
 *   in: 'query',
 *   description: 'Tipo de espacio',
 *   type: 'string',
 *   enum: ['oficina', 'sala_reunion', 'escritorio_flexible', 'otro']
 * }
 * #swagger.parameters['edificioId'] = {
 *   in: 'query',
 *   description: 'ID del edificio',
 *   type: 'string'
 * }
 * #swagger.parameters['piso'] = {
 *   in: 'query',
 *   description: 'Piso',
 *   type: 'integer'
 * }
 * #swagger.parameters['capacidadMinima'] = {
 *   in: 'query',
 *   description: 'Capacidad mínima',
 *   type: 'integer',
 *   minimum: 1
 * }
 * #swagger.parameters['precioMaximo'] = {
 *   in: 'query',
 *   description: 'Precio máximo',
 *   type: 'number',
 *   minimum: 0
 * }
 * #swagger.parameters['estado'] = {
 *   in: 'query',
 *   description: 'Estado',
 *   type: 'string',
 *   enum: ['disponible', 'ocupado', 'mantenimiento', 'reservado']
 * }
 * #swagger.parameters['amenidades'] = {
 *   in: 'query',
 *   description: 'Amenidades (separadas por comas)',
 *   type: 'string'
 * }
 * #swagger.parameters['diaDisponible'] = {
 *   in: 'query',
 *   description: 'Día disponible',
 *   type: 'string',
 *   enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Espacios filtrados encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Espacio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/espacios/filtrar", filtrarEspaciosController);

/**
 * @route GET /espacios/amenidades
 * @summary Obtener espacios por amenidades
 * @tags Espacios - Gestión de espacios
 * #swagger.parameters['amenidades'] = {
 *   in: 'query',
 *   description: 'Amenidades (separadas por comas)',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Espacios encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Espacio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/espacios/amenidades", getEspaciosByAmenidadesController);

module.exports = router;