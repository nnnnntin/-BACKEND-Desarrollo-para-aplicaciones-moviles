const mongoose = require("mongoose");

const facturaSchema = new mongoose.Schema(
  {
    numeroFactura: { type: String, required: true, unique: true },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    emisorId: { 
      type: mongoose.Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function(v) {
          if (this.tipoEmisor === 'plataforma') {
            return typeof v === 'string' && v.length > 0;
          }
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: props => {
          if (props.instance.tipoEmisor === 'plataforma') {
            return 'EmisorId debe ser un string válido para facturas de plataforma';
          }
          return 'EmisorId debe ser un ObjectId válido para inmobiliarias y proveedores';
        }
      }
    },
    tipoEmisor: { type: String, enum: ['plataforma', 'inmobiliaria', 'proveedor'], required: true },
    fechaEmision: { type: Date, required: true },
    fechaVencimiento: { type: Date, required: true },
    conceptos: [{
      descripcion: { type: String, required: true },
      cantidad: { type: Number, required: true, min: 1 },
      precioUnitario: { type: Number, required: true, min: 0 },
      impuesto: { type: Number, default: 0, min: 0, max: 100 },
      descuento: { type: Number, default: 0, min: 0, max: 100 },
      subtotal: { type: Number, required: true, min: 0 }
    }],
    subtotal: { type: Number, required: true, min: 0 },
    impuestosTotal: { type: Number, required: true, min: 0 },
    descuentoTotal: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    estado: { type: String, enum: ['pendiente', 'pagada', 'vencida', 'cancelada'], default: 'pendiente' },
    metodoPago: { type: String },
    pdfUrl: { type: String },
    pagosIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pago' }],
    motivoCancelacion: { type: String }
  },
  {
    timestamps: true,
  }
);

facturaSchema.pre('save', function(next) {
  if (this.fechaEmision > this.fechaVencimiento) {
    return next(new Error('La fecha de emisión debe ser anterior o igual a la fecha de vencimiento'));
  }
  next();
});

facturaSchema.pre('save', function(next) {
  const calculatedSubtotal = this.conceptos.reduce((sum, concepto) => sum + concepto.subtotal, 0);
  if (Math.abs(calculatedSubtotal - this.subtotal) > 0.01) {
    return next(new Error('El subtotal no coincide con la suma de los conceptos'));
  }
  
  const calculatedTotal = this.subtotal + this.impuestosTotal - this.descuentoTotal;
  if (Math.abs(calculatedTotal - this.total) > 0.01) {
    return next(new Error('El total no coincide con el cálculo (subtotal + impuestos - descuentos)'));
  }
  
  next();
});

module.exports = mongoose.model('Factura', facturaSchema);