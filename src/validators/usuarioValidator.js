const Joi = require('joi');

module.exports = Joi.object({
  nombre: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  rol: Joi.string().valid('empleado', 'administrador', 'cliente').required(),
});
