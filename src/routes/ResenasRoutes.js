const express = require('express');
const router = express.Router();
const resenasController = require('../controllers/ResenasController');
const validate = require('../middlewares/validateMiddleware');
const resenaValidator = require('../validators/resenaValidator');

router.get('/', resenasController.obtenerResenas);
router.get('/:id', resenasController.obtenerResenaPorId);
router.post('/', validate(resenaValidator), resenasController.crearResena);
router.put('/:id', validate(resenaValidator), resenasController.actualizarResena);
router.delete('/:id', resenasController.eliminarResena);

module.exports = router;
