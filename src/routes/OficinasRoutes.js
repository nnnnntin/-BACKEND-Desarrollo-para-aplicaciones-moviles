const express = require('express');
const router = express.Router();
const oficinasController = require('../controllers/OficinasController');
const validate = require('../middlewares/validateMiddleware');
const oficinaValidator = require('../validators/oficinaValidator');

router.get('/', oficinasController.obtenerOficinas);
router.get('/:id', oficinasController.obtenerOficinaPorId);
router.post('/', validate(oficinaValidator), oficinasController.crearOficina);
router.put('/:id', validate(oficinaValidator), oficinasController.actualizarOficina);
router.delete('/:id', oficinasController.eliminarOficina);

module.exports = router;
