const Joi = require("joi");

// ========== ESQUEMA PARA VALIDAR UN MÉTODO DE PAGO INDIVIDUAL ==========
const metodoPagoSchema = Joi.object({
  id: Joi.string().optional(),
  predeterminado: Joi.boolean().default(false),
  tipo: Joi.string()
    .valid('tarjeta', 'paypal', 'cuenta_bancaria')
    .required()
    .messages({
      'any.only': 'El tipo debe ser: tarjeta, paypal o cuenta_bancaria'
    }),
  ultimosDigitos: Joi.string()
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Los últimos dígitos deben ser exactamente 4 números',
      'any.required': 'Los últimos dígitos son requeridos'
    }),
  fechaExpiracion: Joi.string()
    .pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .when('tipo', {
      is: 'tarjeta',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'string.pattern.base': 'La fecha de expiración debe tener formato MM/YY',
      'any.required': 'La fecha de expiración es requerida para tarjetas'
    }),
  nombreTitular: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'El nombre del titular debe tener al menos 2 caracteres',
      'string.max': 'El nombre del titular no puede exceder 100 caracteres'
    }),
  marca: Joi.string()
    .valid('visa', 'mastercard', 'american express', 'amex', 'discover', 'otros')
    .default('otros')
    .messages({
      'any.only': 'La marca debe ser: visa, mastercard, american express, amex, discover u otros'
    }),
  activo: Joi.boolean().default(true),
  fechaCreacion: Joi.date().default(Date.now),
  ultimoUso: Joi.date().optional()
});

// ========== VALIDACIÓN PERSONALIZADA PARA MÉTODOS DE PAGO ==========
const validarMetodosPago = (metodosPago, helpers) => {
  if (!metodosPago || !Array.isArray(metodosPago)) {
    return metodosPago;
  }

  // Validar que solo haya un método predeterminado
  const predeterminados = metodosPago.filter(mp => mp.predeterminado);
  if (predeterminados.length > 1) {
    return helpers.error('metodoPago.multiple.predeterminado');
  }

  // Validar que no haya duplicados por último dígitos y tipo
  const combinaciones = new Set();
  for (const metodo of metodosPago) {
    const clave = `${metodo.tipo}-${metodo.ultimosDigitos}`;
    if (combinaciones.has(clave)) {
      return helpers.error('metodoPago.duplicado');
    }
    combinaciones.add(clave);
  }

  // Validar fechas de expiración no vencidas para tarjetas
  const fechaActual = new Date();
  for (const metodo of metodosPago) {
    if (metodo.tipo === 'tarjeta' && metodo.fechaExpiracion) {
      const [mes, año] = metodo.fechaExpiracion.split('/');
      const añoCompleto = 2000 + parseInt(año);
      const fechaTarjeta = new Date(añoCompleto, parseInt(mes) - 1);
      
      if (fechaTarjeta < fechaActual) {
        return helpers.error('metodoPago.tarjeta.vencida');
      }
    }
  }

  return metodosPago;
};

// ========== ESQUEMA PRINCIPAL PARA CREAR USUARIO ==========
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

  // ========== VALIDACIÓN DE MÉTODOS DE PAGO ==========
  metodoPago: Joi.array()
    .items(metodoPagoSchema)
    .optional()
    .default([])
    .custom(validarMetodosPago)
    .messages({
      'metodoPago.multiple.predeterminado': 'Solo puede haber un método de pago predeterminado',
      'metodoPago.duplicado': 'No puede haber métodos de pago duplicados (mismo tipo y últimos dígitos)',
      'metodoPago.tarjeta.vencida': 'No se puede agregar una tarjeta vencida'
    }),

  activo: Joi.boolean().default(true),
  verificado: Joi.boolean().default(false),
  rol: Joi.string()
    .valid("usuario", "editor", "administrador", "superadmin")
    .default("usuario"),
});

// ========== ESQUEMA PARA ACTUALIZAR USUARIO ==========
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
  // ========== VALIDACIÓN DE MÉTODOS DE PAGO EN ACTUALIZACIÓN ==========
  metodoPago: Joi.array()
    .items(metodoPagoSchema)
    .optional()
    .custom(validarMetodosPago)
    .messages({
      'metodoPago.multiple.predeterminado': 'Solo puede haber un método de pago predeterminado',
      'metodoPago.duplicado': 'No puede haber métodos de pago duplicados (mismo tipo y últimos dígitos)',
      'metodoPago.tarjeta.vencida': 'No se puede agregar una tarjeta vencida'
    }),
  password: Joi.string().min(8),
  activo: Joi.boolean(),
  verificado: Joi.boolean()
}).min(1);

