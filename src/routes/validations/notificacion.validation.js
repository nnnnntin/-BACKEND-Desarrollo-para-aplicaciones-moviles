const Joi = require("joi");

const createNotificacionSchema = Joi.object({
  mensaje: Joi.string().min(3).max(500).required(),
  leido:   Joi.boolean().required(),
});

const updateNotificacionSchema = Joi.object({
  mensaje: Joi.string().min(3).max(500),
  leido:   Joi.boolean(),
}).min(1);

module.exports = {
  createNotificacionSchema,
  updateNotificacionSchema,
};
