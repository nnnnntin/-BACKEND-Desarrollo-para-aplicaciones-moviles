const Joi = require("joi");

const notificacionSchema = Joi.object({
  mensaje: Joi.string().required(),
  leido: Joi.boolean().default(false)
});

module.exports = notificacionSchema;
