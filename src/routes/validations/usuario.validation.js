const Joi = require("joi");

const signupSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  username: Joi.string().min(3).max(20).required(),
  password: Joi.string().min(3).max(20).alphanum().required(),
  active: Joi.boolean().default(true)
});

const loginSchema = Joi.object({
  username: Joi.string().min(3).max(20).required(),
  password: Joi.string().min(3).max(20).required(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  username: Joi.string().min(3).max(20),
  password: Joi.string().min(3).max(20).alphanum(),
  active: Joi.boolean()
}).min(1);

module.exports = {
  signupSchema,
  loginSchema,
  updateUserSchema
};
