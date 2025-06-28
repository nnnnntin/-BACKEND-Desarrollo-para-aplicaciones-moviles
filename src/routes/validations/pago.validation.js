const Joi = require("joi");

const createPagoSchema = Joi.object({
  usuarioId: Joi.string().required(),
  monto: Joi.number().min(0).required(),
  moneda: Joi.string().default('USD'),
  conceptoPago: Joi.string().valid('reserva', 'membresia', 'multa', 'otro').required(),
  entidadRelacionada: Joi.object({
    tipo: Joi.string().valid('reserva', 'membresia').required(),
    id: Joi.string().required()
  }).required(),
  fecha: Joi.date().default(Date.now),
  metodoPago: Joi.object({
    tipo: Joi.string().valid('tarjeta', 'transferencia', 'efectivo', 'paypal', 'otro').required(),
    detalles: Joi.object()
  }).required(),
  estado: Joi.string().valid('pendiente', 'completado', 'fallido', 'reembolsado').default('pendiente'),
  comprobante: Joi.string(),
  facturaId: Joi.string()
});

const updatePagoSchema = Joi.object({
  estado: Joi.string().valid('pendiente', 'completado', 'fallido', 'reembolsado'),
  comprobante: Joi.string(),
  facturaId: Joi.string()
}).min(1);

const filtrarPagosSchema = Joi.object({
  usuarioId: Joi.string(),
  conceptoPago: Joi.string().valid('reserva', 'membresia', 'multa', 'otro'),
  estado: Joi.string().valid('pendiente', 'completado', 'fallido', 'reembolsado'),
  fechaDesde: Joi.date(),
  fechaHasta: Joi.date(),
  montoMinimo: Joi.number().min(0),
  montoMaximo: Joi.number().min(0)
});

const reembolsarPagoSchema = Joi.object({
  pagoId: Joi.string().required(),
  motivo: Joi.string().required(),
  montoReembolso: Joi.number().min(0).required(),
  metodoPago: Joi.object({
    tipo: Joi.string().valid('tarjeta', 'transferencia', 'efectivo', 'paypal', 'otro').required(),
    detalles: Joi.object()
  }).required()
});

module.exports = {
  createPagoSchema,
  updatePagoSchema,
  filtrarPagosSchema,
  reembolsarPagoSchema
};