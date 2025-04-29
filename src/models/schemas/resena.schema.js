const mongoose = require("mongoose");

const resenaSchema = new mongoose.Schema(
  {
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    entidadResenada: {
      tipo: { type: String, enum: ['oficina', 'espacio', 'servicio'], required: true },
      id: { type: mongoose.Schema.Types.ObjectId, required: true }
    },
    reservaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reserva' },
    titulo: { type: String },
    comentario: { type: String, required: true },
    calificacion: { type: Number, required: true, min: 1, max: 5 },
    aspectosEvaluados: {
      limpieza: { type: Number, min: 1, max: 5 },
      ubicacion: { type: Number, min: 1, max: 5 },
      servicios: { type: Number, min: 1, max: 5 },
      relacionCalidadPrecio: { type: Number, min: 1, max: 5 }
    },
    imagenes: [{ type: String }],
    estado: { type: String, enum: ['pendiente', 'aprobada', 'rechazada'], default: 'pendiente' },
    respuesta: {
      usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
      texto: { type: String },
      fecha: { type: Date }
    }
  },
  {
    timestamps: true,
  }
);

module.exports = resenaSchema;