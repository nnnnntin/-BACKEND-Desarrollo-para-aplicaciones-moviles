const Joi = require("joi");

const ubicacionOficinaSchema = Joi.object({
  edificioId: Joi.string().required(),
  piso: Joi.number().required(),
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

const createOficinaSchema = Joi.object({
  nombre: Joi.string().required(),
  codigo: Joi.string().required(),
  tipo: Joi.string().valid('privada', 'compartida', 'coworking').default('privada'),
  ubicacion: ubicacionOficinaSchema.required(),
  capacidad: Joi.number().integer().min(1).required(),
  superficieM2: Joi.number().positive(),
  amenidades: Joi.array().items(Joi.string()),
  imagenes: Joi.array().items(
    Joi.string().uri({ scheme: ['http', 'https'] }).message('URL de imagen debe ser válida (http/https)')
  ).max(12).messages({
    'array.max': 'Máximo 12 imágenes permitidas'
  }),
  planoUrl: Joi.string().uri({ scheme: ['http', 'https'] }).message('URL del plano debe ser válida (http/https)'),
  disponibilidad: Joi.object({
    horario: Joi.object({
      apertura: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default("09:00"),
      cierre: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default("18:00")
    }),
    dias: Joi.array().items(
      Joi.string().valid('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')
    )
  }),
  precios: Joi.object({
    porHora: Joi.number().min(0),
    porDia: Joi.number().min(0),
    porMes: Joi.number().min(0)
  }),
  estado: Joi.string().valid('disponible', 'ocupada', 'mantenimiento', 'reservada').default('disponible'),
  usuarioId: Joi.string().required(),
  empresaInmobiliariaId: Joi.string(),
  activo: Joi.boolean().default(true)
});

const updateOficinaSchema = Joi.object({
  nombre: Joi.string(),
  tipo: Joi.string().valid('privada', 'compartida', 'coworking'),
  ubicacion: Joi.object({
    edificioId: Joi.string(),
    piso: Joi.number(),
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
  capacidad: Joi.number().integer().min(1),
  superficieM2: Joi.number().positive(),
  amenidades: Joi.array().items(Joi.string()),
  imagenes: Joi.array().items(
    Joi.string().uri({ scheme: ['http', 'https'] }).message('URL de imagen debe ser válida (http/https)')
  ).max(12).messages({
    'array.max': 'Máximo 12 imágenes permitidas'
  }),
  planoUrl: Joi.string().uri({ scheme: ['http', 'https'] }).message('URL del plano debe ser válida (http/https)'),
  disponibilidad: Joi.object({
    horario: Joi.object({
      apertura: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      cierre: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    }),
    dias: Joi.array().items(
      Joi.string().valid('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')
    )
  }),
  precios: Joi.object({
    porHora: Joi.number().min(0),
    porDia: Joi.number().min(0),
    porMes: Joi.number().min(0)
  }),
  estado: Joi.string().valid('disponible', 'ocupada', 'mantenimiento', 'reservada'),
  usuarioId: Joi.string(),
  empresaInmobiliariaId: Joi.string(),
  activo: Joi.boolean()
}).min(1);

const filtrarOficinasSchema = Joi.object({
  edificioId: Joi.string(),
  tipo: Joi.string().valid('privada', 'compartida', 'coworking'),
  capacidadMinima: Joi.number().integer().min(1),
  precioMaximo: Joi.number().min(0),
  estado: Joi.string().valid('disponible', 'ocupada', 'mantenimiento', 'reservada'),
  fechaDisponibilidad: Joi.date(),
  amenidades: Joi.array().items(Joi.string()),
  ciudad: Joi.string(),
  departamento: Joi.string(),
  pais: Joi.string(),
  lat: Joi.number().min(-90).max(90),
  lng: Joi.number().min(-180).max(180),
  radioKm: Joi.number().min(0)
});

module.exports = {
  createOficinaSchema,
  updateOficinaSchema,
  filtrarOficinasSchema
};