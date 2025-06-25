const Joi = require("joi");

const ubicacionEscritorioSchema = Joi.object({
  edificioId: Joi.string().required(),
  piso: Joi.number().required(),
  zona: Joi.string().required(),
  numero: Joi.string().required(),
  coordenadas: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required()
  }).required(),
  direccionCompleta: Joi.object({
    calle: Joi.string().required(),
    numero: Joi.string().required(),
    ciudad: Joi.string().required(),
    departamento: Joi.string().required(),
    codigoPostal: Joi.string().required(),
    pais: Joi.string().required()
  }).required()
});

const createEscritorioFlexibleSchema = Joi.object({
  codigo: Joi.string().required(),
  ubicacion: ubicacionEscritorioSchema.required(),
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
  usuarioId: Joi.string().required(),
  empresaInmobiliariaId: Joi.string(),
  activo: Joi.boolean().default(true)
});

const updateEscritorioFlexibleSchema = Joi.object({
  ubicacion: Joi.object({
    edificioId: Joi.string(),
    piso: Joi.number(),
    zona: Joi.string(),
    numero: Joi.string(),
    coordenadas: Joi.object({
      lat: Joi.number().min(-90).max(90),
      lng: Joi.number().min(-180).max(180)
    }),
    direccionCompleta: Joi.object({
      calle: Joi.string(),
      numero: Joi.string(),
      ciudad: Joi.string(),
      departamento: Joi.string(),
      codigoPostal: Joi.string(),
      pais: Joi.string()
    })
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
  usuarioId: Joi.string(),
  empresaInmobiliariaId: Joi.string(),
  activo: Joi.boolean()
}).min(1);

const filtrarEscritoriosFlexiblesSchema = Joi.object({
  edificioId: Joi.string(),
  piso: Joi.number(),
  zona: Joi.string(),
  tipo: Joi.string().valid('individual', 'compartido', 'standing'),
  amenidades: Joi.array().items(Joi.string()),
  precioMaximoPorDia: Joi.number().min(0),
  estado: Joi.string().valid('disponible', 'ocupado', 'mantenimiento', 'reservado'),
  ciudad: Joi.string(),
  departamento: Joi.string(),
  pais: Joi.string(),
  lat: Joi.number().min(-90).max(90),
  lng: Joi.number().min(-180).max(180),
  radioKm: Joi.number().min(0)
});

module.exports = {
  createEscritorioFlexibleSchema,
  updateEscritorioFlexibleSchema,
  filtrarEscritoriosFlexiblesSchema
};