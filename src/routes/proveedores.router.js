const express = require("express");
const router = express.Router();

const payloadMiddleware = require("../middlewares/payload.middleware");
const {
  createProveedorSchema,
  updateProveedorSchema,
  verificarProveedorSchema
} = require("./validations/proveedor.validation");

const {
  getProveedoresController,
  getProveedorByIdController,
  getProveedorByUsuarioIdController, 
  getProveedoresByTipoController,
  getProveedoresVerificadosController,
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

router.get("/proveedores", getProveedoresController);

router.get("/proveedores/verificados", getProveedoresVerificadosController);

router.get("/proveedores/tipo/:tipo", getProveedoresByTipoController);

router.get("/proveedores/filtrar", filtrarProveedoresController);

router.get("/proveedores/calificacion", getProveedoresPorCalificacionController);

router.get("/proveedores/ranking/servicios", getProveedoresConMasServiciosController);

router.get("/proveedores/:id", getProveedorByIdController);

router.get(
  "/proveedores/usuario/:usuarioId", 
  getProveedorByUsuarioIdController
);

router.post(
  "/proveedores",
  payloadMiddleware(createProveedorSchema),
  createProveedorController
);

router.put(
  "/proveedores/:id",
  payloadMiddleware(updateProveedorSchema),
  updateProveedorController
);

router.delete("/proveedores/:id", deleteProveedorController);

router.put("/proveedores/:id/activar", activarProveedorController);

router.post(
  "/proveedores/verificar",
  payloadMiddleware(verificarProveedorSchema),
  verificarProveedorController
);

router.put("/proveedores/:id/calificacion", actualizarCalificacionController);

router.post("/proveedores/:id/servicio", agregarServicioController);

router.delete(
  "/proveedores/:id/servicio/:servicioId",
  eliminarServicioController
);

router.put("/proveedores/:id/contacto", actualizarContactoController);

router.put("/proveedores/:id/metodo-pago", actualizarMetodoPagoController);

module.exports = router;
