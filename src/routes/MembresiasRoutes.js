const express = require('express');
const router = express.Router();
const membresiasController = require('../controllers/MembresiasController');
const validate = require('../middlewares/validateMiddleware');
const membresiaValidator = require('../validators/membresiaValidator');

router.get('/', membresiasController.obtenerMembresias);
router.get('/:id', membresiasController.obtenerMembresiaPorId);
router.post('/', validate(membresiaValidator), membresiasController.crearMembresia);
router.put('/:id', validate(membresiaValidator), membresiasController.actualizarMembresia);
router.delete('/:id', membresiasController.eliminarMembresia);

module.exports = router;
