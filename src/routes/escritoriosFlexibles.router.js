const express = require("express");
const router = express.Router();
const {
  getEscritoriosFlexiblesController,
  getEscritorioFlexibleByIdController,
  getEscritorioFlexibleByCodigoController,
  getEscritoriosByEdificioController,
  getEscritoriosByTipoController,
  getEscritoriosByZonaController,
  getEscritoriosByAmenidadesController,
  getEscritoriosByPropietarioController,
  getEscritoriosByRangoPrecioController,
  createEscritorioFlexibleController,
  updateEscritorioFlexibleController,
  deleteEscritorioFlexibleController,
  cambiarEstadoEscritorioController,
  agregarAmenidadController,
  eliminarAmenidadController,
  actualizarPreciosController,
  getEscritoriosDisponiblesController,
  filtrarEscritoriosFlexiblesController
} = require("../controllers/escritorioFlexible.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createEscritorioFlexibleSchema,
  updateEscritorioFlexibleSchema
} = require("./validations/escritorioFlexible.validation");

/**
 * @route GET /escritorios-flexibles
 * @summary Obtener todos los escritorios flexibles
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
 * #swagger.responses[200] = { 
 *   description: 'Lista de escritorios flexibles obtenida exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/EscritorioFlexible' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/escritorios-flexibles", getEscritoriosFlexiblesController);

/**
 * @route GET /escritorios-flexibles/{id}
 * @summary Obtener escritorio flexible por ID
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del escritorio flexible',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Escritorio flexible encontrado',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/EscritorioFlexible' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Escritorio flexible no encontrado' }
 */
router.get("/escritorios-flexibles/:id", getEscritorioFlexibleByIdController);

/**
 * @route GET /escritorios-flexibles/codigo/{codigo}
 * @summary Obtener escritorio flexible por código
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
 * #swagger.parameters['codigo'] = {
 *   in: 'path',
 *   description: 'Código del escritorio flexible',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Escritorio flexible encontrado',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/EscritorioFlexible' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Escritorio flexible no encontrado' }
 */
router.get("/escritorios-flexibles/codigo/:codigo", getEscritorioFlexibleByCodigoController);

/**
 * @route POST /escritorios-flexibles
 * @summary Crear nuevo escritorio flexible
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/createEscritorioFlexibleSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { 
 *   description: 'Escritorio flexible creado exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/EscritorioFlexible' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/escritorios-flexibles",
  payloadMiddleware(createEscritorioFlexibleSchema),
  createEscritorioFlexibleController
);

/**
 * @route PUT /escritorios-flexibles/{id}
 * @summary Actualizar escritorio flexible
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del escritorio flexible',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/updateEscritorioFlexibleSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'Escritorio flexible actualizado exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/EscritorioFlexible' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Escritorio flexible no encontrado' }
 */
router.put(
  "/escritorios-flexibles/:id",
  payloadMiddleware(updateEscritorioFlexibleSchema),
  updateEscritorioFlexibleController
);

/**
 * @route DELETE /escritorios-flexibles/{id}
 * @summary Eliminar escritorio flexible
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del escritorio flexible',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Escritorio flexible eliminado exitosamente' }
 * #swagger.responses[404] = { description: 'Escritorio flexible no encontrado' }
 */
router.delete("/escritorios-flexibles/:id", deleteEscritorioFlexibleController);

