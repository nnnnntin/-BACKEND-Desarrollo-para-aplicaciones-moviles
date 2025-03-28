const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/PagosController');
const validate = require('../middlewares/validateMiddleware');
const pagoValidator = require('../validators/pagoValidator');

router.get('/', pagosController.obtenerPagos);
router.get('/:id', pagosController.obtenerPagoPorId);
router.post('/', validate(pagoValidator), pagosController.crearPago);
router.put('/:id', validate(pagoValidator), pagosController.actualizarPago);
router.delete('/:id', pagosController.eliminarPago);

module.exports = router;
