const Joi = require("joi");

const createEmpresaInmobiliariaSchema = Joi.object({
  usuarioId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  nombre: Joi.string().required(),
  tipo: Joi.string().valid('inmobiliaria', 'propietario_directo', 'administrador_edificio').required(),
  descripcion: Joi.string(),
  contacto: Joi.object({
    nombreContacto: Joi.string().required(),
    email: Joi.string().email().required(),
    telefono: Joi.string().required(),
    cargo: Joi.string()
  }).required(),
  identificacionFiscal: Joi.string().required(),
  direccion: Joi.object({
    calle: Joi.string().required(),
    ciudad: Joi.string().required(),
    codigoPostal: Joi.string().required(),
    pais: Joi.string().required()
  }).required(),
  sitioWeb: Joi.string().uri(),
  logoUrl: Joi.string().uri({ scheme: ['http', 'https'] }).message('URL del logo debe ser válida (http/https)'),
  imagenes: Joi.array().items(
    Joi.string().uri({ scheme: ['http', 'https'] }).message('URL de imagen debe ser válida (http/https)')
  ).max(8).messages({
    'array.max': 'Máximo 8 imágenes permitidas'
  }),
  comision: Joi.number().min(0).default(0),
  metodoPago: Joi.object({
    titular: Joi.string(),
    iban: Joi.string(),
    swift: Joi.string()
  }),
  espacios: Joi.array().items(Joi.string()),
  activo: Joi.boolean().default(true),
  verificado: Joi.boolean().default(false)
});

const updateEmpresaInmobiliariaSchema = Joi.object({
  nombre: Joi.string(),
  descripcion: Joi.string(),
  contacto: Joi.object({
    nombreContacto: Joi.string(),
    email: Joi.string().email(),
    telefono: Joi.string(),
    cargo: Joi.string()
  }),
  direccion: Joi.object({
    calle: Joi.string(),
    ciudad: Joi.string(),
    codigoPostal: Joi.string(),
    pais: Joi.string()
  }),
  sitioWeb: Joi.string().uri(),
  logoUrl: Joi.string().uri({ scheme: ['http', 'https'] }).message('URL del logo debe ser válida (http/https)'),
  imagenes: Joi.array().items(
    Joi.string().uri({ scheme: ['http', 'https'] }).message('URL de imagen debe ser válida (http/https)')
  ).max(8).messages({
    'array.max': 'Máximo 8 imágenes permitidas'
  }),
  comision: Joi.number().min(0),
  metodoPago: Joi.object({
    titular: Joi.string(),
    iban: Joi.string(),
    swift: Joi.string()
  }),
  espacios: Joi.array().items(Joi.string()),
  activo: Joi.boolean(),
  verificado: Joi.boolean()
}).min(1);

const verificarEmpresaSchema = Joi.object({
  empresaId: Joi.string().required(),
  documentosVerificacion: Joi.array().items(
    Joi.object({
      tipo: Joi.string().valid('licencia', 'documento_fiscal', 'certificado_empresa', 'otro').required(),
      url: Joi.string().uri().required(),
      descripcion: Joi.string()
    })
  ).min(1).required(),
  notas: Joi.string()
});

module.exports = {
  createEmpresaInmobiliariaSchema,
  updateEmpresaInmobiliariaSchema,
  verificarEmpresaSchema
};