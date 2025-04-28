const Joi = require("joi");

const createReservaServicioSchema = Joi.object({
  usuarioId: Joi.string().required(),
  servicioId: Joi.string().required(),
  reservaEspacioId: Joi.string(),
  fecha: Joi.date().required(),
  horaInicio: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  horaFin: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  cantidad: Joi.number().integer().min(1).default(1),
  instrucciones: Joi.string(),
  estado: Joi.string().valid('pendiente', 'confirmado', 'cancelado', 'completado').default('pendiente'),
  precioTotal: Joi.number().min(0).required(),
  pagoId: Joi.string()
});

const updateReservaServicioSchema = Joi.object({
  fecha: Joi.date(),
  horaInicio: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  horaFin: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  cantidad: Joi.number().integer().min(1),
  instrucciones: Joi.string(),
  estado: Joi.string().valid('pendiente', 'confirmado', 'cancelado', 'completado'),
  pagoId: Joi.string()
}).min(1);

const aprobarRechazarReservaServicioSchema = Joi.object({
  reservaServicioId: Joi.string().required(),
  accion: Joi.string().valid('aprobar', 'rechazar').required(),
  motivoRechazo: Joi.string().when('accion', {
    is: 'rechazar',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

const filtrarReservasServicioSchema = Joi.object({
  usuarioId: Joi.string(),
  servicioId: Joi.string(),
  reservaEspacioId: Joi.string(),
  estado: Joi.string().valid('pendiente', 'confirmado', 'cancelado', 'completado'),
  fechaDesde: Joi.date(),
  fechaHasta: Joi.date()
});

module.exports = {
  createReservaServicioSchema,
  updateReservaServicioSchema,
  aprobarRechazarReservaServicioSchema,
  filtrarReservasServicioSchema
};