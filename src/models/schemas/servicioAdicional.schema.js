const mongoose = require("mongoose");

const servicioAdicionalSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    tipo: { type: String, enum: ['catering', 'limpieza', 'recepcion', 'parking', 'impresion', 'otro'], required: true },
    precio: { type: Number, required: true },
    unidadPrecio: { type: String, enum: ['por_uso', 'por_hora', 'por_persona', 'por_dia'], default: 'por_uso' },
    disponibilidad: {
      diasDisponibles: [{ type: String, enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] }],
      horaInicio: { type: String },
      horaFin: { type: String }
    },
    tiempoAnticipacion: { type: Number }, // Horas de anticipación para solicitar
    requiereAprobacion: { type: Boolean, default: false },
    imagen: { type: String },
    proveedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor' },
    activo: { type: Boolean, default: true },
    espaciosDisponibles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Espacio' }]
  },
  {
    timestamps: true,
  }
);

module.exports = servicioAdicionalSchema;