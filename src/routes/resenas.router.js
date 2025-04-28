const express = require("express");
const router = express.Router();
const {
  getResenasController,
  getResenaByIdController,
  getResenasByUsuarioController,
  getResenasByEntidadController,
  getResenasByReservaController,
  getResenasPorCalificacionController,
  getResenasPendientesModeracionController,
  createResenaController,
  updateResenaController,
  deleteResenaController,
  cambiarEstadoResenaController,
  responderResenaController,
  moderarResenaController,
  getPromedioCalificacionEntidadController
} = require("../controllers/resena.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createResenaSchema,
  updateResenaSchema,
  responderResenaSchema,
  moderarResenaSchema
} = require("../routes/validations/resena.validation");

/**
 * @route GET /resenas
 * @summary Obtener todas las reseñas
 * @tags Reseñas - Gestión de reseñas
 * #swagger.responses[200] = { 
 *   description: 'Lista de reseñas obtenida exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Resena' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/resenas", getResenasController);

/**
 * @route GET /resenas/{id}
 * @summary Obtener reseña por ID
 * @tags Reseñas - Gestión de reseñas
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reseña',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reseña encontrada',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Resena' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Reseña no encontrada' }
 */
router.get("/resenas/:id", getResenaByIdController);

/**
 * @route POST /resenas
 * @summary Crear nueva reseña
 * @tags Reseñas - Gestión de reseñas
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/createResenaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { 
 *   description: 'Reseña creada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Resena' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/resenas",
  payloadMiddleware(createResenaSchema),
  createResenaController
);

/**
 * @route PUT /resenas/{id}
 * @summary Actualizar reseña
 * @tags Reseñas - Gestión de reseñas
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reseña',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/updateResenaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reseña actualizada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Resena' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Reseña no encontrada' }
 */
router.put(
  "/resenas/:id",
  payloadMiddleware(updateResenaSchema),
  updateResenaController
);

/**
 * @route DELETE /resenas/{id}
 * @summary Eliminar reseña
 * @tags Reseñas - Gestión de reseñas
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reseña',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Reseña eliminada exitosamente' }
 * #swagger.responses[404] = { description: 'Reseña no encontrada' }
 */
router.delete("/resenas/:id", deleteResenaController);

/**
 * @route GET /resenas/usuario/{usuarioId}
 * @summary Obtener reseñas por usuario
 * @tags Reseñas - Gestión de reseñas
 * #swagger.parameters['usuarioId'] = {
 *   in: 'path',
 *   description: 'ID del usuario',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reseñas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Resena' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/resenas/usuario/:usuarioId", getResenasByUsuarioController);

/**
 * @route GET /resenas/entidad/{tipoEntidad}/{entidadId}
 * @summary Obtener reseñas por entidad
 * @tags Reseñas - Gestión de reseñas
 * #swagger.parameters['tipoEntidad'] = {
 *   in: 'path',
 *   description: 'Tipo de entidad',
 *   required: true,
 *   type: 'string',
 *   enum: ['oficina', 'espacio', 'servicio']
 * }
 * #swagger.parameters['entidadId'] = {
 *   in: 'path',
 *   description: 'ID de la entidad',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reseñas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Resena' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/resenas/entidad/:tipoEntidad/:entidadId", getResenasByEntidadController);

/**
 * @route GET /resenas/reserva/{reservaId}
 * @summary Obtener reseñas por reserva
 * @tags Reseñas - Gestión de reseñas
 * #swagger.parameters['reservaId'] = {
 *   in: 'path',
 *   description: 'ID de la reserva',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reseñas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Resena' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/resenas/reserva/:reservaId", getResenasByReservaController);

/**
 * @route GET /resenas/calificacion
 * @summary Obtener reseñas por calificación
 * @tags Reseñas - Gestión de reseñas
 * #swagger.parameters['calificacionMinima'] = {
 *   in: 'query',
 *   description: 'Calificación mínima',
 *   required: true,
 *   type: 'number',
 *   minimum: 1,
 *   maximum: 5
 * }
 * #swagger.parameters['calificacionMaxima'] = {
 *   in: 'query',
 *   description: 'Calificación máxima',
 *   type: 'number',
 *   minimum: 1,
 *   maximum: 5
 * }
 * #swagger.responses[200] = { 
 *   description: 'Reseñas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Resena' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/resenas/calificacion", getResenasPorCalificacionController);

/**
 * @route GET /resenas/pendientes-moderacion
 * @summary Obtener reseñas pendientes de moderación
 * @tags Reseñas - Gestión de reseñas
 * #swagger.responses[200] = { 
 *   description: 'Reseñas pendientes de moderación encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Resena' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/resenas/pendientes-moderacion", getResenasPendientesModeracionController);

/**
 * @route PUT /resenas/{id}/estado
 * @summary Cambiar estado de reseña
 * @tags Reseñas - Gestión de reseñas
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la reseña',
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
 *             enum: ['pendiente', 'aprobada', 'rechazada']
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Estado de la reseña actualizado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Reseña no encontrada' }
 */
router.put("/resenas/:id/estado", cambiarEstadoResenaController);

/**
 * @route POST /resenas/responder
 * @summary Responder a una reseña
 * @tags Reseñas - Gestión de reseñas
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/responderResenaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Respuesta a reseña agregada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Reseña no encontrada' }
 */
router.post(
  "/resenas/responder",
  payloadMiddleware(responderResenaSchema),
  responderResenaController
);

/**
 * @route POST /resenas/moderar
 * @summary Moderar una reseña
 * @tags Reseñas - Gestión de reseñas
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/moderarResenaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Reseña moderada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Reseña no encontrada' }
 */
router.post(
  "/resenas/moderar",
  payloadMiddleware(moderarResenaSchema),
  moderarResenaController
);

/**
 * @route GET /resenas/promedio/{tipoEntidad}/{entidadId}
 * @summary Obtener promedio de calificación de una entidad
 * @tags Reseñas - Gestión de reseñas
 * #swagger.parameters['tipoEntidad'] = {
 *   in: 'path',
 *   description: 'Tipo de entidad',
 *   required: true,
 *   type: 'string',
 *   enum: ['oficina', 'espacio', 'servicio']
 * }
 * #swagger.parameters['entidadId'] = {
 *   in: 'path',
 *   description: 'ID de la entidad',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Promedio de calificación obtenido exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         properties: {
 *           promedio: { type: 'number' },
 *           cantidadResenas: { type: 'integer' },
 *           aspectos: {
 *             type: 'object',
 *             properties: {
 *               limpieza: { type: 'number' },
 *               ubicacion: { type: 'number' },
 *               servicios: { type: 'number' },
 *               relacionCalidadPrecio: { type: 'number' }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Entidad no encontrada' }
 */
router.get("/resenas/promedio/:tipoEntidad/:entidadId", getPromedioCalificacionEntidadController);

module.exports = router;