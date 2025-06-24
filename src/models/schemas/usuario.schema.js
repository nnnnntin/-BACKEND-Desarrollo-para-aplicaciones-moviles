const Joi = require("joi");

// ========== ESQUEMA SIMPLE PARA MÉTODO DE PAGO (COMPATIBLE CON TU SCHEMA) ==========
const metodoPagoSchema = Joi.object({
  id: Joi.string().optional(), // Se genera automáticamente
  predeterminado: Joi.boolean().default(false),
  tipo: Joi.string()
    .valid('tarjeta', 'paypal', 'cuenta_bancaria')
    .optional(), // Mantenemos opcional como en tu schema
  ultimosDigitos: Joi.string().optional(), // Mantenemos opcional como en tu schema
  fechaExpiracion: Joi.string().optional(), // Mantenemos opcional como en tu schema
  // Campos adicionales mínimos
  nombreTitular: Joi.string().optional(),
  marca: Joi.string().optional() // visa, mastercard, etc.
});

const createUsuarioSchema = Joi.object({
  tipoUsuario: Joi.string()
    .valid('usuario', 'proveedor', 'cliente', 'administrador')
    .required(),
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  nombre: Joi.string().optional(),
  apellidos: Joi.string().optional(),
  imagen: Joi.string().uri().optional(), // ← CAMBIO: Campo imagen principal

  datosPersonales: Joi.object({
    telefono: Joi.string().optional(),
    documentoIdentidad: Joi.string().optional(),
    // ← CAMBIO: REMOVIDO fotoUrl de aquí para evitar conflictos
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

  // ========== VALIDACIÓN SIMPLE DE MÉTODOS DE PAGO ==========
  metodoPago: Joi.array()
    .items(metodoPagoSchema)
    .optional()
    .default([]),

  activo: Joi.boolean().default(true),
  verificado: Joi.boolean().default(false),
  rol: Joi.string()
    .valid("usuario", "editor", "administrador", "superadmin")
    .default("usuario"),
});

const updateUsuarioSchema = Joi.object({
  nombre: Joi.string(),
  apellidos: Joi.string(),
  imagen: Joi.string().uri(), // ← CAMBIO: Campo imagen principal
  datosPersonales: Joi.object({
    telefono: Joi.string(),
    documentoIdentidad: Joi.string(),
    // ← CAMBIO: REMOVIDO fotoUrl de aquí también
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
  // ========== VALIDACIÓN SIMPLE DE MÉTODOS DE PAGO EN ACTUALIZACIÓN ==========
  metodoPago: Joi.array()
    .items(metodoPagoSchema)
    .optional(),
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

// ========== NUEVO ESQUEMA SIMPLE PARA AGREGAR MÉTODO DE PAGO ==========
const agregarMetodoPagoSchema = Joi.object({
  tipo: Joi.string()
    .valid('tarjeta', 'paypal', 'cuenta_bancaria')
    .required(),
  ultimosDigitos: Joi.string()
    .required()
    .messages({
      'any.required': 'Los últimos dígitos son requeridos'
    }),
  fechaExpiracion: Joi.string().optional(),
  nombreTitular: Joi.string().optional(),
  marca: Joi.string().optional(),
  predeterminado: Joi.boolean().default(false)
});

module.exports = {
  createUsuarioSchema,
  updateUsuarioSchema,
  loginSchema,
  cambiarRolSchema,
  // Nuevos esquemas para métodos de pago
  metodoPagoSchema,
  agregarMetodoPagoSchema
};