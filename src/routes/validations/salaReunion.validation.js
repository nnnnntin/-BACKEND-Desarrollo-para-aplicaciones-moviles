const Joi = require("joi");
const mongoose = require("mongoose");

const joiObjectIdString = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid', { message: 'ID debe ser un ObjectId válido de MongoDB' });
  }
  return value;
}, 'validación de ObjectId');

const ubicacionSchema = Joi.object({
  edificioId: joiObjectIdString.required(),
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

const createSalaReunionSchema = Joi.object({
  nombre: Joi.string().required(),
  codigo: Joi.string().required(),
  ubicacion: ubicacionSchema.required(),
  capacidad: Joi.number().integer().min(1).required(),
  equipamiento: Joi.array().items(
    Joi.object({
      tipo: Joi.string().valid('proyector', 'videoconferencia', 'pizarra', 'tv', 'otro'),
      descripcion: Joi.string()
    })
  ),
  configuracion: Joi.string().valid('mesa_redonda', 'auditorio', 'en_u', 'aula', 'flexible'),
  precios: Joi.object({
    porHora: Joi.number().min(0).required(),
    mediaDia: Joi.number().min(0),
    diaDompleto: Joi.number().min(0)
  }).required(),
  imagenes: Joi.array().items(
    Joi.string().uri({ scheme: ['http', 'https'] }).message('URL de imagen debe ser válida (http/https)')
  ).max(10).messages({
    'array.max': 'Máximo 10 imágenes permitidas'
  }),
  disponibilidad: Joi.object({
    horario: Joi.object({
      apertura: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default("09:00"),
      cierre: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default("18:00")
    }),
    dias: Joi.array().items(
      Joi.string().valid('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')
    )
  }),
  usuarioId: joiObjectIdString.required(),
  empresaInmobiliariaId: joiObjectIdString,
  estado: Joi.string().valid('disponible', 'ocupada', 'mantenimiento', 'reservada').default('disponible'),
  activo: Joi.boolean().default(true)
});

const updateSalaReunionSchema = Joi.object({
  nombre: Joi.string(),
  ubicacion: Joi.object({
    edificioId: joiObjectIdString,
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
  equipamiento: Joi.array().items(
    Joi.object({
      tipo: Joi.string().valid('proyector', 'videoconferencia', 'pizarra', 'tv', 'otro'),
      descripcion: Joi.string()
    })
  ),
  configuracion: Joi.string().valid('mesa_redonda', 'auditorio', 'en_u', 'aula', 'flexible'),
  precios: Joi.object({
    porHora: Joi.number().min(0),
    mediaDia: Joi.number().min(0),
    diaDompleto: Joi.number().min(0)
  }),
  imagenes: Joi.array().items(
    Joi.string().uri({ scheme: ['http', 'https'] }).message('URL de imagen debe ser válida (http/https)')
  ).max(10).messages({
    'array.max': 'Máximo 10 imágenes permitidas'
  }),
  disponibilidad: Joi.object({
    horario: Joi.object({
      apertura: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      cierre: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    }),
    dias: Joi.array().items(
      Joi.string().valid('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')
    )
  }),
  usuarioId: joiObjectIdString,
  empresaInmobiliariaId: joiObjectIdString,
  estado: Joi.string().valid('disponible', 'ocupada', 'mantenimiento', 'reservada'),
  activo: Joi.boolean()
}).min(1);

const filtrarSalasReunionSchema = Joi.object({
  edificioId: joiObjectIdString,
  capacidadMinima: Joi.number().integer().min(1),
  equipamiento: Joi.array().items(Joi.string()),
  configuracion: Joi.string().valid('mesa_redonda', 'auditorio', 'en_u', 'aula', 'flexible'),
  precioMaximoPorHora: Joi.number().min(0),
  estado: Joi.string().valid('disponible', 'ocupada', 'mantenimiento', 'reservada'),
  fechaDisponibilidad: Joi.date(),
  ciudad: Joi.string(),
  departamento: Joi.string(),
  pais: Joi.string(),
  lat: Joi.number().min(-90).max(90),
  lng: Joi.number().min(-180).max(180),
  radioKm: Joi.number().min(0)
});

module.exports = {
  createSalaReunionSchema,
  updateSalaReunionSchema,
  filtrarSalasReunionSchema
};