const Joi = require("joi");

const usuarioSchema = Joi.object({
  nombre: Joi.string().required(),
  email: Joi.string().email().required(),
  rol: Joi.string().valid('empleado', 'administrador', 'cliente').required()
});

module.exports = usuarioSchema;
