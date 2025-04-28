const Joi = require("joi");

const createEscritorioFlexibleSchema = Joi.object({
  codigo: Joi.string().required(),
  ubicacion: Joi.object({
    edificioId: Joi.string().required(),
    piso: Joi.number().required(),
    zona: Joi.string().required(),
    numero: Joi.string().required()
  }).required(),
  tipo: Joi.string().valid('individual', 'compartido', 'standing').default('individual'),
  amenidades: Joi.array().items(
    Joi.object({
      tipo: Joi.string().valid('monitor', 'teclado', 'mouse', 'reposapiés', 'lampara', 'otro'),
      descripcion: Joi.string()
    })
  ),
  precios: Joi.object({
    porHora: Joi.number().min(0),
    porDia: Joi.number().min(0).required(),
    porSemana: Joi.number().min(0),
    porMes: Joi.number().min(0)
  }).required(),
  imagenes: Joi.array().items(Joi.string().uri()),
  estado: Joi.string().valid('disponible', 'ocupado', 'mantenimiento', 'reservado').default('disponible'),
  propietarioId: Joi.string(),
  empresaInmobiliariaId: Joi.string(),
  activo: Joi.boolean().default(true)
});

const updateEscritorioFlexibleSchema = Joi.object({
  ubicacion: Joi.object({
    edificioId: Joi.string(),
    piso: Joi.number(),
    zona: Joi.string(),
    numero: Joi.string()
  }),
  tipo: Joi.string().valid('individual', 'compartido', 'standing'),
  amenidades: Joi.array().items(
    Joi.object({
      tipo: Joi.string().valid('monitor', 'teclado', 'mouse', 'reposapiés', 'lampara', 'otro'),
      descripcion: Joi.string()
    })
  ),
  precios: Joi.object({
    porHora: Joi.number().min(0),
    porDia: Joi.number().min(0),
    porSemana: Joi.number().min(0),
    porMes: Joi.number().min(0)
  }),
  imagenes: Joi.array().items(Joi.string().uri()),
  estado: Joi.string().valid('disponible', 'ocupado', 'mantenimiento', 'reservado'),
  activo: Joi.boolean()
}).min(1);

const filtrarEscritoriosFlexiblesSchema = Joi.object({
  edificioId: Joi.string(),
  piso: Joi.number(),
  zona: Joi.string(),
  tipo: Joi.string().valid('individual', 'compartido', 'standing'),
  amenidades: Joi.array().items(Joi.string()),
  precioMaximoPorDia: Joi.number().min(0),
  estado: Joi.string().valid('disponible', 'ocupado', 'mantenimiento', 'reservado')
});

module.exports = {
  createEscritorioFlexibleSchema,
  updateEscritorioFlexibleSchema,
  filtrarEscritoriosFlexiblesSchema
};