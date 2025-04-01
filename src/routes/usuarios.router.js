const express = require("express");
const router = express.Router();

const {
  getUsuariosController,
  getUsuarioController,
  postUsuarioController,
  putUsuarioController,
  deleteUsuarioController,
} = require("../controllers/usuarios.controller");
const payloadMiddleWare = require("../middlewares/paylod.middleware");
const usuarioSchema = require("../models/schemas/usuarioSchema");

// Private Routes
router.get("/usuarios", getUsuariosController);
router.get("/usuarios/:id", getUsuarioController);
router.post("/usuarios", payloadMiddleWare(usuarioSchema), postUsuarioController);
router.delete("/usuarios/:id", deleteUsuarioController);
router.put("/usuarios/:id", putUsuarioController);

module.exports = router;
