const Joi = require("joi");

const createReservaSchema = Joi.object({
  usuarioId: Joi.string().required(),
  clienteId: Joi.string().required(), 
  entidadReservada: Joi.object({
    tipo: Joi.string().valid('oficina', 'sala_reunion', 'escritorio_flexible').required(),
    id: Joi.string().required()
  }).required(),
  fechaInicio: Joi.date().required(),
  fechaFin: Joi.date().required(),
  horaInicio: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  horaFin: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  estado: Joi.string().valid('pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio').default('pendiente'),
  tipoReserva: Joi.string().valid('hora', 'dia', 'semana', 'mes').required(),
  cantidadPersonas: Joi.number().integer().min(1).default(1),
  proposito: Joi.string(),
  precioTotal: Joi.number().min(0).required(),
  precioFinalPagado: Joi.number().min(0).required(), 
  descuento: Joi.object({
    porcentaje: Joi.number().min(0).max(100).default(0),
    codigo: Joi.string(),
    motivo: Joi.string()
  }),
  pagoId: Joi.string(),
  aprobador: Joi.object({
    necesitaAprobacion: Joi.boolean().default(false),
    usuarioId: Joi.string(),
    fechaAprobacion: Joi.date(),
    notas: Joi.string()
  }),
  esRecurrente: Joi.boolean().default(false),
  recurrencia: Joi.object({
    frecuencia: Joi.string().valid('diaria', 'semanal', 'mensual'),
    diasSemana: Joi.array().items(
      Joi.string().valid('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')
    ),
    fechaFinRecurrencia: Joi.date()
  }).when('esRecurrente', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  serviciosAdicionales: Joi.array().items(Joi.string())
});

const updateReservaSchema = Joi.object({
  clienteId: Joi.string(), 
  fechaInicio: Joi.date(),
  fechaFin: Joi.date(),
  horaInicio: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  horaFin: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  estado: Joi.string().valid('pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio'),
  cantidadPersonas: Joi.number().integer().min(1),
  proposito: Joi.string(),
  precioFinalPagado: Joi.number().min(0), 
  pagoId: Joi.string(),
  aprobador: Joi.object({
    necesitaAprobacion: Joi.boolean(),
    usuarioId: Joi.string(),
    fechaAprobacion: Joi.date(),
    notas: Joi.string()
  }),
  serviciosAdicionales: Joi.array().items(Joi.string())
}).min(1);

const filtrarReservasSchema = Joi.object({
  usuarioId: Joi.string(),
  clienteId: Joi.string(), 
  tipoEntidad: Joi.string().valid('oficina', 'sala_reunion', 'escritorio_flexible'),
  entidadId: Joi.string(),
  estado: Joi.string().valid('pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio'),
  fechaInicio: Joi.date(),
  fechaFin: Joi.date(),
  esRecurrente: Joi.boolean(),
  precioMinimo: Joi.number().min(0), 
  precioMaximo: Joi.number().min(0) 
});

const cancelarReservaSchema = Joi.object({
  reservaId: Joi.string().required(),
  motivo: Joi.string().required(),
  solicitarReembolso: Joi.boolean().default(false)
});

module.exports = {
  createReservaSchema,
  updateReservaSchema,
  filtrarReservasSchema,
  cancelarReservaSchema
};