// ========== ESQUEMA PARA LOGIN ==========
const loginSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().required()
});

// ========== ESQUEMA PARA CAMBIAR ROL ==========
const cambiarRolSchema = Joi.object({
  usuarioId: Joi.string().required(),
  nuevoRol: Joi.string().valid('usuario', 'editor', 'administrador', 'superadmin').required()
});

// ========== NUEVOS ESQUEMAS PARA MÉTODOS DE PAGO ==========

// Esquema para agregar un método de pago
const agregarMetodoPagoSchema = Joi.object({
  tipo: Joi.string()
    .valid('tarjeta', 'paypal', 'cuenta_bancaria')
    .required()
    .messages({
      'any.only': 'El tipo debe ser: tarjeta, paypal o cuenta_bancaria',
      'any.required': 'El tipo de método de pago es requerido'
    }),
  ultimosDigitos: Joi.string()
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Los últimos dígitos deben ser exactamente 4 números',
      'any.required': 'Los últimos dígitos son requeridos'
    }),
  fechaExpiracion: Joi.string()
    .pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .when('tipo', {
      is: 'tarjeta',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'string.pattern.base': 'La fecha de expiración debe tener formato MM/YY',
      'any.required': 'La fecha de expiración es requerida para tarjetas'
    }),
  nombreTitular: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'El nombre del titular debe tener al menos 2 caracteres',
      'string.max': 'El nombre del titular no puede exceder 100 caracteres'
    }),
  marca: Joi.string()
    .valid('visa', 'mastercard', 'american express', 'amex', 'discover', 'otros')
    .default('otros'),
  predeterminado: Joi.boolean().default(false)
}).custom((value, helpers) => {
  // Validar fecha de expiración no vencida para tarjetas
  if (value.tipo === 'tarjeta' && value.fechaExpiracion) {
    const [mes, año] = value.fechaExpiracion.split('/');
    const añoCompleto = 2000 + parseInt(año);
    const fechaTarjeta = new Date(añoCompleto, parseInt(mes) - 1);
    const fechaActual = new Date();
    
    if (fechaTarjeta < fechaActual) {
      return helpers.error('metodoPago.tarjeta.vencida');
    }
  }
  
  return value;
}).messages({
  'metodoPago.tarjeta.vencida': 'No se puede agregar una tarjeta vencida'
});

// Esquema para actualizar método predeterminado
const actualizarMetodoPredeterminadoSchema = Joi.object({
  metodoId: Joi.string().required().messages({
    'any.required': 'El ID del método de pago es requerido'
  })
});

// Esquema para eliminar método de pago
const eliminarMetodoPagoSchema = Joi.object({
  metodoId: Joi.string().required().messages({
    'any.required': 'El ID del método de pago es requerido'
  })
});

// ========== VALIDACIONES AUXILIARES ==========

// Validar que un usuario tenga al menos un método de pago activo (para operaciones críticas)
const validarUsuarioTieneMetodoPago = (usuario) => {
  if (!usuario.metodoPago || usuario.metodoPago.length === 0) {
    return { valido: false, mensaje: 'El usuario debe tener al menos un método de pago registrado' };
  }
  
  const metodosActivos = usuario.metodoPago.filter(mp => mp.activo);
  if (metodosActivos.length === 0) {
    return { valido: false, mensaje: 'El usuario debe tener al menos un método de pago activo' };
  }
  
  return { valido: true };
};

// Validar que existe un método predeterminado
const validarMetodoPredeterminado = (metodosPago) => {
  if (!metodosPago || metodosPago.length === 0) {
    return { valido: false, mensaje: 'No hay métodos de pago registrados' };
  }
  
  const predeterminado = metodosPago.find(mp => mp.predeterminado && mp.activo);
  if (!predeterminado) {
    return { valido: false, mensaje: 'No hay un método de pago predeterminado activo' };
  }
  
  return { valido: true, metodoPredeterminado: predeterminado };
};

module.exports = {
  createUsuarioSchema,
  updateUsuarioSchema,
  loginSchema,
  cambiarRolSchema,
  // Nuevos esquemas para métodos de pago
  metodoPagoSchema,
  agregarMetodoPagoSchema,
  actualizarMetodoPredeterminadoSchema,
  eliminarMetodoPagoSchema,
  // Validaciones auxiliares
  validarUsuarioTieneMetodoPago,
  validarMetodoPredeterminado
};