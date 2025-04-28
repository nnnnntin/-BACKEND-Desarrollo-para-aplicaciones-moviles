const Joi = require("joi");

const createFacturaSchema = Joi.object({
  numeroFactura: Joi.string().required(),
  usuarioId: Joi.string().required(),
  emisorId: Joi.string().required(),
  tipoEmisor: Joi.string().valid('plataforma', 'inmobiliaria', 'proveedor').required(),
  fechaEmision: Joi.date().required(),
  fechaVencimiento: Joi.date().required(),
  conceptos: Joi.array().items(
    Joi.object({
      descripcion: Joi.string().required(),
      cantidad: Joi.number().min(1).required(),
      precioUnitario: Joi.number().min(0).required(),
      impuesto: Joi.number().min(0).max(100).default(0),
      descuento: Joi.number().min(0).max(100).default(0),
      subtotal: Joi.number().min(0).required()
    })
  ).min(1).required(),
  subtotal: Joi.number().min(0).required(),
  impuestosTotal: Joi.number().min(0).required(),
  descuentoTotal: Joi.number().min(0).default(0),
  total: Joi.number().min(0).required(),
  estado: Joi.string().valid('pendiente', 'pagada', 'vencida', 'cancelada').default('pendiente'),
  metodoPago: Joi.string(),
  pdfUrl: Joi.string().uri(),
  pagosIds: Joi.array().items(Joi.string())
});

const updateFacturaSchema = Joi.object({
  fechaVencimiento: Joi.date(),
  conceptos: Joi.array().items(
    Joi.object({
      descripcion: Joi.string().required(),
      cantidad: Joi.number().min(1).required(),
      precioUnitario: Joi.number().min(0).required(),
      impuesto: Joi.number().min(0).max(100),
      descuento: Joi.number().min(0).max(100),
      subtotal: Joi.number().min(0).required()
    })
  ),
  subtotal: Joi.number().min(0),
  impuestosTotal: Joi.number().min(0),
  descuentoTotal: Joi.number().min(0),
  total: Joi.number().min(0),
  estado: Joi.string().valid('pendiente', 'pagada', 'vencida', 'cancelada'),
  metodoPago: Joi.string(),
  pdfUrl: Joi.string().uri(),
  pagosIds: Joi.array().items(Joi.string())
}).min(1);

const filtrarFacturasSchema = Joi.object({
  usuarioId: Joi.string(),
  emisorId: Joi.string(),
  tipoEmisor: Joi.string().valid('plataforma', 'inmobiliaria', 'proveedor'),
  estado: Joi.string().valid('pendiente', 'pagada', 'vencida', 'cancelada'),
  fechaEmisionDesde: Joi.date(),
  fechaEmisionHasta: Joi.date(),
  fechaVencimientoDesde: Joi.date(),
  fechaVencimientoHasta: Joi.date(),
  montoMinimo: Joi.number().min(0),
  montoMaximo: Joi.number().min(0)
});

const generarPdfFacturaSchema = Joi.object({
  facturaId: Joi.string().required(),
  plantillaId: Joi.string(),
  incluyeLogo: Joi.boolean().default(true),
  idioma: Joi.string().default('es')
});

module.exports = {
  createFacturaSchema,
  updateFacturaSchema,
  filtrarFacturasSchema,
  generarPdfFacturaSchema
};