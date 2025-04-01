const Joi = require("joi");

const espacioSchema = Joi.object({
  nombre: Joi.string().required(),
  ubicacion: Joi.string().required(),
  capacidad: Joi.number().required()
});

module.exports = espacioSchema;
