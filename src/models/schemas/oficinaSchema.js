const Joi = require("joi");

const oficinaSchema = Joi.object({
  nombre: Joi.string().required(),
  ubicacion: Joi.string().required(),
  capacidad: Joi.number().required()
});

module.exports = oficinaSchema;
