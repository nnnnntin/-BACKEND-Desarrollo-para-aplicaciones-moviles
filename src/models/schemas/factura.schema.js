const mongoose = require("mongoose");

const facturaSchema = new mongoose.Schema(
  {
    numeroFactura: { type: String, required: true, unique: true },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    emisorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    tipoEmisor: { type: String, enum: ['plataforma', 'inmobiliaria', 'proveedor'], required: true },
    fechaEmision: { type: Date, required: true },
    fechaVencimiento: { type: Date, required: true },
    conceptos: [{
      descripcion: { type: String, required: true },
      cantidad: { type: Number, required: true },
      precioUnitario: { type: Number, required: true },
      impuesto: { type: Number, default: 0 },
      descuento: { type: Number, default: 0 },
      subtotal: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    impuestosTotal: { type: Number, required: true },
    descuentoTotal: { type: Number, default: 0 },
    total: { type: Number, required: true },
    estado: { type: String, enum: ['pendiente', 'pagada', 'vencida', 'cancelada'], default: 'pendiente' },
    metodoPago: { type: String },
    pdfUrl: { type: String },
    pagosIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pago' }]
  },
  {
    timestamps: true,
  }
);

module.exports = facturaSchema;