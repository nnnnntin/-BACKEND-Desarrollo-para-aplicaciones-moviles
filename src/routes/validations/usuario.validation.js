const Joi = require("joi");

const createUsuarioSchema = Joi.object({
  tipoUsuario: Joi.string()
    .valid('usuario', 'proveedor', 'cliente', 'administrador')
    .required(),
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  nombre: Joi.string().optional(),
  apellidos: Joi.string().optional(),

  datosPersonales: Joi.object({
    telefono: Joi.string().optional(),
    documentoIdentidad: Joi.string().optional(),
    fotoUrl: Joi.string().uri().optional(),
  })
    .optional()
    .default({}),

  direccion: Joi.object({
    calle: Joi.string().optional(),
    ciudad: Joi.string().optional(),
    codigoPostal: Joi.string().optional(),
    pais: Joi.string().optional(),
  })
    .optional()
    .default({}),

  datosEmpresa: Joi.object({
    nombreEmpresa: Joi.string().optional(),
    cargo: Joi.string().optional(),
    nifCif: Joi.string().optional(),
    sitioWeb: Joi.string().uri().optional(),
    logoUrl: Joi.string().uri().optional()
  }).optional(),

  preferencias: Joi.object({
    idiomaPreferido: Joi.string().default("es"),
    monedaPreferida: Joi.string().default("USD"),
    notificaciones: Joi.object({
      email: Joi.boolean().default(true),
      push: Joi.boolean().default(true),
      sms: Joi.boolean().default(false),
    }).default(),
  })
    .optional()
    .default(),

  activo: Joi.boolean().default(true),
  verificado: Joi.boolean().default(false),
  rol: Joi.string()
    .valid("usuario", "editor", "administrador", "superadmin")
    .default("usuario"),
});

const updateUsuarioSchema = Joi.object({
  nombre: Joi.string(),
  apellidos: Joi.string(),
  datosPersonales: Joi.object({
    telefono: Joi.string(),
    documentoIdentidad: Joi.string(),
    fotoUrl: Joi.string().uri()
  }),
  direccion: Joi.object({
    calle: Joi.string(),
    ciudad: Joi.string(),
    codigoPostal: Joi.string(),
    pais: Joi.string()
  }),
  datosEmpresa: Joi.object({
    nombreEmpresa: Joi.string(),
    cargo: Joi.string(),
    nifCif: Joi.string(),
    sitioWeb: Joi.string().uri(),
    logoUrl: Joi.string().uri()
  }),
  preferencias: Joi.object({
    idiomaPreferido: Joi.string(),
    monedaPreferida: Joi.string(),
    notificaciones: Joi.object({
      email: Joi.boolean(),
      push: Joi.boolean(),
      sms: Joi.boolean()
    })
  }),
  password: Joi.string().min(8),
  activo: Joi.boolean(),
  verificado: Joi.boolean()
}).min(1);

const loginSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().required()
});

const cambiarRolSchema = Joi.object({
  usuarioId: Joi.string().required(),
  nuevoRol: Joi.string().valid('usuario', 'editor', 'administrador', 'superadmin').required()
});

module.exports = {
  createUsuarioSchema,
  updateUsuarioSchema,
  loginSchema,
  cambiarRolSchema
};