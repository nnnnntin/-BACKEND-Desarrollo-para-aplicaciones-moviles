const express = require("express");
const router = express.Router();
const {
  getEmpresasInmobiliariasController,
  getEmpresaInmobiliariaByIdController,
  getEmpresasByTipoController,
  getEmpresasVerificadasController,
  getEmpresasByCiudadController,
  createEmpresaInmobiliariaController,
  updateEmpresaInmobiliariaController,
  deleteEmpresaInmobiliariaController,
  activarEmpresaInmobiliariaController,
  verificarEmpresaController,
  actualizarCalificacionController,
  agregarEspacioController,
  eliminarEspacioController,
  actualizarMetodoPagoController,
  actualizarContactoController,
  getEmpresasConMasEspaciosController
} = require("../controllers/empresaInmobiliaria.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createEmpresaInmobiliariaSchema,
  updateEmpresaInmobiliariaSchema,
  verificarEmpresaSchema
} = require("./validations/empresaInmobiliaria.validation");

/**
 * @route GET /empresas-inmobiliarias
 * @summary Obtener todas las empresas inmobiliarias
 * @tags Empresas Inmobiliarias - Gestión de empresas inmobiliarias
 * #swagger.responses[200] = { 
 *   description: 'Lista de empresas inmobiliarias obtenida exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/EmpresaInmobiliaria' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/empresas-inmobiliarias", getEmpresasInmobiliariasController);

/**
 * @route GET /empresas-inmobiliarias/{id}
 * @summary Obtener empresa inmobiliaria por ID
 * @tags Empresas Inmobiliarias - Gestión de empresas inmobiliarias
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la empresa inmobiliaria',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Empresa inmobiliaria encontrada',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/EmpresaInmobiliaria' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Empresa inmobiliaria no encontrada' }
 */
router.get("/empresas-inmobiliarias/:id", getEmpresaInmobiliariaByIdController);

/**
 * @route POST /empresas-inmobiliarias
 * @summary Crear nueva empresa inmobiliaria
 * @tags Empresas Inmobiliarias - Gestión de empresas inmobiliarias
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/createEmpresaInmobiliariaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { 
 *   description: 'Empresa inmobiliaria creada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/EmpresaInmobiliaria' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/empresas-inmobiliarias",
  payloadMiddleware(createEmpresaInmobiliariaSchema),
  createEmpresaInmobiliariaController
);

/**
 * @route PUT /empresas-inmobiliarias/{id}
 * @summary Actualizar empresa inmobiliaria
 * @tags Empresas Inmobiliarias - Gestión de empresas inmobiliarias
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la empresa inmobiliaria',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/updateEmpresaInmobiliariaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'Empresa inmobiliaria actualizada exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/EmpresaInmobiliaria' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Empresa inmobiliaria no encontrada' }
 */
router.put(
  "/empresas-inmobiliarias/:id",
  payloadMiddleware(updateEmpresaInmobiliariaSchema),
  updateEmpresaInmobiliariaController
);

/**
 * @route DELETE /empresas-inmobiliarias/{id}
 * @summary Eliminar empresa inmobiliaria
 * @tags Empresas Inmobiliarias - Gestión de empresas inmobiliarias
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la empresa inmobiliaria',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Empresa inmobiliaria eliminada exitosamente' }
 * #swagger.responses[404] = { description: 'Empresa inmobiliaria no encontrada' }
 */
router.delete("/empresas-inmobiliarias/:id", deleteEmpresaInmobiliariaController);

/**
 * @route GET /empresas-inmobiliarias/tipo/{tipo}
 * @summary Obtener empresas inmobiliarias por tipo
 * @tags Empresas Inmobiliarias - Gestión de empresas inmobiliarias
 * #swagger.parameters['tipo'] = {
 *   in: 'path',
 *   description: 'Tipo de empresa inmobiliaria',
 *   required: true,
 *   type: 'string',
 *   enum: ['inmobiliaria', 'propietario_directo', 'administrador_edificio']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Empresas inmobiliarias encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/EmpresaInmobiliaria' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/empresas-inmobiliarias/tipo/:tipo", getEmpresasByTipoController);

/**
 * @route GET /empresas-inmobiliarias/verificadas
 * @summary Obtener empresas inmobiliarias verificadas
 * @tags Empresas Inmobiliarias - Gestión de empresas inmobiliarias
 * #swagger.responses[200] = { 
 *   description: 'Empresas inmobiliarias verificadas encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/EmpresaInmobiliaria' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/empresas-inmobiliarias/verificadas", getEmpresasVerificadasController);

/**
 * @route GET /empresas-inmobiliarias/ciudad/{ciudad}
 * @summary Obtener empresas inmobiliarias por ciudad
 * @tags Empresas Inmobiliarias - Gestión de empresas inmobiliarias
 * #swagger.parameters['ciudad'] = {
 *   in: 'path',
 *   description: 'Ciudad',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Empresas inmobiliarias encontradas',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/EmpresaInmobiliaria' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/empresas-inmobiliarias/ciudad/:ciudad", getEmpresasByCiudadController);

/**
 * @route PUT /empresas-inmobiliarias/{id}/activar
 * @summary Activar o desactivar empresa inmobiliaria
 * @tags Empresas Inmobiliarias - Gestión de empresas inmobiliarias
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la empresa inmobiliaria',
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
 * #swagger.responses[200] = { description: 'Estado de la empresa inmobiliaria actualizado exitosamente' }
 * #swagger.responses[404] = { description: 'Empresa inmobiliaria no encontrada' }
 */
