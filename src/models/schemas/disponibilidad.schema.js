const mongoose = require("mongoose");

const disponibilidadSchema = new mongoose.Schema(
  {
    entidadId: { type: mongoose.Schema.Types.ObjectId, required: true },
    tipoEntidad: { type: String, enum: ['oficina', 'sala_reunion', 'escritorio_flexible'], required: true },
    fechaDisponibilidad: { type: Date, required: true },
    franjas: [{
      horaInicio: { type: String, required: true }, // Formato: "HH:MM"
      horaFin: { type: String, required: true },    // Formato: "HH:MM"
      disponible: { type: Boolean, default: true },
      reservaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reserva' },
      bloqueado: { type: Boolean, default: false },
      motivo: { type: String }
    }]
  },
  {
    timestamps: true,
  }
);

module.exports = disponibilidadSchema;