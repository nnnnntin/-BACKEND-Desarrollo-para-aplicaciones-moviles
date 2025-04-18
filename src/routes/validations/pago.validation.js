const Joi = require("joi");

const createPagoSchema = Joi.object({
  idUsuario: Joi.string().required(),
  monto:     Joi.number().positive().required(),
  fecha:     Joi.date().iso().required(),
  metodo:    Joi.string().min(3).max(50).required(),
});

const updatePagoSchema = Joi.object({
  idUsuario: Joi.string(),
  monto:     Joi.number().positive(),
  fecha:     Joi.date().iso(),
  metodo:    Joi.string().min(3).max(50),
}).min(1);

module.exports = {
  createPagoSchema,
  updatePagoSchema,
};