router.put("/empresas-inmobiliarias/:id/activar", activarEmpresaInmobiliariaController);

/**
 * @route POST /empresas-inmobiliarias/verificar
 * @summary Verificar empresa inmobiliaria
 * @tags Empresas Inmobiliarias - Gestión de empresas inmobiliarias
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/verificarEmpresaSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Empresa inmobiliaria verificada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Empresa inmobiliaria no encontrada' }
 */
router.post(
  "/empresas-inmobiliarias/verificar",
  payloadMiddleware(verificarEmpresaSchema),
  verificarEmpresaController
);

/**
 * @route PUT /empresas-inmobiliarias/{id}/calificacion
 * @summary Actualizar calificación de empresa inmobiliaria
 * @tags Empresas Inmobiliarias - Gestión de empresas inmobiliarias
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la empresa inmobiliaria',
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
 * #swagger.responses[404] = { description: 'Empresa inmobiliaria no encontrada' }
 */
router.put("/empresas-inmobiliarias/:id/calificacion", actualizarCalificacionController);

/**
 * @route POST /empresas-inmobiliarias/{id}/espacio
 * @summary Agregar espacio a empresa inmobiliaria
 * @tags Empresas Inmobiliarias - Gestión de empresas inmobiliarias
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la empresa inmobiliaria',
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
 * #swagger.responses[200] = { description: 'Espacio agregado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Empresa inmobiliaria o espacio no encontrados' }
 */
router.post("/empresas-inmobiliarias/:id/espacio", agregarEspacioController);

/**
 * @route DELETE /empresas-inmobiliarias/{id}/espacio/{espacioId}
 * @summary Eliminar espacio de empresa inmobiliaria
 * @tags Empresas Inmobiliarias - Gestión de empresas inmobiliarias
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la empresa inmobiliaria',
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
 * #swagger.responses[404] = { description: 'Empresa inmobiliaria o espacio no encontrados' }
 */
router.delete("/empresas-inmobiliarias/:id/espacio/:espacioId", eliminarEspacioController);

/**
 * @route PUT /empresas-inmobiliarias/{id}/metodo-pago
 * @summary Actualizar método de pago de empresa inmobiliaria
 * @tags Empresas Inmobiliarias - Gestión de empresas inmobiliarias
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la empresa inmobiliaria',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['metodoPago'],
 *         properties: {
 *           metodoPago: {
 *             type: 'object',
 *             properties: {
 *               titular: { type: 'string' },
 *               iban: { type: 'string' },
 *               swift: { type: 'string' }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Método de pago actualizado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Empresa inmobiliaria no encontrada' }
 */
router.put("/empresas-inmobiliarias/:id/metodo-pago", actualizarMetodoPagoController);

/**
 * @route PUT /empresas-inmobiliarias/{id}/contacto
 * @summary Actualizar información de contacto de empresa inmobiliaria
 * @tags Empresas Inmobiliarias - Gestión de empresas inmobiliarias
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID de la empresa inmobiliaria',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['contacto'],
 *         properties: {
 *           contacto: {
 *             type: 'object',
 *             properties: {
 *               nombreContacto: { type: 'string' },
 *               email: { type: 'string', format: 'email' },
 *               telefono: { type: 'string' },
 *               cargo: { type: 'string' }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Información de contacto actualizada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Empresa inmobiliaria no encontrada' }
 */
router.put("/empresas-inmobiliarias/:id/contacto", actualizarContactoController);

/**
 * @route GET /empresas-inmobiliarias/ranking/espacios
 * @summary Obtener ranking de empresas inmobiliarias por cantidad de espacios
 * @tags Empresas Inmobiliarias - Gestión de empresas inmobiliarias
 * #swagger.parameters['limite'] = {
 *   in: 'query',
 *   description: 'Número máximo de resultados',
 *   type: 'integer',
 *   default: 10
 * }
 * #swagger.responses[200] = { 
 *   description: 'Ranking de empresas inmobiliarias obtenido exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { 
 *           type: 'object',
 *           properties: {
 *             empresa: { $ref: '#/definitions/EmpresaInmobiliaria' },
 *             cantidadEspacios: { type: 'integer' }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 */
router.get("/empresas-inmobiliarias/ranking/espacios", getEmpresasConMasEspaciosController);

module.exports = router;