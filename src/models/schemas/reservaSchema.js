const Joi = require("joi");

const reservaSchema = Joi.object({
  idUsuario: Joi.string().required(), 
  idOficina: Joi.string().required(),
  fecha: Joi.date().required(),
  estado: Joi.string().valid('pendiente', 'aprobada', 'rechazada').required()
});

module.exports = reservaSchema;
