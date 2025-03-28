const Joi = require('joi');

module.exports = Joi.object({
  mensaje: Joi.string().min(5).required(),
  leido: Joi.boolean().default(false),
});
