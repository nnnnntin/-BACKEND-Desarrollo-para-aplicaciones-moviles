const Joi = require('joi');

module.exports = Joi.object({
  idUsuario: Joi.number().integer().required(),
  comentario: Joi.string().min(3).required(),
  calificacion: Joi.number().integer().min(1).max(5).required(),
});
