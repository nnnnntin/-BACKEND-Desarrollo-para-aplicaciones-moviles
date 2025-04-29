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

router.get(
  "/membresias",
  getMembresiasController
);

router.post(
  "/membresias",
  payloadMiddleware(createMembresiaSchema),
  createMembresiaController
);

router.get(
  "/membresias/activas",
  getMembresiasActivasController
);

router.get(
  "/membresias/tipo/:tipo",
  getMembresiaByTipoController
);

router.get(
  "/membresias/ordenadas",
  getMembresiasOrdenadasController
);

router.get(
  "/membresias/beneficio/:tipoBeneficio",
  getMembresiasWithBeneficioController
);

router.get(
  "/membresias/precio",
  getMembresiasPorRangoPrecioController
);

router.post(
  "/membresias/suscribir",
  payloadMiddleware(suscribirMembresiaSchema),
  suscribirMembresiaController
);

router.post(
  "/membresias/cancelar",
  payloadMiddleware(cancelarMembresiaSchema),
  cancelarMembresiaController
);

router.put(
  "/membresias/:id/activar",
  activarMembresiaController
);

router.put(
  "/membresias/:id/beneficios",
  actualizarBeneficiosController
);

router.get(
  "/membresias/:id",
  getMembresiaByIdController
);

router.put(
  "/membresias/:id",
  payloadMiddleware(updateMembresiaSchema),
  updateMembresiaController
);

router.delete(
  "/membresias/:id",
  deleteMembresiaController
);

module.exports = router;
