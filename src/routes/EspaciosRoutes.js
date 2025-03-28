const express = require('express');
const router = express.Router();
const espaciosController = require('../controllers/EspaciosController');
const validate = require('../middlewares/validateMiddleware');
const espacioValidator = require('../validators/espacioValidator');

router.get('/', espaciosController.obtenerEspacios);
router.get('/:id', espaciosController.obtenerEspacioPorId);
router.post('/', validate(espacioValidator), espaciosController.crearEspacio);
router.put('/:id', validate(espacioValidator), espaciosController.actualizarEspacio);
router.delete('/:id', espaciosController.eliminarEspacio);

module.exports = router;
