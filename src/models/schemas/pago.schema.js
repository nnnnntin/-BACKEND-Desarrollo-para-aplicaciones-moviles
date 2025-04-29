const mongoose = require("mongoose");

const pagoSchema = new mongoose.Schema(
  {
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    monto: { type: Number, required: true },
    moneda: { type: String, default: 'USD' },
    conceptoPago: { type: String, enum: ['reserva', 'membresia', 'multa', 'otro'], required: true },
    entidadRelacionada: {
      tipo: { type: String, enum: ['reserva', 'membresia'], required: true },
      id: { type: mongoose.Schema.Types.ObjectId, required: true }
    },
    fecha: { type: Date, required: true },
    metodoPago: {
      tipo: { type: String, enum: ['tarjeta', 'transferencia', 'efectivo', 'paypal', 'otro'], required: true },
      detalles: { type: Object }
    },
    estado: { type: String, enum: ['pendiente', 'completado', 'fallido', 'reembolsado'], default: 'pendiente' },
    comprobante: { type: String },
    facturaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Factura' }
  },
  {
    timestamps: true,
  }
);

module.exports = pagoSchema;