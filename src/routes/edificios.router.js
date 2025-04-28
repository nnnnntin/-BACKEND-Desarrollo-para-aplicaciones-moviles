const express = require("express");
const router = express.Router();
const {
  getEdificiosController,
  getEdificioByIdController,
  getEdificiosByPropietarioController,
  getEdificiosByEmpresaController,
  getEdificiosByCiudadController,
  getEdificiosByPaisController,
  getEdificiosConAmenidadController,
  createEdificioController,
  updateEdificioController,
  deleteEdificioController,
  activarEdificioController,
  actualizarCalificacionController,
  agregarAmenidadController,
  eliminarAmenidadController,
  actualizarHorarioController,
  buscarEdificiosCercanosController,
  filtrarEdificiosController
} = require("../controllers/edificio.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createEdificioSchema,
  updateEdificioSchema
} = require("./validations/edificio.validation");

/**
 * @route GET /edificios
 * @summary Obtener todos los edificios
 * @tags Edificios - Gestión de edificios
 * #swagger.responses[200] = { 
 *   description: 'Lista de edificios obtenida exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Edificio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/edificios", getEdificiosController);

/**
 * @route GET /edificios/{id}
 * @summary Obtener edificio por ID
 * @tags Edificios - Gestión de edificios
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del edificio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Edificio encontrado',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Edificio' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Edificio no encontrado' }
 */
router.get("/edificios/:id", getEdificioByIdController);

/**
 * @route POST /edificios
 * @summary Crear nuevo edificio
 * @tags Edificios - Gestión de edificios
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/createEdificioSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { 
 *   description: 'Edificio creado exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Edificio' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/edificios",
  payloadMiddleware(createEdificioSchema),
  createEdificioController
);

/**
 * @route PUT /edificios/{id}
 * @summary Actualizar edificio
 * @tags Edificios - Gestión de edificios
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del edificio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/updateEdificioSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'Edificio actualizado exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Edificio' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Edificio no encontrado' }
 */
router.put(
  "/edificios/:id",
  payloadMiddleware(updateEdificioSchema),
  updateEdificioController
);

/**
 * @route DELETE /edificios/{id}
 * @summary Eliminar edificio
 * @tags Edificios - Gestión de edificios
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del edificio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Edificio eliminado exitosamente' }
 * #swagger.responses[404] = { description: 'Edificio no encontrado' }
 */
router.delete("/edificios/:id", deleteEdificioController);

/**
 * @route GET /edificios/propietario/{propietarioId}
 * @summary Obtener edificios por propietario
 * @tags Edificios - Gestión de edificios
 * #swagger.parameters['propietarioId'] = {
 *   in: 'path',
 *   description: 'ID del propietario',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Edificios encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Edificio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/edificios/propietario/:propietarioId", getEdificiosByPropietarioController);

/**
 * @route GET /edificios/empresa/{empresaId}
 * @summary Obtener edificios por empresa
 * @tags Edificios - Gestión de edificios
 * #swagger.parameters['empresaId'] = {
 *   in: 'path',
 *   description: 'ID de la empresa inmobiliaria',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Edificios encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Edificio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/edificios/empresa/:empresaId", getEdificiosByEmpresaController);

/**
 * @route GET /edificios/ciudad/{ciudad}
 * @summary Obtener edificios por ciudad
 * @tags Edificios - Gestión de edificios
 * #swagger.parameters['ciudad'] = {
 *   in: 'path',
 *   description: 'Nombre de la ciudad',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Edificios encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Edificio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/edificios/ciudad/:ciudad", getEdificiosByCiudadController);

/**
 * @route GET /edificios/pais/{pais}
 * @summary Obtener edificios por país
 * @tags Edificios - Gestión de edificios
 * #swagger.parameters['pais'] = {
 *   in: 'path',
 *   description: 'Nombre del país',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Edificios encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Edificio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/edificios/pais/:pais", getEdificiosByPaisController);

/**
 * @route GET /edificios/amenidad/{tipoAmenidad}
 * @summary Obtener edificios con amenidad específica
 * @tags Edificios - Gestión de edificios
 * #swagger.parameters['tipoAmenidad'] = {
 *   in: 'path',
 *   description: 'Tipo de amenidad',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Edificios encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Edificio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/edificios/amenidad/:tipoAmenidad", getEdificiosConAmenidadController);

/**
 * @route PUT /edificios/{id}/activar
 * @summary Activar o desactivar edificio
 * @tags Edificios - Gestión de edificios
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del edificio',
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
 * #swagger.responses[200] = { description: 'Estado del edificio actualizado exitosamente' }
 * #swagger.responses[404] = { description: 'Edificio no encontrado' }
 */
