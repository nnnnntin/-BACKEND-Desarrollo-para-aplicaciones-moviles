const express = require("express");
const router = express.Router();
const {
  getDisponibilidadesController,
  getDisponibilidadByIdController,
  getDisponibilidadByEntidadController,
  getDisponibilidadByFechaController,
  getDisponibilidadEnRangoController,
  createDisponibilidadController,
  updateDisponibilidadController,
  deleteDisponibilidadController,
  getFranjasDisponiblesController,
  reservarFranjaController,
  liberarFranjaController,
  bloquearFranjaController,
  desbloquearFranjaController,
  crearDisponibilidadDiariaController,
  consultarDisponibilidadController
} = require("../controllers/disponibilidad.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createDisponibilidadSchema,
  updateDisponibilidadSchema,
  bloquearFranjaHorariaSchema
} = require("../routes/validations/disponibilidad.validation");

/**
 * @route GET /disponibilidades
 * @summary Obtener todas las disponibilidades
 * @tags Disponibilidades - Gestión de disponibilidad de espacios
 * #swagger.responses[200] = { 
 *   description: 'Lista de disponibilidades obtenida exitosamente'
 * }
 */
router.get("/disponibilidades", getDisponibilidadesController);

/**
 * @route GET /disponibilidades/{id}
 * @summary Obtener disponibilidad por ID
 * @tags Disponibilidades - Gestión de disponibilidad de espacios
 * #swagger.parameters['id'] = { 
 *   in: 'path',
 *   description: 'ID de la disponibilidad',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Disponibilidad encontrada' }
 * #swagger.responses[404] = { description: 'Disponibilidad no encontrada' }
 */
router.get("/disponibilidades/:id", getDisponibilidadByIdController);

/**
 * @route POST /disponibilidades
 * @summary Crear nueva disponibilidad
 * @tags Disponibilidades - Gestión de disponibilidad de espacios
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/createDisponibilidadSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { description: 'Disponibilidad creada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos de entrada inválidos' }
 */
router.post(
  "/disponibilidades",
  payloadMiddleware(createDisponibilidadSchema),
  createDisponibilidadController
);

/**
 * @route PUT /disponibilidades/{id}
 * @summary Actualizar disponibilidad existente
 * @tags Disponibilidades - Gestión de disponibilidad de espacios
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la disponibilidad a actualizar',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/updateDisponibilidadSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Disponibilidad actualizada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos de entrada inválidos' }
 * #swagger.responses[404] = { description: 'Disponibilidad no encontrada' }
 */
router.put(
  "/disponibilidades/:id",
  payloadMiddleware(updateDisponibilidadSchema),
  updateDisponibilidadController
);

/**
 * @route DELETE /disponibilidades/{id}
 * @summary Eliminar disponibilidad
 * @tags Disponibilidades - Gestión de disponibilidad de espacios
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la disponibilidad a eliminar',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Disponibilidad eliminada exitosamente' }
 * #swagger.responses[404] = { description: 'Disponibilidad no encontrada' }
 */
router.delete("/disponibilidades/:id", deleteDisponibilidadController);

/**
 * @route GET /disponibilidades/entidad/{entidadId}/{tipoEntidad}
 * @summary Obtener disponibilidades por entidad
 * @tags Disponibilidades - Gestión de disponibilidad de espacios
 * #swagger.parameters['entidadId'] = {
 *   in: 'path',
 *   description: 'ID de la entidad',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.parameters['tipoEntidad'] = {
 *   in: 'path',
 *   description: 'Tipo de entidad (oficina, sala_reunion, escritorio_flexible)',
 *   required: true,
 *   type: 'string',
 *   enum: ['oficina', 'sala_reunion', 'escritorio_flexible']
 * }
 * #swagger.responses[200] = { description: 'Disponibilidades encontradas' }
 */
router.get("/disponibilidades/entidad/:entidadId/:tipoEntidad", getDisponibilidadByEntidadController);

/**
 * @route GET /disponibilidades/fecha
 * @summary Obtener disponibilidades por fecha
 * @tags Disponibilidades - Gestión de disponibilidad de espacios
 * #swagger.parameters['fecha'] = {
 *   in: 'query',
 *   description: 'Fecha en formato YYYY-MM-DD',
 *   required: true,
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.responses[200] = { description: 'Disponibilidades encontradas' }
 */
router.get("/disponibilidades/fecha", getDisponibilidadByFechaController);

/**
 * @route GET /disponibilidades/rango
 * @summary Obtener disponibilidades en un rango de fechas
 * @tags Disponibilidades - Gestión de disponibilidad de espacios
 * #swagger.parameters['fechaInicio'] = {
 *   in: 'query',
 *   description: 'Fecha de inicio en formato YYYY-MM-DD',
 *   required: true,
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['fechaFin'] = {
 *   in: 'query',
 *   description: 'Fecha de fin en formato YYYY-MM-DD',
 *   required: true,
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.responses[200] = { description: 'Disponibilidades encontradas' }
 */
router.get("/disponibilidades/rango", getDisponibilidadEnRangoController);

