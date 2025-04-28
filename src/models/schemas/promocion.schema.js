const mongoose = require("mongoose");

const promocionSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    codigo: { type: String, required: true, unique: true },
    tipo: { type: String, enum: ['porcentaje', 'monto_fijo', 'gratuito'], required: true },
    valor: { type: Number, required: true }, // Porcentaje de descuento o monto fijo
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
    limiteCupos: { type: Number }, // Número máximo de veces que se puede usar
    usosActuales: { type: Number, default: 0 },
    limiteUsuario: { type: Number, default: 1 }, // Veces que un usuario puede usar la promoción
    aplicableA: {
      entidad: { type: String, enum: ['oficina', 'sala_reunion', 'escritorio_flexible', 'membresia', 'servicio'] },
      ids: [{ type: mongoose.Schema.Types.ObjectId }] // IDs específicos a los que aplica
    },
    activo: { type: Boolean, default: true }
  },
  {
    timestamps: true,
  }
);

module.exports = promocionSchema;