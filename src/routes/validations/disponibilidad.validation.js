const Joi = require("joi");

const createDisponibilidadSchema = Joi.object({
  entidadId: Joi.string().required(),
  tipoEntidad: Joi.string().valid('oficina', 'sala_reunion', 'escritorio_flexible').required(),
  fechaDisponibilidad: Joi.date().required(),
  franjas: Joi.array().items(
    Joi.object({
      horaInicio: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      horaFin: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      disponible: Joi.boolean().default(true),
      reservaId: Joi.string().allow(null),
      bloqueado: Joi.boolean().default(false),
      motivo: Joi.string().allow(null)
    })
  ).required()
});

const updateDisponibilidadSchema = Joi.object({
  franjas: Joi.array().items(
    Joi.object({
      horaInicio: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      horaFin: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      disponible: Joi.boolean(),
      reservaId: Joi.string(),
      bloqueado: Joi.boolean(),
      motivo: Joi.string()
    })
  )
}).min(1);

const consultarDisponibilidadSchema = Joi.object({
  entidadId: Joi.string().required(),
  tipoEntidad: Joi.string().valid('oficina', 'sala_reunion', 'escritorio_flexible').required(),
  fechaInicio: Joi.date().required(),
  fechaFin: Joi.date().required(),
  horaInicio: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  horaFin: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
});

const bloquearFranjaHorariaSchema = Joi.object({
  entidadId: Joi.string().required(),
  tipoEntidad: Joi.string().valid('oficina', 'sala_reunion', 'escritorio_flexible').required(),
  fecha: Joi.date().required(),
  horaInicio: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  horaFin: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  motivo: Joi.string().required(),
  recurrente: Joi.boolean().default(false),
  diasRecurrencia: Joi.array().items(
    Joi.string().valid('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')
  ).when('recurrente', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  fechaFinRecurrencia: Joi.date().when('recurrente', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

module.exports = {
  createDisponibilidadSchema,
  updateDisponibilidadSchema,
  consultarDisponibilidadSchema,
  bloquearFranjaHorariaSchema
};