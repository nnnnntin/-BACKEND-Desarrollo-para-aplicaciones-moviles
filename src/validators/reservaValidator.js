const Joi = require('joi');

module.exports = Joi.object({
  idUsuario: Joi.number().integer().required(),
  idOficina: Joi.number().integer().required(),
  fecha: Joi.date().required(),
  estado: Joi.string().valid('pendiente', 'aprobada', 'rechazada').required(),
});
