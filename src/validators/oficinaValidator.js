const Joi = require('joi');

module.exports = Joi.object({
  nombre: Joi.string().min(3).required(),
  ubicacion: Joi.string().min(3).required(),
  capacidad: Joi.number().integer().min(1).required(),
});
