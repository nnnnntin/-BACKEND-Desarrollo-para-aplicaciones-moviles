const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const payloadMiddleware = require("../middlewares/payload.middleware");

const {
  getProveedoresController,
  getProveedorByIdController,
  getProveedorByUsuarioIdController,
  getProveedoresByTipoController,
  getProveedoresVerificadosController,
  filtrarProveedoresController,
  getProveedoresPorCalificacionController,
  getProveedoresConMasServiciosController,
  updateProveedorController,
  deleteProveedorController,
  activarProveedorController,
  verificarProveedorController,
  actualizarCalificacionController,
  agregarServicioController,
  eliminarServicioController,
  actualizarContactoController,
  actualizarMetodoPagoController
} = require("../controllers/proveedor.controller");

const {
  updateProveedorSchema,
  verificarProveedorSchema
} = require("./validations/proveedor.validation");

router.get("/proveedores", getProveedoresController);
router.get("/proveedores/verificados", getProveedoresVerificadosController);
router.get("/proveedores/tipo/:tipo", getProveedoresByTipoController);
router.get("/proveedores/filtrar", filtrarProveedoresController);
router.get("/proveedores/calificacion", getProveedoresPorCalificacionController);
router.get("/proveedores/ranking/servicios", getProveedoresConMasServiciosController);
router.get("/proveedores/:id", getProveedorByIdController);
router.get("/proveedores/usuario/:usuarioId", getProveedorByUsuarioIdController);

router.post(
  "/proveedores/verificar",
  payloadMiddleware(verificarProveedorSchema),
  verificarProveedorController
);
router.post("/proveedores/:id/servicio", agregarServicioController);

router.use(authMiddleware);

router.put(
  "/proveedores/:id",
  payloadMiddleware(updateProveedorSchema),
  updateProveedorController
);
router.delete("/proveedores/:id", deleteProveedorController);
router.put("/proveedores/:id/activar", activarProveedorController);
router.put("/proveedores/:id/calificacion", actualizarCalificacionController);
router.delete(
  "/proveedores/:id/servicio/:servicioId",
  eliminarServicioController
);
router.put("/proveedores/:id/contacto", actualizarContactoController);
router.put("/proveedores/:id/metodo-pago", actualizarMetodoPagoController);

module.exports = router;