/**
 * @route GET /disponibilidades/franjas
 * @summary Obtener franjas disponibles
 * @tags Disponibilidades - Gestión de disponibilidad de espacios
 * #swagger.parameters['entidadId'] = {
 *   in: 'query',
 *   description: 'ID de la entidad',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.parameters['tipoEntidad'] = {
 *   in: 'query',
 *   description: 'Tipo de entidad',
 *   required: true,
 *   type: 'string',
 *   enum: ['oficina', 'sala_reunion', 'escritorio_flexible']
 * }
 * #swagger.parameters['fecha'] = {
 *   in: 'query',
 *   description: 'Fecha en formato YYYY-MM-DD',
 *   required: true,
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.responses[200] = { description: 'Franjas disponibles encontradas' }
 */
router.get("/disponibilidades/franjas", getFranjasDisponiblesController);

/**
 * @route POST /disponibilidades/reservar
 * @summary Reservar franja horaria
 * @tags Disponibilidades - Gestión de disponibilidad de espacios
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['entidadId', 'tipoEntidad', 'fecha', 'horaInicio', 'horaFin', 'reservaId'],
 *         properties: {
 *           entidadId: { type: 'string' },
 *           tipoEntidad: { type: 'string', enum: ['oficina', 'sala_reunion', 'escritorio_flexible'] },
 *           fecha: { type: 'string', format: 'date' },
 *           horaInicio: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
 *           horaFin: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
 *           reservaId: { type: 'string' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Franja reservada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos o franja no disponible' }
 */
router.post("/disponibilidades/reservar", reservarFranjaController);

/**
 * @route POST /disponibilidades/liberar
 * @summary Liberar franja horaria reservada
 * @tags Disponibilidades - Gestión de disponibilidad de espacios
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['entidadId', 'tipoEntidad', 'fecha', 'horaInicio', 'horaFin', 'reservaId'],
 *         properties: {
 *           entidadId: { type: 'string' },
 *           tipoEntidad: { type: 'string', enum: ['oficina', 'sala_reunion', 'escritorio_flexible'] },
 *           fecha: { type: 'string', format: 'date' },
 *           horaInicio: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
 *           horaFin: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
 *           reservaId: { type: 'string' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Franja liberada exitosamente' }
 * #swagger.responses[404] = { description: 'Franja no encontrada' }
 */
router.post("/disponibilidades/liberar", liberarFranjaController);

/**
 * @route POST /disponibilidades/bloquear
 * @summary Bloquear franja horaria
 * @tags Disponibilidades - Gestión de disponibilidad de espacios
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/bloquearFranjaHorariaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Franja bloqueada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/disponibilidades/bloquear",
  payloadMiddleware(bloquearFranjaHorariaSchema),
  bloquearFranjaController
);

/**
 * @route POST /disponibilidades/desbloquear
 * @summary Desbloquear franja horaria
 * @tags Disponibilidades - Gestión de disponibilidad de espacios
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['entidadId', 'tipoEntidad', 'fecha', 'horaInicio', 'horaFin'],
 *         properties: {
 *           entidadId: { type: 'string' },
 *           tipoEntidad: { type: 'string', enum: ['oficina', 'sala_reunion', 'escritorio_flexible'] },
 *           fecha: { type: 'string', format: 'date' },
 *           horaInicio: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
 *           horaFin: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Franja desbloqueada exitosamente' }
 * #swagger.responses[404] = { description: 'Franja no encontrada' }
 */
router.post("/disponibilidades/desbloquear", desbloquearFranjaController);

/**
 * @route POST /disponibilidades/crear-diaria
 * @summary Crear disponibilidad diaria
 * @tags Disponibilidades - Gestión de disponibilidad de espacios
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['entidadId', 'tipoEntidad', 'fecha', 'franjas'],
 *         properties: {
 *           entidadId: { type: 'string' },
 *           tipoEntidad: { type: 'string', enum: ['oficina', 'sala_reunion', 'escritorio_flexible'] },
 *           fecha: { type: 'string', format: 'date' },
 *           franjas: {
 *             type: 'array',
 *             items: {
 *               type: 'object',
 *               properties: {
 *                 horaInicio: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
 *                 horaFin: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' }
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { description: 'Disponibilidad diaria creada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post("/disponibilidades/crear-diaria", crearDisponibilidadDiariaController);

/**
 * @route GET /disponibilidades/consultar
 * @summary Consultar disponibilidad
 * @tags Disponibilidades - Gestión de disponibilidad de espacios
 * #swagger.parameters['entidadId'] = {
 *   in: 'query',
 *   description: 'ID de la entidad',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.parameters['tipoEntidad'] = {
 *   in: 'query',
 *   description: 'Tipo de entidad',
 *   required: true,
 *   type: 'string',
 *   enum: ['oficina', 'sala_reunion', 'escritorio_flexible']
 * }
 * #swagger.parameters['fechaInicio'] = {
 *   in: 'query',
 *   description: 'Fecha de inicio en formato YYYY-MM-DD',
 *   required: true,
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['fechaFin'] = {
 *   in: 'query',
 *   description: 'Fecha de fin en formato YYYY-MM-DD',
 *   required: true,
 *   type: 'string',
 *   format: 'date'
 * }
 * #swagger.parameters['horaInicio'] = {
 *   in: 'query',
 *   description: 'Hora de inicio en formato HH:MM',
 *   type: 'string'
 * }
 * #swagger.parameters['horaFin'] = {
 *   in: 'query',
 *   description: 'Hora de fin en formato HH:MM',
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Disponibilidad consultada exitosamente' }
 */
router.get("/disponibilidades/consultar", consultarDisponibilidadController);

module.exports = router;