const Joi = require("joi");

const createResenaSchema = Joi.object({
  idUsuario:   Joi.string().required(),
  comentario:  Joi.string().min(5).max(500).required(),
  calificacion:Joi.number().integer().min(1).max(5).required(),
});

const updateResenaSchema = Joi.object({
  idUsuario:   Joi.string(),
  comentario:  Joi.string().min(5).max(500),
  calificacion:Joi.number().integer().min(1).max(5),
}).min(1);

module.exports = {
  createResenaSchema,
  updateResenaSchema,
};
