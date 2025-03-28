const Joi = require('joi');

module.exports = Joi.object({
  tipo: Joi.string().min(3).required(),
  beneficios: Joi.string().min(5).required(),
  precio: Joi.number().positive().required(),
});
