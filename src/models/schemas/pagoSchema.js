const Joi = require("joi");

const pagoSchema = Joi.object({
  idUsuario: Joi.string().required(), 
  monto: Joi.number().required(),
  fecha: Joi.date().required(),
  metodo: Joi.string().required()
});

module.exports = pagoSchema;
