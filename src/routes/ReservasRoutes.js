const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/ReservasController');
const validate = require('../middlewares/validateMiddleware');
const reservaValidator = require('../validators/reservaValidator');

router.get('/', reservasController.obtenerReservas);
router.get('/:id', reservasController.obtenerReservaPorId);
router.post('/', validate(reservaValidator), reservasController.crearReserva);
router.put('/:id', validate(reservaValidator), reservasController.actualizarReserva);
router.delete('/:id', reservasController.eliminarReserva);

module.exports = router;
