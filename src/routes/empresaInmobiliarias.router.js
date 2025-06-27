const express = require("express");
const router = express.Router();
const {
  getEmpresasInmobiliariasController,
  getEmpresaInmobiliariaByIdController,
  getEmpresaByUsuarioIdController,
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
const authMiddleware = require("../middlewares/auth.middleware");
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createEmpresaInmobiliariaSchema,
  updateEmpresaInmobiliariaSchema,
  verificarEmpresaSchema
} = require("./validations/empresaInmobiliaria.validation");

router.get("/", getEmpresasInmobiliariasController);
router.get("/verificadas", getEmpresasVerificadasController);
router.get("/tipo/:tipo", getEmpresasByTipoController);
router.get("/ciudad/:ciudad", getEmpresasByCiudadController);
router.get("/ranking/espacios", getEmpresasConMasEspaciosController);
router.get("/:id", getEmpresaInmobiliariaByIdController);
router.get("/usuario/:usuarioId", getEmpresaByUsuarioIdController);

router.post(
  "/",
  payloadMiddleware(createEmpresaInmobiliariaSchema),
  createEmpresaInmobiliariaController
);

router.use(authMiddleware);

router.put(
  "/:id",
  payloadMiddleware(updateEmpresaInmobiliariaSchema),
  updateEmpresaInmobiliariaController
);
router.delete("/:id", deleteEmpresaInmobiliariaController);
router.put("/:id/activar", activarEmpresaInmobiliariaController);
router.post(
  "/verificar",
  payloadMiddleware(verificarEmpresaSchema),
  verificarEmpresaController
);
router.put("/:id/calificacion", actualizarCalificacionController);
router.post("/:id/espacio", agregarEspacioController);
router.delete("/:id/espacio/:espacioId", eliminarEspacioController);
router.put("/:id/metodo-pago", actualizarMetodoPagoController);
router.put("/:id/contacto", actualizarContactoController);

module.exports = router;
