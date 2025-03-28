const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/UsuariosController');
const validate = require('../middlewares/validateMiddleware');
const usuarioValidator = require('../validators/usuarioValidator');

router.get('/', usuariosController.obtenerUsuarios);
router.get('/:id', usuariosController.obtenerUsuarioPorId);
router.post('/', validate(usuarioValidator), usuariosController.crearUsuario);
router.put('/:id', validate(usuarioValidator), usuariosController.actualizarUsuario);
router.delete('/:id', usuariosController.eliminarUsuario);

module.exports = router;
