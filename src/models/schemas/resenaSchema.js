const Joi = require("joi");

const resenaSchema = Joi.object({
  idUsuario: Joi.string().required(), 
  comentario: Joi.string().required(),
  calificacion: Joi.number().min(1).max(5).required()
});

module.exports = resenaSchema;
