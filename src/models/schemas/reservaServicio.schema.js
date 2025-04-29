const mongoose = require("mongoose");

const reservaServicioSchema = new mongoose.Schema(
  {
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    servicioId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServicioAdicional', required: true },
    reservaEspacioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reserva' },
    fecha: { type: Date, required: true },
    horaInicio: { type: String },
    horaFin: { type: String },
    cantidad: { type: Number, default: 1 },
    instrucciones: { type: String },
    estado: { type: String, enum: ['pendiente', 'confirmado', 'cancelado', 'completado'], default: 'pendiente' },
    precioTotal: { type: Number, required: true },
    pagoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pago' }
  },
  {
    timestamps: true,
  }
);

module.exports = reservaServicioSchema;