/**
 * @route GET /escritorios-flexibles/edificio/{edificioId}
 * @summary Obtener escritorios flexibles por edificio
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
 * #swagger.parameters['edificioId'] = {
 *   in: 'path',
 *   description: 'ID del edificio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Escritorios flexibles encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/EscritorioFlexible' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/escritorios-flexibles/edificio/:edificioId", getEscritoriosByEdificioController);

/**
 * @route GET /escritorios-flexibles/tipo/{tipo}
 * @summary Obtener escritorios flexibles por tipo
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
 * #swagger.parameters['tipo'] = {
 *   in: 'path',
 *   description: 'Tipo de escritorio flexible',
 *   required: true,
 *   type: 'string',
 *   enum: ['individual', 'compartido', 'standing']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Escritorios flexibles encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/EscritorioFlexible' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/escritorios-flexibles/tipo/:tipo", getEscritoriosByTipoController);

/**
 * @route GET /escritorios-flexibles/zona
 * @summary Obtener escritorios flexibles por zona
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
 * #swagger.parameters['edificioId'] = {
 *   in: 'query',
 *   description: 'ID del edificio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.parameters['piso'] = {
 *   in: 'query',
 *   description: 'Piso',
 *   required: true,
 *   type: 'integer'
 * }
 * #swagger.parameters['zona'] = {
 *   in: 'query',
 *   description: 'Zona',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Escritorios flexibles encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/EscritorioFlexible' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/escritorios-flexibles/zona", getEscritoriosByZonaController);

/**
 * @route GET /escritorios-flexibles/amenidades/{tipoAmenidad}
 * @summary Obtener escritorios flexibles por amenidades
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
 * #swagger.parameters['tipoAmenidad'] = {
 *   in: 'path',
 *   description: 'Tipo de amenidad',
 *   required: true,
 *   type: 'string',
 *   enum: ['monitor', 'teclado', 'mouse', 'reposapiés', 'lampara', 'otro']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Escritorios flexibles encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/EscritorioFlexible' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/escritorios-flexibles/amenidades/:tipoAmenidad", getEscritoriosByAmenidadesController);

/**
 * @route GET /escritorios-flexibles/propietario/{propietarioId}
 * @summary Obtener escritorios flexibles por propietario
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
 * #swagger.parameters['propietarioId'] = {
 *   in: 'path',
 *   description: 'ID del propietario',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Escritorios flexibles encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/EscritorioFlexible' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/escritorios-flexibles/propietario/:propietarioId", getEscritoriosByPropietarioController);

/**
 * @route GET /escritorios-flexibles/precio
 * @summary Obtener escritorios flexibles por rango de precio
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
 * #swagger.parameters['precioMinimo'] = {
 *   in: 'query',
 *   description: 'Precio mínimo',
 *   type: 'number'
 * }
 * #swagger.parameters['precioMaximo'] = {
 *   in: 'query',
 *   description: 'Precio máximo',
 *   type: 'number'
 * }
 * #swagger.parameters['tipoPrecio'] = {
 *   in: 'query',
 *   description: 'Tipo de precio',
 *   type: 'string',
 *   enum: ['porHora', 'porDia', 'porSemana', 'porMes'],
 *   default: 'porDia'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Escritorios flexibles encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/EscritorioFlexible' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/escritorios-flexibles/precio", getEscritoriosByRangoPrecioController);

/**
 * @route PUT /escritorios-flexibles/{id}/estado
 * @summary Cambiar estado de escritorio flexible
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del escritorio flexible',
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
 * #swagger.responses[200] = { description: 'Estado del escritorio flexible actualizado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Escritorio flexible no encontrado' }
 */
router.put("/escritorios-flexibles/:id/estado", cambiarEstadoEscritorioController);

/**
 * @route POST /escritorios-flexibles/{id}/amenidad
 * @summary Agregar amenidad a escritorio flexible
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del escritorio flexible',
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
 *             enum: ['monitor', 'teclado', 'mouse', 'reposapiés', 'lampara', 'otro']
 *           },
 *           descripcion: { type: 'string' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Amenidad agregada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Escritorio flexible no encontrado' }
 */
router.post("/escritorios-flexibles/:id/amenidad", agregarAmenidadController);

/**
 * @route DELETE /escritorios-flexibles/{id}/amenidad/{amenidadId}
 * @summary Eliminar amenidad de escritorio flexible
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del escritorio flexible',
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
 * #swagger.responses[404] = { description: 'Escritorio flexible o amenidad no encontrados' }
 */
router.delete("/escritorios-flexibles/:id/amenidad/:amenidadId", eliminarAmenidadController);

/**
 * @route PUT /escritorios-flexibles/{id}/precios
 * @summary Actualizar precios de escritorio flexible
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del escritorio flexible',
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
 *           porDia: { type: 'number', minimum: 0 },
 *           porSemana: { type: 'number', minimum: 0 },
 *           porMes: { type: 'number', minimum: 0 }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Precios actualizados exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Escritorio flexible no encontrado' }
 */
router.put("/escritorios-flexibles/:id/precios", actualizarPreciosController);

/**
 * @route GET /escritorios-flexibles/disponibles
 * @summary Obtener escritorios flexibles disponibles
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
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
 *   description: 'Escritorios flexibles disponibles encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/EscritorioFlexible' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/escritorios-flexibles/disponibles", getEscritoriosDisponiblesController);

/**
 * @route GET /escritorios-flexibles/filtrar
 * @summary Filtrar escritorios flexibles por criterios
 * @tags Escritorios Flexibles - Gestión de escritorios flexibles
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
 * #swagger.parameters['zona'] = {
 *   in: 'query',
 *   description: 'Zona',
 *   type: 'string'
 * }
 * #swagger.parameters['tipo'] = {
 *   in: 'query',
 *   description: 'Tipo de escritorio',
 *   type: 'string',
 *   enum: ['individual', 'compartido', 'standing']
 * }
 * #swagger.parameters['amenidades'] = {
 *   in: 'query',
 *   description: 'Amenidades (separadas por comas)',
 *   type: 'string'
 * }
 * #swagger.parameters['precioMaximoPorDia'] = {
 *   in: 'query',
 *   description: 'Precio máximo por día',
 *   type: 'number'
 * }
 * #swagger.parameters['estado'] = {
 *   in: 'query',
 *   description: 'Estado',
 *   type: 'string',
 *   enum: ['disponible', 'ocupado', 'mantenimiento', 'reservado']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Escritorios flexibles filtrados encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/EscritorioFlexible' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/escritorios-flexibles/filtrar", filtrarEscritoriosFlexiblesController);

module.exports = router;