const express = require("express");
const router = express.Router();
const {
  getSalasReunionController,
  getSalaReunionByIdController,
  getSalaReunionByCodigoController,
  getSalasByEdificioController,
  getSalasByCapacidadController,
  getSalasByConfiguracionController,
  getSalasByEquipamientoController,
  getSalasByPropietarioController,
  getSalasByRangoPrecioController,
  createSalaReunionController,
  updateSalaReunionController,
  deleteSalaReunionController,
  cambiarEstadoSalaController,
  agregarEquipamientoController,
  eliminarEquipamientoController,
  actualizarPreciosController,
  getSalasDisponiblesController,
  filtrarSalasReunionController
} = require("../controllers/SalaReunion.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createSalaReunionSchema,
  updateSalaReunionSchema
} = require("./validations/salaReunion.validation");

/**
 * @route GET /salas-reunion
 * @summary Obtener todas las salas de reunión
 * @tags Salas de Reunión - Gestión de salas de reunión
 * #swagger.responses[200] = { 
 *   description: 'Lista de salas de reunión obtenida exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/SalaReunion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/salas-reunion", getSalasReunionController);

/**
 * @route GET /salas-reunion/{id}
 * @summary Obtener sala de reunión por ID
 * @tags Salas de Reunión - Gestión de salas de reunión
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la sala de reunión',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Sala de reunión encontrada',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/SalaReunion' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Sala de reunión no encontrada' }
 */
router.get("/salas-reunion/:id", getSalaReunionByIdController);

/**
 * @route GET /salas-reunion/codigo/{codigo}
 * @summary Obtener sala de reunión por código
 * @tags Salas de Reunión - Gestión de salas de reunión
 * #swagger.parameters['codigo'] = {
 *   in: 'path',
 *   description: 'Código de la sala de reunión',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Sala de reunión encontrada',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/SalaReunion' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Sala de reunión no encontrada' }
 */
router.get("/salas-reunion/codigo/:codigo", getSalaReunionByCodigoController);

/**
 * @route POST /salas-reunion
 * @summary Crear nueva sala de reunión
 * @tags Salas de Reunión - Gestión de salas de reunión
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/createSalaReunionSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { 
 *   description: 'Sala de reunión creada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/SalaReunion' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/salas-reunion",
  payloadMiddleware(createSalaReunionSchema),
  createSalaReunionController
);

/**
 * @route PUT /salas-reunion/{id}
 * @summary Actualizar sala de reunión
 * @tags Salas de Reunión - Gestión de salas de reunión
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la sala de reunión',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/updateSalaReunionSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'Sala de reunión actualizada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/SalaReunion' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Sala de reunión no encontrada' }
 */
router.put(
  "/salas-reunion/:id",
  payloadMiddleware(updateSalaReunionSchema),
  updateSalaReunionController
);

/**
 * @route DELETE /salas-reunion/{id}
 * @summary Eliminar sala de reunión
 * @tags Salas de Reunión - Gestión de salas de reunión
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la sala de reunión',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Sala de reunión eliminada exitosamente' }
 * #swagger.responses[404] = { description: 'Sala de reunión no encontrada' }
 */
router.delete("/salas-reunion/:id", deleteSalaReunionController);

