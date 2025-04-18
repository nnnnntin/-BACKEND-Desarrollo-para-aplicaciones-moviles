const Joi = require("joi");

const createEspacioSchema = Joi.object({
  nombre:    Joi.string().min(3).max(100).required(),
  ubicacion: Joi.string().min(3).max(200).required(),
  capacidad: Joi.number().integer().positive().required(),
  completed: Joi.boolean().required(),
});

const updateEspacioSchema = Joi.object({
  nombre:    Joi.string().min(3).max(100),
  ubicacion: Joi.string().min(3).max(200),
  capacidad: Joi.number().integer().positive(),
  completed: Joi.boolean(),
}).min(1);

module.exports = {
  createEspacioSchema,
  updateEspacioSchema,
};
