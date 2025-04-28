const Joi = require("joi");

const createOficinaSchema = Joi.object({
  nombre: Joi.string().required(),
  codigo: Joi.string().required(),
  tipo: Joi.string().valid('privada', 'compartida', 'coworking').default('privada'),
  ubicacion: Joi.object({
    edificioId: Joi.string().required(),
    piso: Joi.number().required(),
    numero: Joi.string().required()
  }).required(),
  capacidad: Joi.number().integer().min(1).required(),
  superficieM2: Joi.number().positive(),
  amenidades: Joi.array().items(Joi.string()),
  fotosPrincipales: Joi.array().items(Joi.string().uri()),
  planoUrl: Joi.string().uri(),
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
  propietarioId: Joi.string(),
  empresaInmobiliariaId: Joi.string(),
  activo: Joi.boolean().default(true)
});

const updateOficinaSchema = Joi.object({
  nombre: Joi.string(),
  tipo: Joi.string().valid('privada', 'compartida', 'coworking'),
  ubicacion: Joi.object({
    edificioId: Joi.string(),
    piso: Joi.number(),
    numero: Joi.string()
  }),
  capacidad: Joi.number().integer().min(1),
  superficieM2: Joi.number().positive(),
  amenidades: Joi.array().items(Joi.string()),
  fotosPrincipales: Joi.array().items(Joi.string().uri()),
  planoUrl: Joi.string().uri(),
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
  activo: Joi.boolean()
}).min(1);

const filtrarOficinasSchema = Joi.object({
  edificioId: Joi.string(),
  tipo: Joi.string().valid('privada', 'compartida', 'coworking'),
  capacidadMinima: Joi.number().integer().min(1),
  precioMaximo: Joi.number().min(0),
  estado: Joi.string().valid('disponible', 'ocupada', 'mantenimiento', 'reservada'),
  fechaDisponibilidad: Joi.date(),
  amenidades: Joi.array().items(Joi.string())
});

module.exports = {
  createOficinaSchema,
  updateOficinaSchema,
  filtrarOficinasSchema
};