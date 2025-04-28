const Joi = require("joi");

const createProveedorSchema = Joi.object({
  nombre: Joi.string().required(),
  tipo: Joi.string().valid('empresa', 'autonomo', 'interno').required(),
  descripcion: Joi.string(),
  serviciosOfrecidos: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
  contacto: Joi.object({
    nombreContacto: Joi.string().required(),
    email: Joi.string().email().required(),
    telefono: Joi.string().required()
  }).required(),
  identificacionFiscal: Joi.string(),
  direccion: Joi.object({
    calle: Joi.string(),
    ciudad: Joi.string(),
    codigoPostal: Joi.string(),
    pais: Joi.string()
  }),
  metodoPago: Joi.object({
    titular: Joi.string(),
    iban: Joi.string(),
    swift: Joi.string()
  }),
  comision: Joi.number().min(0).default(0),
  activo: Joi.boolean().default(true),
  verificado: Joi.boolean().default(false)
});

const updateProveedorSchema = Joi.object({
  nombre: Joi.string(),
  descripcion: Joi.string(),
  serviciosOfrecidos: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
  contacto: Joi.object({
    nombreContacto: Joi.string(),
    email: Joi.string().email(),
    telefono: Joi.string()
  }),
  identificacionFiscal: Joi.string(),
  direccion: Joi.object({
    calle: Joi.string(),
    ciudad: Joi.string(),
    codigoPostal: Joi.string(),
    pais: Joi.string()
  }),
  metodoPago: Joi.object({
    titular: Joi.string(),
    iban: Joi.string(),
    swift: Joi.string()
  }),
  comision: Joi.number().min(0),
  activo: Joi.boolean(),
  verificado: Joi.boolean()
}).min(1);

const verificarProveedorSchema = Joi.object({
  proveedorId: Joi.string().required(),
  documentosVerificacion: Joi.array().items(
    Joi.object({
      tipo: Joi.string().valid('identificacion', 'documento_fiscal', 'certificaciones', 'otro').required(),
      url: Joi.string().uri().required(),
      descripcion: Joi.string()
    })
  ).min(1).required(),
  notas: Joi.string()
});

const filtrarProveedoresSchema = Joi.object({
  tipo: Joi.string().valid('empresa', 'autonomo', 'interno'),
  servicioOfrecido: Joi.string(),
  verificado: Joi.boolean(),
  activo: Joi.boolean()
});

module.exports = {
  createProveedorSchema,
  updateProveedorSchema,
  verificarProveedorSchema,
  filtrarProveedoresSchema
};