router.put("/edificios/:id/activar", activarEdificioController);

/**
 * @route PUT /edificios/{id}/calificacion
 * @summary Actualizar calificación de edificio
 * @tags Edificios - Gestión de edificios
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del edificio',
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
 * #swagger.responses[404] = { description: 'Edificio no encontrado' }
 */
router.put("/edificios/:id/calificacion", actualizarCalificacionController);

/**
 * @route POST /edificios/{id}/amenidad
 * @summary Agregar amenidad a edificio
 * @tags Edificios - Gestión de edificios
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del edificio',
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
 *           tipo: { type: 'string' },
 *           descripcion: { type: 'string' },
 *           horario: { type: 'string' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Amenidad agregada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Edificio no encontrado' }
 */
router.post("/edificios/:id/amenidad", agregarAmenidadController);

/**
 * @route DELETE /edificios/{id}/amenidad/{amenidadId}
 * @summary Eliminar amenidad de edificio
 * @tags Edificios - Gestión de edificios
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del edificio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.parameters['amenidadId'] = {
 *   in: 'path',
 *   description: 'ID de la amenidad',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Amenidad eliminada exitosamente' }
 * #swagger.responses[404] = { description: 'Edificio o amenidad no encontrados' }
 */
router.delete("/edificios/:id/amenidad/:amenidadId", eliminarAmenidadController);

/**
 * @route PUT /edificios/{id}/horario
 * @summary Actualizar horario de edificio
 * @tags Edificios - Gestión de edificios
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del edificio',
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
 *           apertura: { 
 *             type: 'string', 
 *             pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' 
 *           },
 *           cierre: { 
 *             type: 'string', 
 *             pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' 
 *           },
 *           diasOperacion: {
 *             type: 'array',
 *             items: {
 *               type: 'string',
 *               enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Horario actualizado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Edificio no encontrado' }
 */
router.put("/edificios/:id/horario", actualizarHorarioController);

/**
 * @route GET /edificios/cercanos
 * @summary Buscar edificios cercanos
 * @tags Edificios - Gestión de edificios
 * #swagger.parameters['lat'] = {
 *   in: 'query',
 *   description: 'Latitud',
 *   required: true,
 *   type: 'number'
 * }
 * #swagger.parameters['lng'] = {
 *   in: 'query',
 *   description: 'Longitud',
 *   required: true,
 *   type: 'number'
 * }
 * #swagger.parameters['distanciaMaxima'] = {
 *   in: 'query',
 *   description: 'Distancia máxima en km',
 *   type: 'number',
 *   default: 5
 * }
 * #swagger.responses[200] = { 
 *   description: 'Edificios cercanos encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Edificio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/edificios/cercanos", buscarEdificiosCercanosController);

/**
 * @route GET /edificios/filtrar
 * @summary Filtrar edificios por criterios
 * @tags Edificios - Gestión de edificios
 * #swagger.parameters['ciudad'] = {
 *   in: 'query',
 *   description: 'Ciudad',
 *   type: 'string'
 * }
 * #swagger.parameters['pais'] = {
 *   in: 'query',
 *   description: 'País',
 *   type: 'string'
 * }
 * #swagger.parameters['propietarioId'] = {
 *   in: 'query',
 *   description: 'ID del propietario',
 *   type: 'string'
 * }
 * #swagger.parameters['empresaInmobiliariaId'] = {
 *   in: 'query',
 *   description: 'ID de la empresa inmobiliaria',
 *   type: 'string'
 * }
 * #swagger.parameters['amenidades'] = {
 *   in: 'query',
 *   description: 'Amenidades (separadas por comas)',
 *   type: 'string'
 * }
 * #swagger.parameters['accesibilidad'] = {
 *   in: 'query',
 *   description: 'Accesibilidad',
 *   type: 'boolean'
 * }
 * #swagger.parameters['estacionamiento'] = {
 *   in: 'query',
 *   description: 'Estacionamiento',
 *   type: 'boolean'
 * }
 * #swagger.parameters['activo'] = {
 *   in: 'query',
 *   description: 'Activo',
 *   type: 'boolean'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Edificios filtrados encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Edificio' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/edificios/filtrar", filtrarEdificiosController);

module.exports = router;