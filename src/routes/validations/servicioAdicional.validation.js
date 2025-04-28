const Joi = require("joi");

const createServicioAdicionalSchema = Joi.object({
  nombre: Joi.string().required(),
  descripcion: Joi.string().required(),
  tipo: Joi.string().valid('catering', 'limpieza', 'recepcion', 'parking', 'impresion', 'otro').required(),
  precio: Joi.number().min(0).required(),
  unidadPrecio: Joi.string().valid('por_uso', 'por_hora', 'por_persona', 'por_dia').default('por_uso'),
  disponibilidad: Joi.object({
    diasDisponibles: Joi.array().items(
      Joi.string().valid('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')
    ),
    horaInicio: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    horaFin: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  }),
  tiempoAnticipacion: Joi.number().integer().min(0),
  requiereAprobacion: Joi.boolean().default(false),
  imagen: Joi.string().uri(),
  proveedorId: Joi.string(),
  activo: Joi.boolean().default(true),
  espaciosDisponibles: Joi.array().items(Joi.string())
});

const updateServicioAdicionalSchema = Joi.object({
  nombre: Joi.string(),
  descripcion: Joi.string(),
  precio: Joi.number().min(0),
  unidadPrecio: Joi.string().valid('por_uso', 'por_hora', 'por_persona', 'por_dia'),
  disponibilidad: Joi.object({
    diasDisponibles: Joi.array().items(
      Joi.string().valid('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')
    ),
    horaInicio: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    horaFin: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  }),
  tiempoAnticipacion: Joi.number().integer().min(0),
  requiereAprobacion: Joi.boolean(),
  imagen: Joi.string().uri(),
  activo: Joi.boolean(),
  espaciosDisponibles: Joi.array().items(Joi.string())
}).min(1);

const filtrarServiciosAdicionalesSchema = Joi.object({
  tipo: Joi.string().valid('catering', 'limpieza', 'recepcion', 'parking', 'impresion', 'otro'),
  precioMaximo: Joi.number().min(0),
  unidadPrecio: Joi.string().valid('por_uso', 'por_hora', 'por_persona', 'por_dia'),
  diaDisponible: Joi.string().valid('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'),
  proveedorId: Joi.string(),
  espacioId: Joi.string(),
  requiereAprobacion: Joi.boolean()
});

module.exports = {
  createServicioAdicionalSchema,
  updateServicioAdicionalSchema,
  filtrarServiciosAdicionalesSchema
};