const Joi = require("joi");

const createReservaSchema = Joi.object({
  idUsuario: Joi.string().required(),
  idOficina: Joi.string().required(),
  fecha:     Joi.date().iso().required(),
  estado:    Joi.string().min(3).max(30).required(),
});

const updateReservaSchema = Joi.object({
  idUsuario: Joi.string(),
  idOficina: Joi.string(),
  fecha:     Joi.date().iso(),
  estado:    Joi.string().min(3).max(30),
}).min(1);

module.exports = {
  createReservaSchema,
  updateReservaSchema,
};
