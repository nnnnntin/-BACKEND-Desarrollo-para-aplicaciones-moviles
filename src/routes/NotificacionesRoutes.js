const express = require('express');
const router = express.Router();
const notificacionesController = require('../controllers/NotificacionesController');
const validate = require('../middlewares/validateMiddleware');
const notificacionValidator = require('../validators/notificacionValidator');

router.get('/', notificacionesController.obtenerNotificaciones);
router.get('/:id', notificacionesController.obtenerNotificacionPorId);
router.post('/', validate(notificacionValidator), notificacionesController.crearNotificacion);
router.put('/:id', validate(notificacionValidator), notificacionesController.actualizarNotificacion);
router.delete('/:id', notificacionesController.eliminarNotificacion);

module.exports = router;
