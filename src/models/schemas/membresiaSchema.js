const Joi = require("joi");

const membresiaSchema = Joi.object({
  tipo: Joi.string().required(),
  beneficios: Joi.string().required(),
  precio: Joi.number().required()
});

module.exports = membresiaSchema;
