const Joi = require("joi");

const createOficinaSchema = Joi.object({
  nombre:    Joi.string().min(3).max(100).required(),
  ubicacion: Joi.string().min(3).max(200).required(),
  capacidad: Joi.number().integer().positive().required(),
});

const updateOficinaSchema = Joi.object({
  nombre:    Joi.string().min(3).max(100),
  ubicacion: Joi.string().min(3).max(200),
  capacidad: Joi.number().integer().positive(),
}).min(1);

module.exports = {
  createOficinaSchema,
  updateOficinaSchema,
};
