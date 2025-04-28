const express = require("express");
const router = express.Router();
const {
  getProveedoresController,
  getProveedorByIdController,
  getProveedoresByTipoController,
  getProveedoresVerificadosController,
  getProveedoresByServicioController,
  createProveedorController,
  updateProveedorController,
  deleteProveedorController,
  activarProveedorController,
  verificarProveedorController,
  actualizarCalificacionController,
  agregarServicioController,
  eliminarServicioController,
  actualizarContactoController,
  actualizarMetodoPagoController,
  getProveedoresPorCalificacionController,
  getProveedoresConMasServiciosController,
  filtrarProveedoresController
} = require("../controllers/proveedor.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createProveedorSchema,
  updateProveedorSchema,
  verificarProveedorSchema
} = require("./validations/proveedor.validation");

/**
 * @route GET /proveedores
 * @summary Obtener todos los proveedores
 * @tags Proveedores - Gestión de proveedores
 * #swagger.responses[200] = { 
 *   description: 'Lista de proveedores obtenida exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Proveedor' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/proveedores", getProveedoresController);

/**
 * @route GET /proveedores/{id}
 * @summary Obtener proveedor por ID
 * @tags Proveedores - Gestión de proveedores
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del proveedor',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Proveedor encontrado',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Proveedor' }
 *     }
 *   }
 * }
 * #swagger.responses[404] = { description: 'Proveedor no encontrado' }
 */
router.get("/proveedores/:id", getProveedorByIdController);

/**
 * @route POST /proveedores
 * @summary Crear nuevo proveedor
 * @tags Proveedores - Gestión de proveedores
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/createProveedorSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[201] = { 
 *   description: 'Proveedor creado exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Proveedor' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 */
router.post(
  "/proveedores",
  payloadMiddleware(createProveedorSchema),
  createProveedorController
);

/**
 * @route PUT /proveedores/{id}
 * @summary Actualizar proveedor
 * @tags Proveedores - Gestión de proveedores
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del proveedor',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/updateProveedorSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { 
 *   description: 'Proveedor actualizado exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/Proveedor' }
 *     }
 *   }
 * }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Proveedor no encontrado' }
 */
router.put(
  "/proveedores/:id",
  payloadMiddleware(updateProveedorSchema),
  updateProveedorController
);

/**
 * @route DELETE /proveedores/{id}
 * @summary Eliminar proveedor
 * @tags Proveedores - Gestión de proveedores
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del proveedor',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Proveedor eliminado exitosamente' }
 * #swagger.responses[404] = { description: 'Proveedor no encontrado' }
 */
router.delete("/proveedores/:id", deleteProveedorController);

/**
 * @route GET /proveedores/tipo/{tipo}
 * @summary Obtener proveedores por tipo
 * @tags Proveedores - Gestión de proveedores
 * #swagger.parameters['tipo'] = {
 *   in: 'path',
 *   description: 'Tipo de proveedor',
 *   required: true,
 *   type: 'string',
 *   enum: ['empresa', 'autonomo', 'interno']
 * }
 * #swagger.responses[200] = { 
 *   description: 'Proveedores encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Proveedor' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/proveedores/tipo/:tipo", getProveedoresByTipoController);

/**
 * @route GET /proveedores/verificados
 * @summary Obtener proveedores verificados
 * @tags Proveedores - Gestión de proveedores
 * #swagger.responses[200] = { 
 *   description: 'Proveedores verificados encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Proveedor' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/proveedores/verificados", getProveedoresVerificadosController);

/**
 * @route GET /proveedores/servicio/{tipoServicio}
 * @summary Obtener proveedores por tipo de servicio
 * @tags Proveedores - Gestión de proveedores
 * #swagger.parameters['tipoServicio'] = {
 *   in: 'path',
 *   description: 'Tipo de servicio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Proveedores encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Proveedor' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/proveedores/servicio/:tipoServicio", getProveedoresByServicioController);

/**
 * @route PUT /proveedores/{id}/activar
 * @summary Activar o desactivar proveedor
 * @tags Proveedores - Gestión de proveedores
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del proveedor',
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
 * #swagger.responses[200] = { description: 'Estado del proveedor actualizado exitosamente' }
 * #swagger.responses[404] = { description: 'Proveedor no encontrado' }
 */
router.put("/proveedores/:id/activar", activarProveedorController);

/**
 * @route POST /proveedores/verificar
 * @summary Verificar proveedor
 * @tags Proveedores - Gestión de proveedores
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: { $ref: '#/definitions/verificarProveedorSchema' }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Proveedor verificado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Proveedor no encontrado' }
 */
router.post(
  "/proveedores/verificar",
  payloadMiddleware(verificarProveedorSchema),
  verificarProveedorController
);

