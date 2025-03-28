const Joi = require('joi');

module.exports = Joi.object({
  idUsuario: Joi.number().integer().required(),
  monto: Joi.number().positive().required(),
  fecha: Joi.date().required(),
  metodo: Joi.string().min(3).required(),
});
