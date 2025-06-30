const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema(
  {
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    entidadReservada: {
      tipo: { type: String, enum: ['oficina', 'sala_reunion', 'escritorio_flexible'], required: true },
      id: { type: mongoose.Schema.Types.ObjectId, required: true }
    },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
    horaInicio: { type: String, required: true },
    horaFin: { type: String, required: true },
    estado: { type: String, enum: ['pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio'], required: true, default: 'pendiente' },
    tipoReserva: { type: String, enum: ['hora', 'dia', 'semana', 'mes'], required: true },
    cantidadPersonas: { type: Number, default: 1 },
    proposito: { type: String },
    precioTotal: { type: Number, required: true },
    precioFinalPagado: { type: Number, required: true }, 
    descuento: {
      porcentaje: { type: Number, default: 0 },
      codigo: { type: String },
      motivo: { type: String }
    },
    pagoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pago' },
    aprobador: {
      necesitaAprobacion: { type: Boolean, default: false },
      usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
      fechaAprobacion: { type: Date },
      notas: { type: String }
    },
    esRecurrente: { type: Boolean, default: false },
    recurrencia: {
      frecuencia: { type: String, enum: ['diaria', 'semanal', 'mensual'] },
      diasSemana: [{ type: String, enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] }],
      fechaFinRecurrencia: { type: Date }
    },
    serviciosAdicionales: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReservaServicio' }]
  },
  {
    timestamps: true,
  }
);

reservaSchema.index({ usuarioId: 1, fechaInicio: 1 });
reservaSchema.index({ clienteId: 1, fechaInicio: 1 }); 
reservaSchema.index({ 'entidadReservada.tipo': 1, 'entidadReservada.id': 1 });
reservaSchema.index({ estado: 1 });

module.exports = reservaSchema;