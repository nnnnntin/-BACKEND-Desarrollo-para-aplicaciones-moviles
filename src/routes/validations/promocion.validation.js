const Joi = require("joi");

const createPromocionSchema = Joi.object({
  nombre: Joi.string().required(),
  descripcion: Joi.string().required(),
  codigo: Joi.string().required(),
  tipo: Joi.string().valid('porcentaje', 'monto_fijo', 'gratuito').required(),
  valor: Joi.number().min(0).required(),
  fechaInicio: Joi.date().required(),
  fechaFin: Joi.date().required(),
  limiteCupos: Joi.number().integer().min(1),
  usosActuales: Joi.number().integer().min(0).default(0),
  limiteUsuario: Joi.number().integer().min(1).default(1),
  aplicableA: Joi.object({
    entidad: Joi.string().valid('oficina', 'sala_reunion', 'escritorio_flexible', 'membresia', 'servicio'),
    ids: Joi.array().items(Joi.string())
  }),
  activo: Joi.boolean().default(true)
});

const updatePromocionSchema = Joi.object({
  nombre: Joi.string(),
  descripcion: Joi.string(),
  tipo: Joi.string().valid('porcentaje', 'monto_fijo', 'gratuito'),
  valor: Joi.number().min(0),
  fechaInicio: Joi.date(),
  fechaFin: Joi.date(),
  limiteCupos: Joi.number().integer().min(1),
  usosActuales: Joi.number().integer().min(0),
  limiteUsuario: Joi.number().integer().min(1),
  aplicableA: Joi.object({
    entidad: Joi.string().valid('oficina', 'sala_reunion', 'escritorio_flexible', 'membresia', 'servicio'),
    ids: Joi.array().items(Joi.string())
  }),
  activo: Joi.boolean()
}).min(1);

const validarCodigoPromocionSchema = Joi.object({
  codigo: Joi.string().required(),
  usuarioId: Joi.string().required(),
  entidadTipo: Joi.string().valid('oficina', 'sala_reunion', 'escritorio_flexible', 'membresia', 'servicio').required(),
  entidadId: Joi.string().required(),
  fecha: Joi.date().default(Date.now)
});

const filtrarPromocionesSchema = Joi.object({
  activo: Joi.boolean(),
  tipo: Joi.string().valid('porcentaje', 'monto_fijo', 'gratuito'),
  entidadTipo: Joi.string().valid('oficina', 'sala_reunion', 'escritorio_flexible', 'membresia', 'servicio'),
  entidadId: Joi.string(),
  vigente: Joi.boolean(),
  fechaDesde: Joi.date(),
  fechaHasta: Joi.date()
});

module.exports = {
  createPromocionSchema,
  updatePromocionSchema,
  validarCodigoPromocionSchema,
  filtrarPromocionesSchema
};