/**
 * @route GET /salas-reunion/edificio/{edificioId}
 * @summary Obtener salas de reunión por edificio
 * @tags Salas de Reunión - Gestión de salas de reunión
 * #swagger.parameters['edificioId'] = {
 *   in: 'path',
 *   description: 'ID del edificio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Salas de reunión encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/SalaReunion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/salas-reunion/edificio/:edificioId", getSalasByEdificioController);

/**
 * @route GET /salas-reunion/capacidad
 * @summary Obtener salas de reunión por capacidad
 * @tags Salas de Reunión - Gestión de salas de reunión
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
 *   description: 'Salas de reunión encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/SalaReunion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/salas-reunion/capacidad", getSalasByCapacidadController);

/**
 * @route GET /salas-reunion/configuracion/{configuracion}
 * @summary Obtener salas de reunión por configuración
 * @tags Salas de Reunión - Gestión de salas de reunión
 * #swagger.parameters['configuracion'] = {
 *   in: 'path',
 *   description: 'Configuración de la sala',
 *   required: true,
 *   type: 'string',
 *   enum: ['mesa_redonda', 'auditorio', 'en_u', 'aula', 'flexible']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Salas de reunión encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/SalaReunion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/salas-reunion/configuracion/:configuracion", getSalasByConfiguracionController);

/**
 * @route GET /salas-reunion/equipamiento/{tipoEquipamiento}
 * @summary Obtener salas de reunión por tipo de equipamiento
 * @tags Salas de Reunión - Gestión de salas de reunión
 * #swagger.parameters['tipoEquipamiento'] = {
 *   in: 'path',
 *   description: 'Tipo de equipamiento',
 *   required: true,
 *   type: 'string',
 *   enum: ['proyector', 'videoconferencia', 'pizarra', 'tv', 'otro']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Salas de reunión encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/SalaReunion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/salas-reunion/equipamiento/:tipoEquipamiento", getSalasByEquipamientoController);

/**
 * @route GET /salas-reunion/propietario/{propietarioId}
 * @summary Obtener salas de reunión por propietario
 * @tags Salas de Reunión - Gestión de salas de reunión
 * #swagger.parameters['propietarioId'] = {
 *   in: 'path',
 *   description: 'ID del propietario',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Salas de reunión encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/SalaReunion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/salas-reunion/propietario/:propietarioId", getSalasByPropietarioController);

/**
 * @route GET /salas-reunion/precio
 * @summary Obtener salas de reunión por rango de precio
 * @tags Salas de Reunión - Gestión de salas de reunión
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
 *   enum: ['porHora', 'mediaDia', 'diaDompleto'],
 *   default: 'porHora'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Salas de reunión encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/SalaReunion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/salas-reunion/precio", getSalasByRangoPrecioController);

/**
 * @route PUT /salas-reunion/{id}/estado
 * @summary Cambiar estado de sala de reunión
 * @tags Salas de Reunión - Gestión de salas de reunión
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la sala de reunión',
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
 * #swagger.responses[200] = { description: 'Estado de la sala de reunión actualizado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Sala de reunión no encontrada' }
 */
router.put("/salas-reunion/:id/estado", cambiarEstadoSalaController);

/**
 * @route POST /salas-reunion/{id}/equipamiento
 * @summary Agregar equipamiento a sala de reunión
 * @tags Salas de Reunión - Gestión de salas de reunión
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la sala de reunión',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['tipo', 'descripcion'],
 *         properties: {
 *           tipo: { 
 *             type: 'string',
 *             enum: ['proyector', 'videoconferencia', 'pizarra', 'tv', 'otro']
 *           },
 *           descripcion: { type: 'string' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Equipamiento agregado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Sala de reunión no encontrada' }
 */
router.post("/salas-reunion/:id/equipamiento", agregarEquipamientoController);

/**
 * @route DELETE /salas-reunion/{id}/equipamiento/{equipamientoId}
 * @summary Eliminar equipamiento de sala de reunión
 * @tags Salas de Reunión - Gestión de salas de reunión
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la sala de reunión',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.parameters['equipamientoId'] = {
 *   in: 'path',
 *   description: 'ID del equipamiento',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Equipamiento eliminado exitosamente' }
 * #swagger.responses[404] = { description: 'Sala de reunión o equipamiento no encontrados' }
 */
router.delete("/salas-reunion/:id/equipamiento/:equipamientoId", eliminarEquipamientoController);

/**
 * @route PUT /salas-reunion/{id}/precios
 * @summary Actualizar precios de sala de reunión
 * @tags Salas de Reunión - Gestión de salas de reunión
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la sala de reunión',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         properties: {
 *           porHora: { type: 'number', minimum: 0 },
 *           mediaDia: { type: 'number', minimum: 0 },
 *           diaDompleto: { type: 'number', minimum: 0 }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Precios actualizados exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Sala de reunión no encontrada' }
 */
router.put("/salas-reunion/:id/precios", actualizarPreciosController);

/**
 * @route GET /salas-reunion/disponibles
 * @summary Obtener salas de reunión disponibles
 * @tags Salas de Reunión - Gestión de salas de reunión
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
 *   description: 'Salas de reunión disponibles encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/SalaReunion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/salas-reunion/disponibles", getSalasDisponiblesController);

/**
 * @route GET /salas-reunion/filtrar
 * @summary Filtrar salas de reunión por criterios
 * @tags Salas de Reunión - Gestión de salas de reunión
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
 * #swagger.parameters['equipamiento'] = {
 *   in: 'query',
 *   description: 'Equipamiento (separado por comas)',
 *   type: 'string'
 * }
 * #swagger.parameters['configuracion'] = {
 *   in: 'query',
 *   description: 'Configuración',
 *   type: 'string',
 *   enum: ['mesa_redonda', 'auditorio', 'en_u', 'aula', 'flexible']
 * }
 * #swagger.parameters['precioMaximoPorHora'] = {
 *   in: 'query',
 *   description: 'Precio máximo por hora',
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
 * #swagger.responses[200] = { 
 *   description: 'Salas de reunión filtradas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/SalaReunion' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/salas-reunion/filtrar", filtrarSalasReunionController);

module.exports = router;