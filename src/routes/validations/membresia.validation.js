const Joi = require("joi");

const createMembresiaSchema = Joi.object({
  tipo:       Joi.string().min(3).max(50).required(),
  beneficios: Joi.string().min(5).max(500).required(),
  precio:     Joi.number().positive().required(),
});

const updateMembresiaSchema = Joi.object({
  tipo:       Joi.string().min(3).max(50),
  beneficios: Joi.string().min(5).max(500),
  precio:     Joi.number().positive(),
}).min(1);

module.exports = {
  createMembresiaSchema,
  updateMembresiaSchema,
};
