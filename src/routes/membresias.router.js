const express = require("express");
const router = express.Router();
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  getMembresiasController,
  getMembresiaByIdController,
  getMembresiaByTipoController,
  getMembresiasActivasController,
  createMembresiaController,
  updateMembresiaController,
  deleteMembresiaController,
  activarMembresiaController,
  getMembresiasOrdenadasController,
  getMembresiasWithBeneficioController,
  getMembresiasPorRangoPrecioController,
  actualizarBeneficiosController,
  suscribirMembresiaController,
  cancelarMembresiaController
} = require("../controllers/membresia.controller");
const {
  createMembresiaSchema,
  updateMembresiaSchema,
  suscribirMembresiaSchema,
  cancelarMembresiaSchema
} = require("../routes/validations/membresia.validation");

/**
 * @route   GET /membresias
 * @summary Obtener todas las membresías
 */
router.get(
  "/membresias",
  getMembresiasController
);

/**
 * @route   POST /membresias
 * @summary Crear nueva membresía
 */
router.post(
  "/membresias",
  payloadMiddleware(createMembresiaSchema),
  createMembresiaController
);

/**
 * @route   GET /membresias/activas
 * @summary Obtener membresías activas
 */
router.get(
  "/membresias/activas",
  getMembresiasActivasController
);

/**
 * @route   GET /membresias/tipo/:tipo
 * @summary Obtener membresías por tipo
 */
router.get(
  "/membresias/tipo/:tipo",
  getMembresiaByTipoController
);

/**
 * @route   GET /membresias/ordenadas
 * @summary Obtener membresías ordenadas por precio
 */
router.get(
  "/membresias/ordenadas",
  getMembresiasOrdenadasController
);

/**
 * @route   GET /membresias/beneficio/:tipoBeneficio
 * @summary Obtener membresías con un beneficio específico
 */
router.get(
  "/membresias/beneficio/:tipoBeneficio",
  getMembresiasWithBeneficioController
);

/**
 * @route   GET /membresias/precio
 * @summary Obtener membresías por rango de precio
 */
router.get(
  "/membresias/precio",
  getMembresiasPorRangoPrecioController
);

/**
 * @route   POST /membresias/suscribir
 * @summary Suscribir un usuario a una membresía
 */
router.post(
  "/membresias/suscribir",
  payloadMiddleware(suscribirMembresiaSchema),
  suscribirMembresiaController
);

/**
 * @route   POST /membresias/cancelar
 * @summary Cancelar suscripción de membresía
 */
router.post(
  "/membresias/cancelar",
  payloadMiddleware(cancelarMembresiaSchema),
  cancelarMembresiaController
);

/**
 * @route   PUT /membresias/:id/activar
 * @summary Activar o desactivar una membresía
 */
router.put(
  "/membresias/:id/activar",
  activarMembresiaController
);

/**
 * @route   PUT /membresias/:id/beneficios
 * @summary Actualizar los beneficios de una membresía
 */
router.put(
  "/membresias/:id/beneficios",
  actualizarBeneficiosController
);

/**
 * @route   GET /membresias/:id
 * @summary Obtener una membresía por ID
 */
router.get(
  "/membresias/:id",
  getMembresiaByIdController
);

/**
 * @route   PUT /membresias/:id
 * @summary Actualizar una membresía
 */
router.put(
  "/membresias/:id",
  payloadMiddleware(updateMembresiaSchema),
  updateMembresiaController
);

/**
 * @route   DELETE /membresias/:id
 * @summary Eliminar (marcar inactiva) una membresía
 */
router.delete(
  "/membresias/:id",
  deleteMembresiaController
);

module.exports = router;
