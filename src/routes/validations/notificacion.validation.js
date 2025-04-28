const Joi = require("joi");

const createNotificacionSchema = Joi.object({
  tipoNotificacion: Joi.string().valid('reserva', 'pago', 'sistema', 'recordatorio', 'promocion').required(),
  titulo: Joi.string().required(),
  mensaje: Joi.string().required(),
  destinatarioId: Joi.string().required(),
  remitenteId: Joi.string(),
  entidadRelacionada: Joi.object({
    tipo: Joi.string().valid('reserva', 'pago', 'oficina', 'usuario', 'membresia'),
    id: Joi.string()
  }),
  accion: Joi.string(),
  prioridad: Joi.string().valid('baja', 'media', 'alta').default('media'),
  expirar: Joi.date()
});

const updateNotificacionSchema = Joi.object({
  mensaje: Joi.string(),
  leido: Joi.boolean(),
  fechaLeido: Joi.date(),
  accion: Joi.string(),
  prioridad: Joi.string().valid('baja', 'media', 'alta')
}).min(1);

const marcarLeidaSchema = Joi.object({
  notificacionId: Joi.string().required(),
  usuarioId: Joi.string().required()
});

const filtrarNotificacionesSchema = Joi.object({
  destinatarioId: Joi.string(),
  tipoNotificacion: Joi.string().valid('reserva', 'pago', 'sistema', 'recordatorio', 'promocion'),
  leido: Joi.boolean(),
  prioridad: Joi.string().valid('baja', 'media', 'alta'),
  desde: Joi.date(),
  hasta: Joi.date()
});

module.exports = {
  createNotificacionSchema,
  updateNotificacionSchema,
  marcarLeidaSchema,
  filtrarNotificacionesSchema
};