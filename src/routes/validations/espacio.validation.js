const Joi = require("joi");

const ubicacionEspacioSchema = Joi.object({
  edificioId: Joi.string().required(),
  piso: Joi.number().required(),
  sector: Joi.string().required(),
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

const createEspacioSchema = Joi.object({
  nombre: Joi.string().required(),
  tipo: Joi.string().valid('oficina', 'sala_reunion', 'escritorio_flexible', 'otro').required(),
  ubicacion: ubicacionEspacioSchema.required(),
  capacidad: Joi.number().integer().min(1).required(),
  amenidades: Joi.array().items(Joi.string()),
  disponibilidad: Joi.object({
    horarioApertura: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    horarioCierre: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    diasDisponibles: Joi.array().items(
      Joi.string().valid('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')
    )
  }),
  precios: Joi.object({
    porHora: Joi.number().min(0),
    porDia: Joi.number().min(0),
    porMes: Joi.number().min(0)
  }),
  // ← VALIDACIÓN MEJORADA PARA IMÁGENES
  imagenes: Joi.array().items(
    Joi.string().uri({ scheme: ['http', 'https'] }).message('URL de imagen debe ser válida (http/https)')
  ).max(12).messages({
    'array.max': 'Máximo 12 imágenes permitidas'
  }),
  estado: Joi.string().valid('disponible', 'ocupado', 'mantenimiento', 'reservado').default('disponible'),
  usuarioId: Joi.string().required(),
  empresaInmobiliariaId: Joi.string(),
  activo: Joi.boolean().default(true)
});

const updateEspacioSchema = Joi.object({
  nombre: Joi.string(),
  tipo: Joi.string().valid('oficina', 'sala_reunion', 'escritorio_flexible', 'otro'),
  ubicacion: Joi.object({
    edificioId: Joi.string(),
    piso: Joi.number(),
    sector: Joi.string(),
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
  amenidades: Joi.array().items(Joi.string()),
  disponibilidad: Joi.object({
    horarioApertura: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    horarioCierre: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    diasDisponibles: Joi.array().items(
      Joi.string().valid('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')
    )
  }),
  precios: Joi.object({
    porHora: Joi.number().min(0),
    porDia: Joi.number().min(0),
    porMes: Joi.number().min(0)
  }),
  // ← VALIDACIÓN MEJORADA PARA IMÁGENES EN UPDATE
  imagenes: Joi.array().items(
    Joi.string().uri({ scheme: ['http', 'https'] }).message('URL de imagen debe ser válida (http/https)')
  ).max(12).messages({
    'array.max': 'Máximo 12 imágenes permitidas'
  }),
  estado: Joi.string().valid('disponible', 'ocupado', 'mantenimiento', 'reservado'),
  usuarioId: Joi.string(),
  empresaInmobiliariaId: Joi.string(),
  activo: Joi.boolean()
}).min(1);

const filtrarEspaciosSchema = Joi.object({
  tipo: Joi.string().valid('oficina', 'sala_reunion', 'escritorio_flexible', 'otro'),
  edificioId: Joi.string(),
  piso: Joi.number(),
  capacidadMinima: Joi.number().integer().min(1),
  precioMaximo: Joi.number().min(0),
  estado: Joi.string().valid('disponible', 'ocupado', 'mantenimiento', 'reservado'),
  amenidades: Joi.array().items(Joi.string()),
  diaDisponible: Joi.string().valid('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'),
  ciudad: Joi.string(),
  departamento: Joi.string(),
  pais: Joi.string(),
  lat: Joi.number().min(-90).max(90),
  lng: Joi.number().min(-180).max(180),
  radioKm: Joi.number().min(0)
});

module.exports = {
  createEspacioSchema,
  updateEspacioSchema,
  filtrarEspaciosSchema
};