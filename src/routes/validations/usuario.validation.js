const Joi = require("joi");

// Validación para método de pago tipo tarjeta
const metodoPagoTarjetaSchema = Joi.object({
  predeterminado: Joi.boolean().default(false),
  tipo: Joi.string().valid('tarjeta_credito', 'tarjeta_debito').required(),
  numero: Joi.string()
    .pattern(/^\d{13,19}$/)
    .required()
    .messages({
      'string.pattern.base': 'El número de tarjeta debe tener entre 13 y 19 dígitos'
    }),
  titular: Joi.string().min(2).max(100).required(),
  fechaVencimiento: Joi.string()
    .pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'La fecha de vencimiento debe tener el formato MM/AA'
    }),
  cvc: Joi.string()
    .pattern(/^\d{3,4}$/)
    .required()
    .messages({
      'string.pattern.base': 'El CVC debe tener 3 o 4 dígitos'
    }),
  marca: Joi.string()
    .valid('visa', 'mastercard', 'american_express', 'discover', 'otro')
    .optional()
});

// Validación para método de pago tipo cuenta bancaria
const metodoPagoCuentaSchema = Joi.object({
  predeterminado: Joi.boolean().default(false),
  tipo: Joi.string().valid('cuenta_bancaria').required(),
  banco: Joi.string().min(2).max(100).required(),
  numeroCuenta: Joi.string()
    .pattern(/^\d{10,20}$/)
    .required()
    .messages({
      'string.pattern.base': 'El número de cuenta debe tener entre 10 y 20 dígitos'
    }),
  titular: Joi.string().min(2).max(100).required(),
  tipoCuenta: Joi.string()
    .valid('corriente', 'ahorros', 'nomina')
    .required()
});

// Esquema general para método de pago
const metodoPagoSchema = Joi.alternatives().try(
  metodoPagoTarjetaSchema,
  metodoPagoCuentaSchema
);

const createUsuarioSchema = Joi.object({
  tipoUsuario: Joi.string()
    .valid('usuario', 'proveedor', 'cliente', 'administrador')
    .required(),
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  nombre: Joi.string().optional(),
  apellidos: Joi.string().optional(),
  imagen: Joi.string().uri().optional(),

  datosPersonales: Joi.object({
    telefono: Joi.string().optional(),
    documentoIdentidad: Joi.string().optional(),
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

  // ← CAMBIO: Nueva validación para métodos de pago
  metodoPago: Joi.array().items(metodoPagoSchema).optional(),

  activo: Joi.boolean().default(true),
  verificado: Joi.boolean().default(false),
  rol: Joi.string()
    .valid('usuario', 'proveedor', 'cliente', 'administrador')
    .default("usuario"),
});

const updateUsuarioSchema = Joi.object({
  nombre: Joi.string(),
  apellidos: Joi.string(),
  imagen: Joi.string().uri(),
  datosPersonales: Joi.object({
    telefono: Joi.string(),
    documentoIdentidad: Joi.string(),
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
  // ← CAMBIO: Permitir actualizar métodos de pago
  metodoPago: Joi.array().items(metodoPagoSchema).optional(),
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
  nuevoRol: Joi.string().valid('usuario', 'proveedor', 'cliente', 'administrador').required()
});

// ← NUEVO: Esquemas específicos para métodos de pago
const addMetodoPagoSchema = metodoPagoSchema;

const updateMetodoPagoSchema = Joi.object({
  metodoPagoId: Joi.string().required(),
  predeterminado: Joi.boolean(),
  activo: Joi.boolean(),
  titular: Joi.string().min(2).max(100),
  fechaVencimiento: Joi.string().pattern(/^(0[1-9]|1[0-2])\/\d{2}$/),
  banco: Joi.string().min(2).max(100),
  tipoCuenta: Joi.string().valid('corriente', 'ahorros', 'nomina')
}).min(2); // Requiere al menos metodoPagoId y un campo más

const deleteMetodoPagoSchema = Joi.object({
  metodoPagoId: Joi.string().required()
});

module.exports = {
  createUsuarioSchema,
  updateUsuarioSchema,
  loginSchema,
  cambiarRolSchema,
  addMetodoPagoSchema,
  updateMetodoPagoSchema,
  deleteMetodoPagoSchema
};