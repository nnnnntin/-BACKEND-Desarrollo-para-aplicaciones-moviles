const Joi = require("joi");

const createResenaSchema = Joi.object({
  usuarioId: Joi.string().required(),
  entidadResenada: Joi.object({
    tipo: Joi.string().valid('oficina', 'espacio', 'servicio').required(),
    id: Joi.string().required()
  }).required(),
  reservaId: Joi.string(),
  titulo: Joi.string(),
  comentario: Joi.string().required(),
  calificacion: Joi.number().integer().min(1).max(5).required(),
  aspectosEvaluados: Joi.object({
    limpieza: Joi.number().integer().min(1).max(5),
    ubicacion: Joi.number().integer().min(1).max(5),
    servicios: Joi.number().integer().min(1).max(5),
    relacionCalidadPrecio: Joi.number().integer().min(1).max(5)
  }),
  imagenes: Joi.array().items(Joi.string().uri()),
  estado: Joi.string().valid('pendiente', 'aprobada', 'rechazada').default('pendiente')
});

const updateResenaSchema = Joi.object({
  titulo: Joi.string(),
  comentario: Joi.string(),
  calificacion: Joi.number().integer().min(1).max(5),
  aspectosEvaluados: Joi.object({
    limpieza: Joi.number().integer().min(1).max(5),
    ubicacion: Joi.number().integer().min(1).max(5),
    servicios: Joi.number().integer().min(1).max(5),
    relacionCalidadPrecio: Joi.number().integer().min(1).max(5)
  }),
  imagenes: Joi.array().items(Joi.string().uri()),
  estado: Joi.string().valid('pendiente', 'aprobada', 'rechazada')
}).min(1);

const responderResenaSchema = Joi.object({
  resenaId: Joi.string().required(),
  usuarioId: Joi.string().required(),
  texto: Joi.string().required()
});

const moderarResenaSchema = Joi.object({
  resenaId: Joi.string().required(),
  estado: Joi.string().valid('aprobada', 'rechazada').required(),
  motivo: Joi.string().when('estado', {
    is: 'rechazada',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

module.exports = {
  createResenaSchema,
  updateResenaSchema,
  responderResenaSchema,
  moderarResenaSchema
};