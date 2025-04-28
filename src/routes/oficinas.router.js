const express = require("express");
const router = express.Router();
const {
  getOficinasController,
  getOficinaByIdController,
  getOficinaByCodigoController,
  getOficinasByEdificioController,
  getOficinasByTipoController,
  getOficinasByPropietarioController,
  getOficinasByEmpresaController,
  createOficinaController,
  updateOficinaController,
  deleteOficinaController,
  cambiarEstadoOficinaController,
  getOficinasByCapacidadController,
  getOficinasByRangoPrecioController,
  getOficinasDisponiblesController,
  actualizarCalificacionController,
  filtrarOficinasController
} = require("../controllers/oficina.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createOficinaSchema,
  updateOficinaSchema
} = require("../routes/validations/oficina.validation");

/**
 * @route GET /oficinas
 * @summary Obtener todas las oficinas
 * @tags Oficinas - Gestión de oficinas
 * #swagger.responses[200] = { 
 *   description: 'Lista de oficinas obtenida exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Oficina' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/oficinas", getOficinasController);

/**
 * @route GET /oficinas/{id}
 * @summary Obtener oficina por ID
 * @tags Oficinas - Gestión de oficinas
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la oficina',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Oficina encontrada',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Oficina' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Oficina no encontrada' }
 */
router.get("/oficinas/:id", getOficinaByIdController);

/**
 * @route GET /oficinas/codigo/{codigo}
 * @summary Obtener oficina por código
 * @tags Oficinas - Gestión de oficinas
 * #swagger.parameters['codigo'] = {
 *   in: 'path',
 *   description: 'Código de la oficina',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Oficina encontrada',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Oficina' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Oficina no encontrada' }
 */
router.get("/oficinas/codigo/:codigo", getOficinaByCodigoController);

/**
 * @route POST /oficinas
 * @summary Crear nueva oficina
 * @tags Oficinas - Gestión de oficinas
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/createOficinaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { 
 *   description: 'Oficina creada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Oficina' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/oficinas",
  payloadMiddleware(createOficinaSchema),
  createOficinaController
);

/**
 * @route PUT /oficinas/{id}
 * @summary Actualizar oficina
 * @tags Oficinas - Gestión de oficinas
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la oficina',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/updateOficinaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'Oficina actualizada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Oficina' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Oficina no encontrada' }
 */
router.put(
  "/oficinas/:id",
  payloadMiddleware(updateOficinaSchema),
  updateOficinaController
);

/**
 * @route DELETE /oficinas/{id}
 * @summary Eliminar oficina
 * @tags Oficinas - Gestión de oficinas
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la oficina',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Oficina eliminada exitosamente' }
 * #swagger.responses[404] = { description: 'Oficina no encontrada' }
 */
router.delete("/oficinas/:id", deleteOficinaController);

/**
 * @route GET /oficinas/edificio/{edificioId}
 * @summary Obtener oficinas por edificio
 * @tags Oficinas - Gestión de oficinas
 * #swagger.parameters['edificioId'] = {
 *   in: 'path',
 *   description: 'ID del edificio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Oficinas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Oficina' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/oficinas/edificio/:edificioId", getOficinasByEdificioController);

/**
 * @route GET /oficinas/tipo/{tipo}
 * @summary Obtener oficinas por tipo
 * @tags Oficinas - Gestión de oficinas
 * #swagger.parameters['tipo'] = {
 *   in: 'path',
 *   description: 'Tipo de oficina',
 *   required: true,
 *   type: 'string',
 *   enum: ['privada', 'compartida', 'coworking']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Oficinas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Oficina' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/oficinas/tipo/:tipo", getOficinasByTipoController);

/**
 * @route GET /oficinas/propietario/{propietarioId}
 * @summary Obtener oficinas por propietario
 * @tags Oficinas - Gestión de oficinas
 * #swagger.parameters['propietarioId'] = {
 *   in: 'path',
 *   description: 'ID del propietario',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Oficinas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Oficina' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/oficinas/propietario/:propietarioId", getOficinasByPropietarioController);

/**
 * @route GET /oficinas/empresa/{empresaId}
 * @summary Obtener oficinas por empresa
 * @tags Oficinas - Gestión de oficinas
 * #swagger.parameters['empresaId'] = {
 *   in: 'path',
 *   description: 'ID de la empresa',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Oficinas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Oficina' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/oficinas/empresa/:empresaId", getOficinasByEmpresaController);

/**
 * @route PUT /oficinas/{id}/estado
 * @summary Cambiar estado de oficina
 * @tags Oficinas - Gestión de oficinas
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la oficina',
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
 *             enum: ['disponible', 'ocupada', 'mantenimiento', 'reservada']
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Estado de la oficina actualizado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Oficina no encontrada' }
 */
