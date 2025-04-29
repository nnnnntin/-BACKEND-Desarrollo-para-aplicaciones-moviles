const mongoose = require("mongoose");

const membresiaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    tipo: { type: String, required: true, enum: ['basico', 'estandar', 'premium', 'empresarial'] },
    descripcion: { type: String, required: true },
    beneficios: [{
      tipo: { type: String, required: true },
      descripcion: { type: String, required: true },
      valor: { type: String }
    }],
    precio: {
      valor: { type: Number, required: true },
      periodicidad: { type: String, enum: ['mensual', 'trimestral', 'anual'], default: 'mensual' }
    },
    duracion: { type: Number, default: 30 },
    activo: { type: Boolean, default: true },
    restricciones: { type: String }
  },
  {
    timestamps: true,
  }
);

module.exports = membresiaSchema;