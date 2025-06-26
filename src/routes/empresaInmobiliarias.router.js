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
const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createEmpresaInmobiliariaSchema,
  updateEmpresaInmobiliariaSchema,
  verificarEmpresaSchema
} = require("./validations/empresaInmobiliaria.validation");

router.get(
  "/empresas-inmobiliarias",
  getEmpresasInmobiliariasController
);

router.get(
  "/empresas-inmobiliarias/verificadas",
  getEmpresasVerificadasController
);

router.get(
  "/empresas-inmobiliarias/tipo/:tipo",
  getEmpresasByTipoController
);

router.get(
  "/empresas-inmobiliarias/ciudad/:ciudad",
  getEmpresasByCiudadController
);

router.get(
  "/empresas-inmobiliarias/ranking/espacios",
  getEmpresasConMasEspaciosController
);

router.get(
  "/empresas-inmobiliarias/:id",
  getEmpresaInmobiliariaByIdController
);

router.post(
  "/empresas-inmobiliarias",
  payloadMiddleware(createEmpresaInmobiliariaSchema),
  createEmpresaInmobiliariaController
);

router.put(
  "/empresas-inmobiliarias/:id",
  payloadMiddleware(updateEmpresaInmobiliariaSchema),
  updateEmpresaInmobiliariaController
);

router.delete(
  "/empresas-inmobiliarias/:id",
  deleteEmpresaInmobiliariaController
);

router.put(
  "/empresas-inmobiliarias/:id/activar",
  activarEmpresaInmobiliariaController
);

router.post(
  "/empresas-inmobiliarias/verificar",
  payloadMiddleware(verificarEmpresaSchema),
  verificarEmpresaController
);

router.put(
  "/empresas-inmobiliarias/:id/calificacion",
  actualizarCalificacionController
);

router.post(
  "/empresas-inmobiliarias/:id/espacio",
  agregarEspacioController
);

router.delete(
  "/empresas-inmobiliarias/:id/espacio/:espacioId",
  eliminarEspacioController
);

router.put(
  "/empresas-inmobiliarias/:id/metodo-pago",
  actualizarMetodoPagoController
);

router.put(
  "/empresas-inmobiliarias/:id/contacto",
  actualizarContactoController
);

router.get(
  "/empresas-inmobiliarias/usuario/:usuarioId",
  getEmpresaByUsuarioIdController
);

module.exports = router;