router.put("/oficinas/:id/estado", cambiarEstadoOficinaController);

/**
 * @route GET /oficinas/capacidad
 * @summary Obtener oficinas por capacidad
 * @tags Oficinas - Gestión de oficinas
 * #swagger.parameters['capacidadMinima'] = {
 *   in: 'query',
 *   description: 'Capacidad mínima',
 *   required: true,
 *   type: 'integer',
 *   minimum: 1
 * }
 * #swagger.parameters['capacidadMaxima'] = {
 *   in: 'query',
 *   description: 'Capacidad máxima',
 *   type: 'integer',
 *   minimum: 1
 * }
 * #swagger.responses[200] = { 
 *   description: 'Oficinas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Oficina' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/oficinas/capacidad", getOficinasByCapacidadController);

/**
 * @route GET /oficinas/precio
 * @summary Obtener oficinas por rango de precio
 * @tags Oficinas - Gestión de oficinas
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
 * #swagger.parameters['tipoPrecio'] = {
 *   in: 'query',
 *   description: 'Tipo de precio',
 *   type: 'string',
 *   enum: ['porHora', 'porDia', 'porMes'],
 *   default: 'porDia'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Oficinas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Oficina' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/oficinas/precio", getOficinasByRangoPrecioController);

/**
 * @route GET /oficinas/disponibles
 * @summary Obtener oficinas disponibles
 * @tags Oficinas - Gestión de oficinas
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
 * #swagger.parameters['capacidadMinima'] = {
 *   in: 'query',
 *   description: 'Capacidad mínima',
 *   type: 'integer',
 *   minimum: 1
 * }
 * #swagger.responses[200] = { 
 *   description: 'Oficinas disponibles encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Oficina' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/oficinas/disponibles", getOficinasDisponiblesController);

/**
 * @route PUT /oficinas/{id}/calificacion
 * @summary Actualizar calificación de oficina
 * @tags Oficinas - Gestión de oficinas
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la oficina',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['calificacion'],
 *         properties: {
 *           calificacion: { 
 *             type: 'number',
 *             minimum: 1,
 *             maximum: 5 
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Calificación actualizada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Oficina no encontrada' }
 */
router.put("/oficinas/:id/calificacion", actualizarCalificacionController);

/**
 * @route GET /oficinas/filtrar
 * @summary Filtrar oficinas por criterios
 * @tags Oficinas - Gestión de oficinas
 * #swagger.parameters['edificioId'] = {
 *   in: 'query',
 *   description: 'ID del edificio',
 *   type: 'string'
 * }
 * #swagger.parameters['tipo'] = {
 *   in: 'query',
 *   description: 'Tipo de oficina',
 *   type: 'string',
 *   enum: ['privada', 'compartida', 'coworking']
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
 *   enum: ['disponible', 'ocupada', 'mantenimiento', 'reservada']
 * }
 * #swagger.parameters['fechaDisponibilidad'] = {
 *   in: 'query',
 *   description: 'Fecha de disponibilidad (YYYY-MM-DD)',
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['amenidades'] = {
 *   in: 'query',
 *   description: 'Amenidades (separadas por comas)',
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Oficinas filtradas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Oficina' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/oficinas/filtrar", filtrarOficinasController);

module.exports = router;