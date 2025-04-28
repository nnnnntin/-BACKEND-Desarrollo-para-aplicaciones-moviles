const Joi = require("joi");

const createEspacioSchema = Joi.object({
  nombre: Joi.string().required(),
  tipo: Joi.string().valid('oficina', 'sala_reunion', 'escritorio_flexible', 'otro').required(),
  ubicacion: Joi.object({
    edificioId: Joi.string(),
    piso: Joi.number(),
    sector: Joi.string(),
    coordenadas: Joi.object({
      lat: Joi.number(),
      lng: Joi.number()
    })
  }),
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
  imagenes: Joi.array().items(Joi.string().uri()),
  estado: Joi.string().valid('disponible', 'ocupado', 'mantenimiento', 'reservado').default('disponible'),
  propietarioId: Joi.string(),
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
      lat: Joi.number(),
      lng: Joi.number()
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
  imagenes: Joi.array().items(Joi.string().uri()),
  estado: Joi.string().valid('disponible', 'ocupado', 'mantenimiento', 'reservado'),
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
  diaDisponible: Joi.string().valid('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')
});

module.exports = {
  createEspacioSchema,
  updateEspacioSchema,
  filtrarEspaciosSchema
};