/**
 * @route PUT /proveedores/{id}/calificacion
 * @summary Actualizar calificación de proveedor
 * @tags Proveedores - Gestión de proveedores
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del proveedor',
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
 * #swagger.responses[404] = { description: 'Proveedor no encontrado' }
 */
router.put("/proveedores/:id/calificacion", actualizarCalificacionController);

/**
 * @route POST /proveedores/{id}/servicio
 * @summary Agregar servicio a proveedor
 * @tags Proveedores - Gestión de proveedores
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del proveedor',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.requestBody = {
 *   required: true,
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'object',
 *         required: ['servicioOfrecido'],
 *         properties: {
 *           servicioOfrecido: { type: 'string' }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Servicio agregado exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Proveedor no encontrado' }
 */
router.post("/proveedores/:id/servicio", agregarServicioController);

/**
 * @route DELETE /proveedores/{id}/servicio/{servicioId}
 * @summary Eliminar servicio de proveedor
 * @tags Proveedores - Gestión de proveedores
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del proveedor',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.parameters['servicioId'] = {
 *   in: 'path',
 *   description: 'ID del servicio',
 *   required: true,
 *   type: 'string'
 * }
 * #swagger.responses[200] = { description: 'Servicio eliminado exitosamente' }
 * #swagger.responses[404] = { description: 'Proveedor o servicio no encontrados' }
 */
router.delete("/proveedores/:id/servicio/:servicioId", eliminarServicioController);

/**
 * @route PUT /proveedores/{id}/contacto
 * @summary Actualizar información de contacto de proveedor
 * @tags Proveedores - Gestión de proveedores
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del proveedor',
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
 *               telefono: { type: 'string' }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * #swagger.responses[200] = { description: 'Información de contacto actualizada exitosamente' }
 * #swagger.responses[400] = { description: 'Datos inválidos' }
 * #swagger.responses[404] = { description: 'Proveedor no encontrado' }
 */
router.put("/proveedores/:id/contacto", actualizarContactoController);

/**
 * @route PUT /proveedores/{id}/metodo-pago
 * @summary Actualizar método de pago de proveedor
 * @tags Proveedores - Gestión de proveedores
 * #swagger.parameters['id'] = {
 *   in: 'path',
 *   description: 'ID del proveedor',
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
 * #swagger.responses[404] = { description: 'Proveedor no encontrado' }
 */
router.put("/proveedores/:id/metodo-pago", actualizarMetodoPagoController);

/**
 * @route GET /proveedores/calificacion
 * @summary Obtener proveedores por calificación
 * @tags Proveedores - Gestión de proveedores
 * #swagger.parameters['calificacionMinima'] = {
 *   in: 'query',
 *   description: 'Calificación mínima',
 *   required: true,
 *   type: 'number',
 *   minimum: 1,
 *   maximum: 5
 * }
 * #swagger.responses[200] = { 
 *   description: 'Proveedores encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Proveedor' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/proveedores/calificacion", getProveedoresPorCalificacionController);

/**
 * @route GET /proveedores/ranking/servicios
 * @summary Obtener ranking de proveedores por cantidad de servicios
 * @tags Proveedores - Gestión de proveedores
 * #swagger.parameters['limite'] = {
 *   in: 'query',
 *   description: 'Número máximo de resultados',
 *   type: 'integer',
 *   default: 10
 * }
 * #swagger.responses[200] = { 
 *   description: 'Ranking de proveedores obtenido exitosamente',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { 
 *           type: 'object',
 *           properties: {
 *             proveedor: { $ref: '#/definitions/Proveedor' },
 *             cantidadServicios: { type: 'integer' }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 */
router.get("/proveedores/ranking/servicios", getProveedoresConMasServiciosController);

/**
 * @route GET /proveedores/filtrar
 * @summary Filtrar proveedores por criterios
 * @tags Proveedores - Gestión de proveedores
 * #swagger.parameters['tipo'] = {
 *   in: 'query',
 *   description: 'Tipo de proveedor',
 *   type: 'string',
 *   enum: ['empresa', 'autonomo', 'interno']
 * }
 * #swagger.parameters['servicioOfrecido'] = {
 *   in: 'query',
 *   description: 'Servicio ofrecido',
 *   type: 'string'
 * }
 * #swagger.parameters['verificado'] = {
 *   in: 'query',
 *   description: 'Estado de verificación',
 *   type: 'boolean'
 * }
 * #swagger.parameters['activo'] = {
 *   in: 'query',
 *   description: 'Estado activo',
 *   type: 'boolean'
 * }
 * #swagger.responses[200] = { 
 *   description: 'Proveedores filtrados encontrados',
 *   content: {
 *     'application/json': {
 *       schema: {
 *         type: 'array',
 *         items: { $ref: '#/definitions/Proveedor' }
 *       }
 *     }
 *   }
 * }
 */
router.get("/proveedores/filtrar", filtrarProveedoresController);

module.exports = router;