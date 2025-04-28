const mongoose = require("mongoose");

const notificacionSchema = new mongoose.Schema(
  {
    tipoNotificacion: { type: String, enum: ['reserva', 'pago', 'sistema', 'recordatorio', 'promocion'], required: true },
    titulo: { type: String, required: true },
    mensaje: { type: String, required: true },
    destinatarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    remitenteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    leido: { type: Boolean, default: false },
    fechaLeido: { type: Date },
    entidadRelacionada: {
      tipo: { type: String, enum: ['reserva', 'pago', 'oficina', 'usuario', 'membresia'] },
      id: { type: mongoose.Schema.Types.ObjectId }
    },
    accion: { type: String }, // Acción a realizar: "aprobar", "rechazar", "pagar", etc.
    prioridad: { type: String, enum: ['baja', 'media', 'alta'], default: 'media' },
    expirar: { type: Date } // Fecha en que la notificación ya no es relevante
  },
  {
    timestamps: true,
  }
);

module.exports = notificacionSchema;