const Joi = require("joi");

const createMembresiaSchema = Joi.object({
  nombre: Joi.string().required(),
  tipo: Joi.string().valid('basico', 'estandar', 'premium', 'empresarial').required(),
  descripcion: Joi.string().required(),
  beneficios: Joi.array().items(
    Joi.object({
      tipo: Joi.string().required(),
      descripcion: Joi.string().required(),
      valor: Joi.string()
    })
  ),
  precio: Joi.object({
    valor: Joi.number().min(0).required(),
    periodicidad: Joi.string().valid('mensual', 'trimestral', 'anual').default('mensual')
  }).required(),
  duracion: Joi.number().integer().min(1).default(30),
  activo: Joi.boolean().default(true),
  restricciones: Joi.string()
});

const updateMembresiaSchema = Joi.object({
  nombre: Joi.string(),
  descripcion: Joi.string(),
  beneficios: Joi.array().items(
    Joi.object({
      tipo: Joi.string().required(),
      descripcion: Joi.string().required(),
      valor: Joi.string()
    })
  ),
  precio: Joi.object({
    valor: Joi.number().min(0),
    periodicidad: Joi.string().valid('mensual', 'trimestral', 'anual')
  }),
  duracion: Joi.number().integer().min(1),
  activo: Joi.boolean(),
  restricciones: Joi.string()
}).min(1);

const suscribirMembresiaSchema = Joi.object({
  usuarioId: Joi.string().required(),
  membresiaId: Joi.string().required(),
  fechaInicio: Joi.date().default(Date.now),
  metodoPagoId: Joi.string().required(),
  renovacionAutomatica: Joi.boolean().default(false),
  codigoPromocional: Joi.string()
});

const cancelarMembresiaSchema = Joi.object({
  usuarioId: Joi.string().required(),
  membresiaId: Joi.string().required(),
  motivo: Joi.string(),
  fechaCancelacion: Joi.date().default(Date.now),
  reembolsoParcial: Joi.boolean().default(false)
});

module.exports = {
  createMembresiaSchema,
  updateMembresiaSchema,
  suscribirMembresiaSchema,
  cancelarMembresiaSchema
};