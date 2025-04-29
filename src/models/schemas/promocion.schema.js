const mongoose = require("mongoose");

const promocionSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    codigo: { type: String, required: true, unique: true },
    tipo: { type: String, enum: ['porcentaje', 'monto_fijo', 'gratuito'], required: true },
    valor: { type: Number, required: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
    limiteCupos: { type: Number },
    usosActuales: { type: Number, default: 0 },
    limiteUsuario: { type: Number, default: 1 },
    aplicableA: {
      entidad: { type: String, enum: ['oficina', 'sala_reunion', 'escritorio_flexible', 'membresia', 'servicio'] },
      ids: [{ type: mongoose.Schema.Types.ObjectId }]
    },
    activo: { type: Boolean, default: true }
  },
  {
    timestamps: true,
  }
);

module.exports = promocionSchema;